const fs = require('fs');
let code = fs.readFileSync('whatsapp-service/server.js', 'utf8');

// Add states
code = code.replace(/let botDevice = null;/, "let botDevice = null;\nlet cachedGroups = [];\nlet activeGroupId = null;\nconst settingsPath = path.join(__dirname, 'auth_info_baileys', 'settings.json');\nif(fs.existsSync(settingsPath)){ try{ activeGroupId = JSON.parse(fs.readFileSync(settingsPath)).activeGroupId; }catch(e){} }");

// Fetch groups on connect
const groupFetchLogic = \
      botDevice = { id: sock.user.id, name: sock.user.name || 'Bot' };
      try {
        const chats = await sock.groupFetchAllParticipating();
        cachedGroups = Object.values(chats).map(g => ({ id: g.id, name: g.subject }));
      } catch (err) {
        console.error('Error fetching groups:', err);
      }
\;
code = code.replace(/botDevice = \{ id: sock\.user\.id, name: sock\.user\.name \|\| 'Bot' \};/, groupFetchLogic);

// Add /api/status and /api/set-group
const newEndpoints = \
// API Endpoints
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

app.post('/api/set-group', authenticateApiKey, (req, res) => {
  activeGroupId = req.body.groupId;
  if (!fs.existsSync(path.join(__dirname, 'auth_info_baileys'))) fs.mkdirSync(path.join(__dirname, 'auth_info_baileys'), { recursive: true });
  fs.writeFileSync(settingsPath, JSON.stringify({ activeGroupId }));
  res.json({ success: true, activeGroupId });
});
\;
code = code.replace(/\/\/ API Endpoints/, newEndpoints);

fs.writeFileSync('whatsapp-service/server.js', code);
