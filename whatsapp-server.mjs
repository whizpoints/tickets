import express from 'express';
import cors from 'cors';
import { makeWASocket, useMultiFileAuthState, DisconnectReason, Browsers } from '@whiskeysockets/baileys';
import pino from 'pino';
import qrcode from 'qrcode';
import fs from 'fs';

const app = express();
app.use(cors());
app.use(express.json());

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
            console.log('Connection closed due to', lastDisconnect?.error?.message, ', reconnecting:', shouldReconnect);
            
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

connectToWhatsApp();

// API Endpoints for Next.js to call
app.get('/status', (req, res) => {
    res.json({ isConnected, qr: currentQR });
});

app.post('/send', async (req, res) => {
    const { phone, message } = req.body;
    if (!isConnected || !sock) {
        return res.status(400).json({ error: 'WhatsApp not connected' });
    }
    
    try {
        const formattedPhone = phone.includes('@s.whatsapp.net') ? phone : `${phone}@s.whatsapp.net`;
        await sock.sendMessage(formattedPhone, { text: message });
        res.json({ success: true });
    } catch (error) {
        console.error('Failed to send WA message:', error);
        res.status(500).json({ error: error.message });
    }
});

app.post('/logout', async (req, res) => {
    if (isConnected && sock) {
        await sock.logout();
        isConnected = false;
        currentQR = null;
        res.json({ success: true });
    } else {
        res.json({ success: false, message: 'Not connected' });
    }
});

const PORT = 3001;
app.listen(PORT, () => {
    console.log(`Baileys WhatsApp Microservice running on port ${PORT}`);
});
