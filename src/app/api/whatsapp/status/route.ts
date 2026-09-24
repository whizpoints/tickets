import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const waServiceUrl = process.env.WHATSAPP_SERVICE_URL || 'https://api.whizpoint.app';
    const waApiKey = process.env.WHATSAPP_SERVICE_API_KEY || '';
    const headers = { 'Content-Type': 'application/json' };
    if (waApiKey) headers['x-api-key'] = waApiKey;

    const res = await fetch(\\/api/status\, { headers });
    if (!res.ok) throw new Error('API down');
    const data = await res.json();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ isConnected: false, connectionState: 'offline' });
  }
}
