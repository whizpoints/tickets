import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';

export const runtime = 'edge';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id') || 'UNKNOWN';
    const event = searchParams.get('event') || 'FlashPass Event';
    const pkg = searchParams.get('pkg') || 'Standard Ticket';
    const date = searchParams.get('date') || 'TBA';
    const venue = searchParams.get('venue') || 'TBA';

    return new ImageResponse(
      (
        <div
          style={{
            height: '100%',
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#f9fafb',
            padding: '40px',
            fontFamily: 'sans-serif',
          }}
        >
          {/* Main Ticket Card */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'row',
              width: '900px',
              height: '400px',
              backgroundColor: 'white',
              borderRadius: '30px',
              boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
              overflow: 'hidden',
            }}
          >
            {/* Left side: Event Info */}
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                flex: 1,
                padding: '40px',
                borderRight: '4px dashed #e5e7eb',
                position: 'relative',
              }}
            >
              {/* Cutouts for ticket effect */}
              <div
                style={{
                  position: 'absolute',
                  top: '-25px',
                  right: '-25px',
                  width: '50px',
                  height: '50px',
                  backgroundColor: '#f9fafb',
                  borderRadius: '25px',
                }}
              />
              <div
                style={{
                  position: 'absolute',
                  bottom: '-25px',
                  right: '-25px',
                  width: '50px',
                  height: '50px',
                  backgroundColor: '#f9fafb',
                  borderRadius: '25px',
                }}
              />

              <div style={{ display: 'flex', alignItems: 'center', marginBottom: '20px' }}>
                <span style={{ color: '#2563eb', fontSize: '24px', fontWeight: 'bold' }}>⚡ FlashPass</span>
              </div>
              <h1 style={{ fontSize: '42px', fontWeight: 800, color: '#111827', margin: '0 0 10px 0', lineHeight: 1.1 }}>
                {event}
              </h1>
              <p style={{ fontSize: '24px', color: '#4b5563', margin: '0 0 30px 0' }}>{pkg}</p>

              <div style={{ display: 'flex', gap: '30px', marginTop: 'auto' }}>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <span style={{ fontSize: '14px', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '1px' }}>Date</span>
                  <span style={{ fontSize: '20px', color: '#111827', fontWeight: 600 }}>{date}</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <span style={{ fontSize: '14px', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '1px' }}>Venue</span>
                  <span style={{ fontSize: '20px', color: '#111827', fontWeight: 600 }}>{venue}</span>
                </div>
              </div>
            </div>

            {/* Right side: QR Code */}
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                width: '350px',
                padding: '40px',
                backgroundColor: '#f8fafc',
              }}
            >
              <span style={{ fontSize: '14px', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '20px' }}>
                Scan at entry
              </span>
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(`https://api.whizpoint.app/ticket?id=${id}`)}`}
                alt="QR"
                style={{ width: '200px', height: '200px', borderRadius: '15px' }}
              />
              <span style={{ fontSize: '12px', color: '#9ca3af', marginTop: '20px', fontFamily: 'monospace' }}>
                ID: {id.split('-')[0]}
              </span>
            </div>
          </div>
        </div>
      ),
      {
        width: 1000,
        height: 500,
      }
    );
  } catch (e: any) {
    return new Response(`Failed to generate image`, {
      status: 500,
    });
  }
}
