require('dotenv').config();
const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const cron = require('node-cron');
const pino = require('pino');
const QRCode = require('qrcode');

const { initializeApp, cert } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');

const {
  default: makeWASocket,
  DisconnectReason,
  BufferJSON,
  initAuthCreds,
  Browsers,
  useMultiFileAuthState
} = require('@whiskeysockets/baileys');

// 1. Initialize Express
const app = express();
const port = process.env.PORT || 3001;
const allowedOrigins = process.env.ALLOWED_ORIGINS 
  ? process.env.ALLOWED_ORIGINS.split(',').map(o => o.trim())
  : ['http://localhost:3000', 'https://whizpoint.app'];

app.use(cors({ origin: allowedOrigins }));
app.use(express.json());

// 2. Initialize Firebase Admin
let db = null;
try {
  if (process.env.FIREBASE_SERVICE_ACCOUNT_BASE64) {
    // Production: Load from Base64 Environment Variable
    const serviceAccountJson = Buffer.from(process.env.FIREBASE_SERVICE_ACCOUNT_BASE64, 'base64').toString('utf8');
    const serviceAccount = JSON.parse(serviceAccountJson);
    initializeApp({ credential: cert(serviceAccount) });
    db = getFirestore();
    console.log('✅ Firebase Admin Initialized (via Base64 ENV)');
  } else {
    // Local Dev: Load from serviceAccountKey.json file
    const keyPath = path.join(__dirname, '..', 'serviceAccountKey.json');
    if (fs.existsSync(keyPath)) {
      const serviceAccount = require(keyPath);
      initializeApp({ credential: cert(serviceAccount) });
      db = getFirestore();
      console.log('✅ Firebase Admin Initialized (via JSON file)');
    } else {
      console.warn('⚠️ No Firebase Credentials found! Set FIREBASE_SERVICE_ACCOUNT_BASE64 or provide serviceAccountKey.json.');
    }
  }
} catch (e) {
  console.error('❌ Failed to initialize Firebase Admin:', e);
}

// 3. API Key Middleware
const authenticateApiKey = (req, res, next) => {
  const apiKey = req.headers['x-api-key'] || req.query.api_key;
  if (!apiKey || apiKey !== process.env.BAILEYS_API_KEY) {
    return res.status(401).json({ error: 'Unauthorized: Invalid API Key' });
  }
  next();
};

// State Variables
let sock = null;
let activeGroupId = null;
let connectionState = 'connecting'; // connecting, open, close
let currentQr = null;
let botDevice = null;
let startTime = Date.now();
let hasSentDisconnectAlert = false;

