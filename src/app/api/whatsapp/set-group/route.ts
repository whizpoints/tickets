import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { groupId } = await req.json();
    const waServiceUrl = process.env.WHATSAPP_SERVICE_URL || 'https://api.whizpoint.app';
    const waApiKey = process.env.WHATSAPP_SERVICE_API_KEY || '';
    const headers = { 'Content-Type': 'application/json' };
    if (waApiKey) headers['x-api-key'] = waApiKey;

    const res = await fetch(\\/api/set-group\, {
      method: 'POST',
      headers,
      body: JSON.stringify({ groupId })
    });
    const data = await res.json();
    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
