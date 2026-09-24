require('dotenv').config();
const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const QRCode = require('qrcode');
const { usePostgresAuthState, pool } = require('./postgresAuthState');

const {
  default: makeWASocket,
  DisconnectReason,
  Browsers,
  useMultiFileAuthState,
  fetchLatestBaileysVersion
} = require('@whiskeysockets/baileys');
const pino = require('pino');

const app = express();
const port = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// API Key Middleware
const authenticateApiKey = (req, res, next) => {
  const apiKey = req.headers['x-api-key'] || req.query.api_key;
  if (!apiKey || apiKey !== process.env.BAILEYS_API_KEY) {
    return res.status(401).json({ error: 'Unauthorized: Invalid API Key' });
  }
  next();
};

// Global State
let sock = null;
let connectionState = 'connecting';
let currentQr = null;
let botDevice = null;
let cachedGroups = [];
let activeGroupId = null;
let startTime = Date.now();

// Restore active group from DB if using DB
async function loadSettings() {
  if (pool) {
    try {
      const res = await pool.query("SELECT data FROM whatsapp_auth WHERE id = 'settings'");
      if (res.rows.length > 0) activeGroupId = JSON.parse(res.rows[0].data).activeGroupId;
    } catch (e) {}
  }
}
loadSettings();

async function generateQRWithLogo(qrData) {
  try {
    return await QRCode.toDataURL(qrData, { margin: 2, scale: 8, color: { dark: '#0f172a', light: '#ffffff' } });
  } catch (err) {
    console.error('Failed to generate QR:', err);
    return null;
  }
}

async function setupWhatsApp() {
  let state, saveCreds;
  if (pool) {
    const auth = await usePostgresAuthState();
    state = auth.state;
    saveCreds = auth.saveCreds;
  } else {
    const authFolder = path.join(__dirname, 'auth_info_baileys');
    const auth = await useMultiFileAuthState(authFolder);
    state = auth.state;
    saveCreds = auth.saveCreds;
  }
  
  const { version } = await fetchLatestBaileysVersion();

  sock = makeWASocket({
    version,
    auth: state,
    printQRInTerminal: true,
    logger: pino({ level: 'silent' }),
    browser: Browsers.ubuntu('Chrome')
  });

  sock.ev.on('creds.update', saveCreds);

  sock.ev.on('connection.update', async (update) => {
    const { connection, lastDisconnect, qr } = update;

    if (qr) {
      connectionState = 'connecting';
      currentQr = await generateQRWithLogo(qr);
    }

    if (connection === 'close') {
      connectionState = 'close';
      botDevice = null;
      currentQr = null;
      
      const shouldReconnect = lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut;
      
      if (shouldReconnect) {
        setTimeout(setupWhatsApp, 3000);
      } else {
        if (pool) {
          await pool.query("DELETE FROM whatsapp_auth WHERE id != 'settings'");
        } else {
          const authFolder = path.join(__dirname, 'auth_info_baileys');
          if (fs.existsSync(authFolder)) fs.rmSync(authFolder, { recursive: true, force: true });
        }
        setupWhatsApp();
      }
    } else if (connection === 'open') {
      connectionState = 'open';
      currentQr = null;
      botDevice = { id: sock.user.id, name: sock.user.name || 'Bot' };
      try {
        const chats = await sock.groupFetchAllParticipating();
        cachedGroups = Object.values(chats).map(g => ({ id: g.id, name: g.subject }));
      } catch (err) {
        console.error('Error fetching groups:', err);
      }
    }
  });

  sock.ev.on('messages.upsert', async (m) => {
    if (m.type !== 'notify') return;
    const msg = m.messages[0];
    if (!msg.message) return;

    const replyText = msg.message.extendedTextMessage?.text || msg.message.conversation;
    if (replyText?.trim().toLowerCase() === '.ping') {
      const uptime = Math.floor((Date.now() - startTime) / 1000);
      const jid = msg.key.remoteJid;
      await sock.sendMessage(jid, { text: `Pong! Uptime: ${uptime}s\nYour JID is: *${jid}*` }, { quoted: msg });
    }
  });
}

// UI Endpoint
app.get('/', (req, res) => {
  const uptime = Math.floor((Date.now() - startTime) / 1000);
  let statusHTML = '<p>Connecting...</p>';
  
  if (connectionState === 'open') {
    statusHTML = `
      <div style="color: green; font-weight: bold; margin-bottom: 20px;">✅ Connected!</div>
      <p>Device: ${botDevice ? botDevice.id : 'Unknown'}</p>
      <p>Uptime: ${uptime}s</p>
    `;
  } else if (currentQr) {
    statusHTML = `
      <div style="color: orange; font-weight: bold; margin-bottom: 20px;">Scan this QR with WhatsApp:</div>
      <img src="${currentQr}" style="width: 250px; border-radius: 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);" />
    `;
  } else {
    statusHTML = '<p style="color: red;">Disconnected. Reconnecting...</p>';
  }

  const refreshScript = connectionState !== 'open' 
    ? '<script>setTimeout(() => window.location.reload(), 3000);</script>' 
    : '';

  res.send(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>WhatsApp Microservice</title>
        <style>
          body { font-family: sans-serif; display: flex; justify-content: center; align-items: center; height: 100vh; background: #f0f2f5; margin: 0; }
          .card { background: white; padding: 40px; border-radius: 20px; box-shadow: 0 10px 15px rgba(0,0,0,0.05); text-align: center; }
        </style>
      </head>
      <body>
        <div class="card">
          <h2>WhatsApp Dispatcher</h2>
          ${statusHTML}
        </div>
        ${refreshScript}
      </body>
    </html>
  `);
});

app.get('/api/status', authenticateApiKey, (req, res) => {
  res.json({
    connectionState,
    currentQr,
    botDevice,
    uptime: Math.floor((Date.now() - startTime) / 1000),
    groups: cachedGroups,
    activeGroupId
  });
});

app.post('/api/set-group', authenticateApiKey, async (req, res) => {
  activeGroupId = req.body.groupId;
  if (pool) {
    await pool.query("INSERT INTO whatsapp_auth (id, data) VALUES ('settings', $1) ON CONFLICT (id) DO UPDATE SET data = EXCLUDED.data", [JSON.stringify({ activeGroupId })]);
  } else {
    const settingsPath = path.join(__dirname, 'auth_info_baileys', 'settings.json');
    if (!fs.existsSync(path.join(__dirname, 'auth_info_baileys'))) fs.mkdirSync(path.join(__dirname, 'auth_info_baileys'), { recursive: true });
    fs.writeFileSync(settingsPath, JSON.stringify({ activeGroupId }));
  }
  res.json({ success: true, activeGroupId });
});

app.post('/api/send-message', authenticateApiKey, async (req, res) => {
  try {
    const { to, message, imageUrl } = req.body;
    if (!to || (!message && !imageUrl)) {
      return res.status(400).json({ error: 'Missing "to" or content payload' });
    }
    if (!sock || connectionState !== 'open') {
      return res.status(503).json({ error: 'WhatsApp is not connected' });
    }
    
    const jid = to.includes('@s.whatsapp.net') || to.includes('@g.us') ? to : `${to}@s.whatsapp.net`;
    const msgContent = imageUrl ? { image: { url: imageUrl }, caption: message } : { text: message };
    
    const result = await sock.sendMessage(jid, msgContent);
    res.json({ success: true, result });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/logout', authenticateApiKey, async (req, res) => {
  try {
    if (sock && connectionState === 'open') {
      await sock.logout();
    }
    res.json({ success: true, message: 'Logged out successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
  setupWhatsApp();
});
