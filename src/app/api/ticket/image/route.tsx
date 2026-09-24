import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';

export const runtime = 'nodejs';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id') || 'UNKNOWN';
    const event = searchParams.get('event') || 'FlashPass Event';
    const pkg = searchParams.get('pkg') || 'Standard Ticket';
    const date = searchParams.get('date') || 'TBA';
    const venue = searchParams.get('venue') || 'TBA';
    const name = searchParams.get('name') || '';
    const phone = searchParams.get('phone') || '';
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://api.whizpoint.app';

    const shortId = id.split('-')[0].toUpperCase();

    return new ImageResponse(
      (
        <div
          style={{
            height: '100%',
            width: '100%',
            display: 'flex',
            flexDirection: 'row',
            fontFamily: 'sans-serif',
            backgroundColor: '#0f172a',
            color: 'white',
          }}
        >
          {/* LEFT PANEL */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              flex: 1,
              padding: '48px 52px',
              backgroundColor: '#0f172a',
            }}
          >
            {/* Header: Logo + Taglines */}
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '28px' }}>
              <img
                src={`${appUrl}/logo.png`}
                width="80"
                height="80"
                style={{ borderRadius: '40px', marginRight: '20px', border: '3px solid #3b82f6' }}
              />
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ color: '#94a3b8', fontSize: '15px', letterSpacing: '4px' }}>MUSIC / EVENTS / LIFESTYLE</span>
                <span style={{ color: '#475569', fontSize: '12px', letterSpacing: '5px', marginTop: '4px' }}>CREATE • CONNECT • EXPERIENCE</span>
              </div>
            </div>

            {/* Event Title */}
            <span style={{ fontSize: '52px', fontWeight: 900, color: '#ffffff', lineHeight: 1.1, textTransform: 'uppercase', marginBottom: '8px' }}>
              {event}
            </span>
            <div style={{ display: 'flex', width: '250px', height: '4px', backgroundColor: '#3b82f6', marginBottom: '24px', borderRadius: '2px' }} />

            {/* Attendee Info */}
            {name && (
              <div style={{ display: 'flex', flexDirection: 'column', marginBottom: '24px' }}>
                <div style={{ display: 'flex', alignItems: 'center', backgroundColor: '#3b82f6', padding: '10px 28px', borderRadius: '40px', marginBottom: '10px' }}>
                  <span style={{ fontSize: '14px', color: 'rgba(255,255,255,0.8)', fontWeight: 600, letterSpacing: '2px', marginRight: '10px' }}>ISSUED TO:</span>
                  <span style={{ fontSize: '20px', color: '#ffffff', fontWeight: 800, textTransform: 'uppercase' }}>{name}</span>
                </div>
                {phone && (
                  <div style={{ display: 'flex', alignItems: 'center', marginLeft: '12px' }}>
                    <span style={{ fontSize: '18px', color: '#a78bfa', marginRight: '8px' }}>Tel:</span>
                    <span style={{ fontSize: '18px', color: '#cbd5e1' }}>{phone}</span>
                  </div>
                )}
              </div>
            )}

            {/* Date & Venue */}
            <div style={{ display: 'flex', alignItems: 'center', marginTop: 'auto', marginBottom: '16px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', marginRight: '40px' }}>
                <span style={{ fontSize: '12px', color: '#64748b', textTransform: 'uppercase', letterSpacing: '2px' }}>DATE</span>
                <span style={{ fontSize: '22px', color: '#f1f5f9', fontWeight: 700 }}>{date}</span>
              </div>
              <div style={{ display: 'flex', width: '2px', height: '40px', backgroundColor: '#1e293b', marginRight: '40px' }} />
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontSize: '12px', color: '#64748b', textTransform: 'uppercase', letterSpacing: '2px' }}>VENUE</span>
                <span style={{ fontSize: '22px', color: '#f1f5f9', fontWeight: 700 }}>{venue}</span>
              </div>
            </div>

            {/* Footer */}
            <span style={{ color: '#334155', fontSize: '11px', letterSpacing: '4px' }}>
              GOOD VIBES • GREAT PEOPLE • UNFORGETTABLE MOMENTS
            </span>
          </div>

          {/* DASHED DIVIDER */}
          <div style={{ display: 'flex', width: '3px', backgroundColor: '#1e293b' }} />

          {/* RIGHT PANEL */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              width: '370px',
              backgroundColor: '#0f172a',
              padding: '40px',
            }}
          >
            {/* SCAN AT ENTRY */}
            <span style={{ fontSize: '16px', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '4px', fontWeight: 600, marginBottom: '28px' }}>
              SCAN AT ENTRY
            </span>

            {/* QR Code with border */}
            <div
              style={{
                display: 'flex',
                padding: '6px',
                backgroundColor: '#3b82f6',
                borderRadius: '20px',
                marginBottom: '28px',
              }}
            >
              <div style={{ display: 'flex', padding: '10px', backgroundColor: '#ffffff', borderRadius: '14px' }}>
                <img
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(`${appUrl}/ticket?id=${id}`)}`}
                  width="200"
                  height="200"
                />
              </div>
            </div>

            {/* Ticket ID */}
            <span style={{ fontSize: '15px', color: '#64748b', fontFamily: 'monospace', letterSpacing: '2px', marginBottom: '28px' }}>
              ID: {shortId}
            </span>

            {/* See You There */}
            <span style={{ fontSize: '28px', color: '#e2e8f0', fontStyle: 'italic', fontWeight: 600 }}>
              See You There!
            </span>
            <div style={{ display: 'flex', height: '3px', width: '130px', backgroundColor: '#3b82f6', borderRadius: '2px', marginTop: '8px' }} />
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 600,
      }
    );
  } catch (e: any) {
    console.error('Ticket image generation error:', e);
    return new Response(`Failed to generate image: ${e.message}`, { status: 500 });
  }
}