// 4. Web Dashboard (GET /)
app.get('/', (req, res) => {
  const uptime = Math.floor((Date.now() - startTime) / 1000);
  const hours = Math.floor(uptime / 3600);
  const minutes = Math.floor((uptime % 3600) / 60);
  const seconds = uptime % 60;
  const uptimeStr = `${hours}h ${minutes}m ${seconds}s`;

  let statusColor = 'bg-amber-500';
  if (connectionState === 'open') statusColor = 'bg-emerald-500';
  if (connectionState === 'close') statusColor = 'bg-red-500';

  res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Whizpoint Dispatcher | WhatsApp Engine</title>
      <script src="https://cdn.tailwindcss.com"></script>
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Space+Grotesk:wght@500;600;700&display=swap');
        body { font-family: 'Inter', sans-serif; background-color: #0f172a; color: #f8fafc; }
        h1, h2, h3 { font-family: 'Space Grotesk', sans-serif; }
        .glass { background: rgba(30, 41, 59, 0.7); backdrop-filter: blur(12px); border: 1px solid rgba(255, 255, 255, 0.1); }
      </style>
      ${connectionState !== 'open' ? '<meta http-equiv="refresh" content="5">' : ''}
    </head>
    <body class="min-h-screen flex items-center justify-center p-6 relative overflow-hidden">
      <!-- Background Elements -->
      <div class="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-emerald-500/20 rounded-full blur-[120px]"></div>
      <div class="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-cyan-500/20 rounded-full blur-[120px]"></div>

      <div class="glass w-full max-w-2xl rounded-3xl p-8 sm:p-12 relative z-10 shadow-2xl">
        <div class="flex flex-col sm:flex-row items-center sm:items-start justify-between gap-6 mb-10">
          <div>
            <h1 class="text-3xl font-bold tracking-tight text-white mb-2">WhatsApp Engine</h1>
            <p class="text-slate-400 text-sm">Powered by Baileys & Node.js</p>
          </div>
          <div class="flex items-center gap-3 px-4 py-2 bg-slate-900/50 rounded-full border border-slate-700/50 shadow-inner">
            <span class="relative flex h-3 w-3">
              ${connectionState === 'open' ? '<span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>' : ''}
              <span class="relative inline-flex rounded-full h-3 w-3 ${statusColor}"></span>
            </span>
            <span class="text-sm font-medium uppercase tracking-wider text-slate-300">
              ${connectionState}
            </span>
          </div>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-10">
          <div class="bg-slate-900/40 p-5 rounded-2xl border border-slate-800">
            <p class="text-slate-500 text-xs font-semibold uppercase tracking-wider mb-1">Uptime</p>
            <p class="text-xl font-medium text-slate-200 font-mono">${uptimeStr}</p>
          </div>
          <div class="bg-slate-900/40 p-5 rounded-2xl border border-slate-800">
            <p class="text-slate-500 text-xs font-semibold uppercase tracking-wider mb-1">Device Name</p>
            <p class="text-xl font-medium text-slate-200">${botDevice?.name || 'Not Connected'}</p>
          </div>
        </div>

        ${connectionState !== 'open' && currentQr ? `
          <div class="mt-8 flex flex-col items-center">
            <p class="text-sm text-slate-400 mb-4">Scan QR code to connect device</p>
            <div class="p-4 bg-white rounded-2xl shadow-xl">
              <img src="${currentQr}" alt="WhatsApp QR Code" class="w-64 h-64 object-contain rounded-xl" />
            </div>
          </div>
        ` : ''}

        <div class="mt-10 pt-6 border-t border-slate-800/50 flex items-center justify-between text-xs text-slate-500">
          <p>Whizpoint Dispatcher Service</p>
          <p>Port ${port}</p>
        </div>
      </div>
    </body>
    </html>
  `);
});

// API Routes
app.get('/api/status', authenticateApiKey, (req, res) => {
  res.json({
    connected: connectionState === 'open',
    state: connectionState,
    device: botDevice,
    activeGroupId,
    uptime: Math.floor((Date.now() - startTime) / 1000)
  });
});

app.post('/api/send-message', authenticateApiKey, async (req, res) => {
  try {
    const { to, message } = req.body;
    if (!to || !message) {
      return res.status(400).json({ error: 'Missing "to" or "message" in payload' });
    }
    if (!sock || connectionState !== 'open') {
      return res.status(503).json({ error: 'WhatsApp service is not connected' });
    }
    
    // Ensure 'to' is formatted correctly
    const jid = to.includes('@s.whatsapp.net') || to.includes('@g.us') 
      ? to 
      : `${to}@s.whatsapp.net`;

    const msgContent = req.body.imageUrl ? { image: { url: req.body.imageUrl }, caption: message } : { text: message }; const result = await sock.sendMessage(jid, msgContent);
    res.json({ success: true, result });
  } catch (err) {
    console.error('Send message error:', err);
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/logout', authenticateApiKey, async (req, res) => {
  try {
    if (!sock) {
      return res.status(400).json({ error: 'WhatsApp service is not running' });
    }
    console.log('🚪 Manual logout requested via API.');
    
    // Attempt graceful logout from WhatsApp servers
    if (connectionState === 'open') {
      await sock.logout();
    } else {
      // Force clear if not connected
      console.log('❌ Device not connected. Forcing session clear...');
      const settingsRef = db.collection('settings').doc('whatsapp');
      await settingsRef.set({ connected: false, qr: null, groups: [], device: null, updatedAt: new Date().toISOString() }, { merge: true });
      
      const authFolder = path.join(__dirname, 'auth_info_baileys');
      if (fs.existsSync(authFolder)) {
        fs.rmSync(authFolder, { recursive: true, force: true });
      }
      
      // Stop current socket and reconnect
      sock.end(undefined);
      setupWhatsApp();
    }
    
    res.json({ success: true, message: 'Logged out successfully. Generating new QR...' });
  } catch (err) {
    console.error('Logout error:', err);
    res.status(500).json({ error: err.message });
  }
});

// Removed custom useFirestoreAuthState due to extreme read/write quota usage (1 doc per key).
// We will now use the built-in useMultiFileAuthState.

// --- QR Generator with Centered Logo (SVG-based to avoid Canvas/node-gyp) ---
async function generateQRWithLogo(qrString) {
  try {
    // Generate an SVG string of the QR Code
    const svgString = await QRCode.toString(qrString, {
      type: 'svg',
      width: 400,
      margin: 2,
      color: {
        dark: '#0f172a',
        light: '#ffffff'
      }
    });

    // We can inject a centered logo directly into the SVG
    // The SVG viewBox is 0 0 400 400
    // We'll draw a white rounded rectangle and a cyan 'W' text element in the center
    const centerSize = 80;
    const centerPos = (400 - centerSize) / 2;
    
    const logoGroup = `
      <g>
        <rect x="${centerPos}" y="${centerPos}" width="${centerSize}" height="${centerSize}" rx="12" fill="#ffffff" />
        <image href="https://raw.githubusercontent.com/whizpoints/whizassets/refs/heads/main/favicon.png" x="${centerPos}" y="${centerPos}" width="${centerSize}" height="${centerSize}" preserveAspectRatio="xMidYMid slice" />
      </g>
    </svg>`;

    const finalSvg = svgString.replace('</svg>', logoGroup);

    // Convert to a base64 Data URL so it can be used directly in an <img> tag
    return 'data:image/svg+xml;base64,' + Buffer.from(finalSvg).toString('base64');
  } catch (error) {
    console.error('QR Generation Error:', error);
    // Fallback to basic data URL
    return QRCode.toDataURL(qrString);
  }
}

// --- Baileys Setup ---
async function setupWhatsApp() {
  if (!db) {
    console.log('Firebase not initialized. Cannot start WhatsApp Bot.');
    return;
  }

  const settingsRef = db.collection('settings').doc('whatsapp');
  const authFolder = path.join(__dirname, 'auth_info_baileys');
  const { state, saveCreds } = await useMultiFileAuthState(authFolder);
  const { version, isLatest } = await require('@whiskeysockets/baileys').fetchLatestBaileysVersion();
  console.log(`Using WA v${version.join('.')}, isLatest: ${isLatest}`);

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
      console.log('📱 QR Code received, generating image...');
      connectionState = 'connecting';
      currentQr = await generateQRWithLogo(qr);
      await settingsRef.set({ qr: currentQr, connected: false, updatedAt: new Date().toISOString() }, { merge: true });
      
      if (!hasSentDisconnectAlert) {
        hasSentDisconnectAlert = true;
        const nextjsUrl = process.env.NEXTJS_API_URL || 'https://api.whizpoint.app';
        fetch(`${nextjsUrl}/api/whatsapp/notify`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ reason: 'New QR Code generated (Device unlinked or server restarted)' })
        }).catch(err => console.error('Failed to send disconnect alert:', err));
      }
    }

    if (connection === 'close') {
      connectionState = 'close';
      botDevice = null;
      currentQr = null;
      const shouldReconnect = (lastDisconnect.error)?.output?.statusCode !== DisconnectReason.loggedOut;
      
      console.log('Connection closed due to:', lastDisconnect.error?.message, ', reconnecting:', shouldReconnect);
      
      if (shouldReconnect) {
        setTimeout(() => {
          setupWhatsApp();
        }, 3000);
      } else {
        console.log('❌ Device Logged Out. Clearing session...');
        await settingsRef.set({ connected: false, qr: null, groups: [], device: null, updatedAt: new Date().toISOString() }, { merge: true });
        
        const authFolder = path.join(__dirname, 'auth_info_baileys');
        if (fs.existsSync(authFolder)) {
          fs.rmSync(authFolder, { recursive: true, force: true });
        }

        setupWhatsApp();
      }
    } else if (connection === 'open') {
      hasSentDisconnectAlert = false;
      connectionState = 'open';
      currentQr = null;
      botDevice = { id: sock.user.id, name: sock.user.name || 'Whizpoint Bot' };
      console.log('✅ WhatsApp Client is Connected!');
      
      await settingsRef.set({ 
        qr: null, 
        connected: true, 
        device: botDevice,
        updatedAt: new Date().toISOString() 
      }, { merge: true });

      try {
        const chats = await sock.groupFetchAllParticipating();
        const groups = Object.values(chats).map(g => ({ id: g.id, name: g.subject }));
        await settingsRef.set({ groups }, { merge: true });
      } catch (err) {
        console.error('Error fetching groups:', err);
      }

      const snap = await settingsRef.get();
      if (snap.exists && snap.data().activeGroupId) {
        activeGroupId = snap.data().activeGroupId;
      }
    }
  });

  // Incoming Message Listener (Two-Way routing)
  sock.ev.on('messages.upsert', async (m) => {
    if (m.type !== 'notify') return;
    const msg = m.messages[0];
    if (!msg.message) return;

    const replyText = msg.message.extendedTextMessage?.text || msg.message.conversation;
    if (!replyText) return;

    // Handle global .ping command
    if (replyText.trim().toLowerCase() === '.ping') {
      const uptime = Math.floor((Date.now() - startTime) / 1000);
      const hours = Math.floor(uptime / 3600);
      const minutes = Math.floor((uptime % 3600) / 60);
      const seconds = uptime % 60;
      await sock.sendMessage(msg.key.remoteJid, { 
        text: `🏓 *Pong!*\n\n*Status:* ✅ Online\n*Service:* Whizpoint Engine\n*Uptime:* ${hours}h ${minutes}m ${seconds}s` 
      }, { quoted: msg });
      return;
    }

    if (!activeGroupId || msg.key.remoteJid !== activeGroupId) return;

    const quotedMsg = msg.message.extendedTextMessage?.contextInfo?.quotedMessage;

    if (quotedMsg && (quotedMsg.conversation || quotedMsg.text)) {
      const quoteText = quotedMsg.conversation || quotedMsg.text;
      const match = quoteText.match(/\[TKT-[A-Z0-9]{6}\]/i);
      
      if (match) {
        const ticketId = match[0].replace(/[\[\]]/g, '');
        console.log(`Reply Detected for ${ticketId}`);
        
        try {
          const nextjsUrl = process.env.NEXTJS_API_URL || 'http://localhost:3000';
          const response = await fetch(`${nextjsUrl}/api/tickets/reply`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              ticketId,
              replyText,
              adminEmail: 'whatsapp-bot@whizpoint.app'
            })
          });

          if (response.ok) {
            await sock.sendMessage(activeGroupId, { text: '✅ Reply sent via Email.' }, { quoted: msg });
          } else {
            const data = await response.json();
            await sock.sendMessage(activeGroupId, { text: `❌ Failed to send reply: ${data.error}` }, { quoted: msg });
          }
        } catch (e) {
          console.error('Error triggering Next.js API:', e);
          await sock.sendMessage(activeGroupId, { text: '❌ System Error: Could not reach Main API.' }, { quoted: msg });
        }
      }
    }
  });

  // Settings Listener
  if (global.settingsUnsub) global.settingsUnsub();
  global.settingsUnsub = settingsRef.onSnapshot(async snap => {
    if (!snap.exists) return;
    const data = snap.data();
    if (data.activeGroupId) {
      activeGroupId = data.activeGroupId;
    }
  });

  // New Ticket Listener
  let initialLoad = true;
  if (global.ticketsUnsub) global.ticketsUnsub();
  global.ticketsUnsub = db.collection('tickets').onSnapshot(snap => {
    if (initialLoad) {
      initialLoad = false;
      return;
    }

    snap.docChanges().forEach(async change => {
      if (change.type === 'added') {
        const ticket = change.doc.data();
        if (activeGroupId && sock && connectionState === 'open') {
          // Find the first message in the thread to display as the body
          let bodyText = '';
          if (ticket.thread && ticket.thread.length > 0) {
            bodyText = ticket.thread[0].body || '';
          }
          // Strip HTML tags for clean WhatsApp reading
          const plainBody = bodyText.replace(/<[^>]*>?/gm, '').trim();
          
          // Force WhatsApp "Read more..." using zero-width non-joiner
          const readMoreSpacer = String.fromCharCode(8206).repeat(4000);
          
          const text = `🟢 *NEW TICKET* [${ticket.ticket_id}]\n*Client:* ${ticket.sender_name || ticket.sender_email}\n*Subject:* ${ticket.subject}\n\n_Reply to this message to email the client._${readMoreSpacer}\n\n${plainBody}`;
          
          await sock.sendMessage(activeGroupId, { text });
        }
      }
    });
  });

  // Reminder Cron (Every Hour)
  cron.schedule('0 * * * *', async () => {
    if (!activeGroupId || !sock || connectionState !== 'open') return;
    const now = new Date();
    now.setHours(now.getHours() - 4); 
    
    try {
      const staleTickets = await db.collection('tickets')
        .where('status', 'in', ['open', 'in-progress'])
        .where('updated_at', '<', now.toISOString())
        .get();
        
      if (!staleTickets.empty) {
        await sock.sendMessage(activeGroupId, { text: `⚠️ *Reminder:* There are ${staleTickets.size} tickets inactive for over 4 hours.` });
      }
    } catch(e) {
      console.warn("Cron query failed.");
    }
  });
}

// Start Server & Engine
app.listen(port, () => {
  console.log(`🚀 Whizpoint WhatsApp Service running on port ${port}`);
  setupWhatsApp();
});
