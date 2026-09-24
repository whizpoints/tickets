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
              width: '1000px',
              height: '450px',
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
                padding: '50px',
                borderRight: '4px dashed #e5e7eb',
                position: 'relative',
              }}
            >
              {/* Cutouts for ticket effect */}
              <div
                style={{
                  position: 'absolute',
                  top: '-30px',
                  right: '-30px',
                  width: '60px',
                  height: '60px',
                  backgroundColor: '#f9fafb',
                  borderRadius: '30px',
                }}
              />
              <div
                style={{
                  position: 'absolute',
                  bottom: '-30px',
                  right: '-30px',
                  width: '60px',
                  height: '60px',
                  backgroundColor: '#f9fafb',
                  borderRadius: '30px',
                }}
              />

              <div style={{ display: 'flex', alignItems: 'center', marginBottom: '20px' }}>
                <img src={`${appUrl}/logo.png`} style={{ width: '130px', height: '130px', borderRadius: '25px', objectFit: 'cover' }} />
              </div>
              <h1 style={{ fontSize: '46px', fontWeight: 800, color: '#111827', margin: '0 0 10px 0', lineHeight: 1.1 }}>
                {event}
              </h1>
              <p style={{ fontSize: '26px', color: '#4b5563', margin: '0 0 20px 0' }}>{pkg}</p>
              
              {name && (
                <div style={{ display: 'flex', flexDirection: 'column', marginBottom: '20px', padding: '15px', backgroundColor: '#f3f4f6', borderRadius: '12px' }}>
                  <span style={{ fontSize: '18px', color: '#1f2937', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '1px' }}>Admitting: {name}</span>
                  {phone && <span style={{ fontSize: '16px', color: '#4b5563', marginTop: '4px' }}>Phone: {phone}</span>}
                </div>
              )}

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
                src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(`${appUrl}/ticket?id=${id}`)}`}
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
