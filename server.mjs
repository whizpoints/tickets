import express from 'express';
import next from 'next';
import { makeWASocket, useMultiFileAuthState, DisconnectReason, Browsers } from '@whiskeysockets/baileys';
import pino from 'pino';
import qrcode from 'qrcode';
import fs from 'fs';
import path from 'path';

const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();

let currentQR = null;
let isConnected = false;
let sock = null;

async function connectToWhatsApp() {
    const { state, saveCreds } = await useMultiFileAuthState('auth_info_baileys');

    sock = makeWASocket({
        auth: state,
        printQRInTerminal: false,
        logger: pino({ level: 'silent' }),
        browser: Browsers.ubuntu('Chrome'), // Prevent Noise Protocol Error
    });

    sock.ev.on('creds.update', saveCreds);

    sock.ev.on('connection.update', async (update) => {
        const { connection, lastDisconnect, qr } = update;

        if (qr) {
            console.log('QR Code Received, converting to image...');
            currentQR = await qrcode.toDataURL(qr);
            isConnected = false;
        }

        if (connection === 'close') {
            const shouldReconnect = lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut;
            console.log('Connection closed. Reconnecting:', shouldReconnect);
            
            isConnected = false;
            currentQR = null;

            if (shouldReconnect) {
                connectToWhatsApp();
            } else {
                console.log('Logged out from WhatsApp. Deleting auth session...');
                if (fs.existsSync('./auth_info_baileys')) {
                    fs.rmSync('./auth_info_baileys', { recursive: true, force: true });
                }
                connectToWhatsApp();
            }
        } else if (connection === 'open') {
            console.log('WhatsApp connection opened!');
            isConnected = true;
            currentQR = null;
        }
    });
}

app.prepare().then(() => {
    connectToWhatsApp();
    
    const server = express();
    
    server.use((req, res, next) => {
        res.header('Access-Control-Allow-Origin', '*');
        res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
        res.header('Access-Control-Allow-Headers', 'Content-Type');
        if (req.method === 'OPTIONS') return res.sendStatus(200);
        next();
    });

    // Native WhatsApp endpoints built into the main NextJS process!
    server.get('/api/whatsapp/status', (req, res) => {
        res.json({ isConnected, qr: currentQR });
    });

    server.post('/api/whatsapp/send', express.json(), async (req, res) => {
        const { phone, message, imageUrl } = req.body;
        if (!isConnected || !sock) {
            return res.status(400).json({ error: 'WhatsApp not connected' });
        }
        
        try {
            const formattedPhone = phone.includes('@s.whatsapp.net') ? phone : `${phone}@s.whatsapp.net`;
            if (imageUrl) {
                await sock.sendMessage(formattedPhone, { image: { url: imageUrl }, caption: message });
            } else {
                await sock.sendMessage(formattedPhone, { text: message });
            }
            res.json({ success: true });
        } catch (error) {
            console.error('Failed to send WA message:', error);
            res.status(500).json({ error: error.message });
        }
    });

    server.post('/api/whatsapp/logout', async (req, res) => {
        if (isConnected && sock) {
            await sock.logout();
            isConnected = false;
            currentQR = null;
        }
        res.json({ success: true });
    });

    // Let Next.js handle all other routes
    server.use((req, res) => {
        return handle(req, res);
    });

    const PORT = process.env.PORT || 3000;
    server.listen(PORT, (err) => {
        if (err) throw err;
        console.log(`> Ready on http://localhost:${PORT} - Unified Architecture (Next.js + Baileys)`);
    });
});
