import { NextResponse } from 'next/server';

export async function POST() {
  try {
    const waServiceUrl = process.env.WHATSAPP_SERVICE_URL || 'https://api.whizpoint.app';
    const waApiKey = process.env.WHATSAPP_SERVICE_API_KEY || '';
    const headers = { 'Content-Type': 'application/json' };
    if (waApiKey) headers['x-api-key'] = waApiKey;

    await fetch(\\/api/logout\, { method: 'POST', headers });
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
