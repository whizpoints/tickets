const fs = require('fs');
let code = fs.readFileSync('whatsapp-service/server.js', 'utf8');

// Fix the UI Endpoint template strings
code = code.replace(/res\.send\(\\[\s\S]*?\\\\/g, 'res.send(<!DOCTYPE html><html><head><title>WhatsApp Microservice</title><style>body{font-family:sans-serif;display:flex;justify-content:center;align-items:center;height:100vh;background:#f0f2f5;margin:0;}.card{background:white;padding:40px;border-radius:20px;box-shadow:0 10px 15px rgba(0,0,0,0.05);text-align:center;}</style></head><body><div class="card"><h2>WhatsApp Dispatcher</h2></div></body></html>);');
code = code.replace(/statusHTML = \\\n[\s\S]*?\\;/g, 'statusHTML = <div style="color: green; font-weight: bold; margin-bottom: 20px;">? Connected!</div><p>Device: </p><p>Uptime: s</p>;');
code = code.replace(/statusHTML = \\[\s\S]*?\\;/g, 'statusHTML = <div style="color: orange; font-weight: bold; margin-bottom: 20px;">Scan this QR with WhatsApp:</div><img src="" style="width: 250px; border-radius: 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);" />;');

// Fix the ping command string interpolation
code = code.replace(/await sock\.sendMessage\(msg\.key\.remoteJid, \{ text: \\Pong! Uptime: \\s\\ \}, \{ quoted: msg \}\);/g, 'const jid = msg.key.remoteJid; await sock.sendMessage(jid, { text: Pong! Uptime: s\\nYour JID is: ** }, { quoted: msg });');

// Fix the jid logic
code = code.replace(/const jid = to\.includes\('.*\\@s\.whatsapp\.net\\;/g, 'const jid = to.includes("@s.whatsapp.net") || to.includes("@g.us") ? to : ${to}@s.whatsapp.net;');

// Fix port log
code = code.replace(/console\.log\(\\Server running on port \\\\\);/g, 'console.log(Server running on port );');

fs.writeFileSync('whatsapp-service/server.js', code);
