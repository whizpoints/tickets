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
            alignItems: 'center',
            justifyContent: 'center',
            fontFamily: 'sans-serif',
            backgroundColor: '#070a13',
          }}
        >
          <div
            style={{
              display: 'flex',
              flexDirection: 'row',
              width: '1200px',
              height: '600px',
              backgroundColor: '#0c1222',
              borderRadius: '40px',
              overflow: 'hidden',
              position: 'relative',
              border: '1px solid #1e293b',
            }}
          >
            {/* Ambient glow effects */}
            <div style={{ position: 'absolute', top: '-80px', left: '200px', width: '400px', height: '400px', background: 'radial-gradient(circle, rgba(59,130,246,0.12) 0%, transparent 70%)', borderRadius: '50%', display: 'flex' }} />
            <div style={{ position: 'absolute', bottom: '-120px', right: '300px', width: '500px', height: '500px', background: 'radial-gradient(circle, rgba(168,85,247,0.1) 0%, transparent 70%)', borderRadius: '50%', display: 'flex' }} />

            {/* LEFT PANEL */}
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                flex: 1,
                padding: '48px 56px',
                position: 'relative',
              }}
            >
              {/* Header Row: Logo + Taglines */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '30px', marginBottom: '32px' }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '100px',
                  height: '100px',
                  borderRadius: '50px',
                  overflow: 'hidden',
                  border: '3px solid #3b82f6',
                }}>
                  <img src={`${appUrl}/logo.png`} style={{ width: '94px', height: '94px', borderRadius: '47px', objectFit: 'cover' }} />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <span style={{ color: '#cbd5e1', fontSize: '16px', letterSpacing: '5px', fontWeight: 500 }}>MUSIC / EVENTS / LIFESTYLE</span>
                  <span style={{ color: '#64748b', fontSize: '13px', letterSpacing: '5px', marginTop: '6px' }}>CREATE  •  CONNECT  •  EXPERIENCE</span>
                </div>
              </div>

              {/* Event Title */}
              <div style={{ display: 'flex', flexDirection: 'column', marginBottom: '28px' }}>
                <span style={{ fontSize: '58px', fontWeight: 900, color: '#ffffff', lineHeight: 1.1, textTransform: 'uppercase', letterSpacing: '-1px' }}>
                  {event}
                </span>
                <div style={{ display: 'flex', height: '5px', width: '300px', marginTop: '16px', background: 'linear-gradient(to right, #3b82f6, #a855f7)', borderRadius: '3px' }} />
              </div>

              {/* Attendee Pill */}
              {name && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '28px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', background: 'linear-gradient(to right, #3b82f6, #7c3aed)', padding: '12px 30px', borderRadius: '50px', gap: '12px' }}>
                    <span style={{ fontSize: '16px', color: 'rgba(255,255,255,0.7)', fontWeight: 600, letterSpacing: '2px' }}>ISSUED TO:</span>
                    <span style={{ fontSize: '22px', color: '#ffffff', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px' }}>{name}</span>
                  </div>
                  {phone && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginLeft: '16px' }}>
                      <span style={{ fontSize: '20px', color: '#a78bfa' }}>Tel:</span>
                      <span style={{ fontSize: '20px', color: '#e2e8f0', letterSpacing: '1px' }}>{phone}</span>
                    </div>
                  )}
                </div>
              )}

              {/* Date & Venue Row */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '30px', marginTop: 'auto', marginBottom: '20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '42px', height: '42px', borderRadius: '10px', backgroundColor: 'rgba(59,130,246,0.15)', border: '1px solid rgba(59,130,246,0.3)' }}>
                    <span style={{ fontSize: '22px' }}>&#128197;</span>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <span style={{ fontSize: '13px', color: '#64748b', textTransform: 'uppercase', letterSpacing: '2px' }}>Date</span>
                    <span style={{ fontSize: '22px', color: '#f1f5f9', fontWeight: 700 }}>{date}</span>
                  </div>
                </div>

                <div style={{ display: 'flex', width: '2px', height: '45px', backgroundColor: '#1e293b' }} />

                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '42px', height: '42px', borderRadius: '10px', backgroundColor: 'rgba(168,85,247,0.15)', border: '1px solid rgba(168,85,247,0.3)' }}>
                    <span style={{ fontSize: '22px' }}>&#128205;</span>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <span style={{ fontSize: '13px', color: '#64748b', textTransform: 'uppercase', letterSpacing: '2px' }}>Venue</span>
                    <span style={{ fontSize: '22px', color: '#f1f5f9', fontWeight: 700 }}>{venue}</span>
                  </div>
                </div>
              </div>

              {/* Footer tagline */}
              <div style={{ display: 'flex' }}>
                <span style={{ color: '#475569', fontSize: '12px', letterSpacing: '4px', textTransform: 'uppercase' }}>
                  GOOD VIBES  •  GREAT PEOPLE  •  UNFORGETTABLE MOMENTS
                </span>
              </div>
            </div>

            {/* RIGHT PANEL */}
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                width: '380px',
                borderLeft: '3px dashed #1e293b',
                position: 'relative',
                backgroundColor: 'rgba(15,23,42,0.5)',
              }}
            >
              {/* Ticket cutout circles */}
              <div style={{ position: 'absolute', top: '-24px', left: '-24px', width: '48px', height: '48px', backgroundColor: '#070a13', borderRadius: '24px', display: 'flex' }} />
              <div style={{ position: 'absolute', bottom: '-24px', left: '-24px', width: '48px', height: '48px', backgroundColor: '#070a13', borderRadius: '24px', display: 'flex' }} />

              {/* SCAN AT ENTRY header */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '30px' }}>
                <div style={{ display: 'flex', height: '2px', width: '25px', background: 'linear-gradient(to right, transparent, #3b82f6)' }} />
                <span style={{ fontSize: '17px', color: '#cbd5e1', textTransform: 'uppercase', letterSpacing: '4px', fontWeight: 600 }}>SCAN AT ENTRY</span>
                <div style={{ display: 'flex', height: '2px', width: '25px', background: 'linear-gradient(to left, transparent, #a855f7)' }} />
              </div>

              {/* QR Code with gradient border */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '7px',
                  background: 'linear-gradient(135deg, #3b82f6, #a855f7)',
                  borderRadius: '22px',
                  marginBottom: '30px',
                }}
              >
                <div style={{ display: 'flex', padding: '12px', backgroundColor: '#ffffff', borderRadius: '15px' }}>
                  <img
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(`${appUrl}/ticket?id=${id}`)}`}
                    alt="QR"
                    style={{ width: '200px', height: '200px' }}
                  />
                </div>
              </div>

              {/* Ticket ID */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '30px' }}>
                <div style={{ display: 'flex', height: '1px', width: '20px', backgroundColor: '#3b82f6' }} />
                <span style={{ fontSize: '16px', color: '#94a3b8', fontFamily: 'monospace', letterSpacing: '2px' }}>ID: {shortId}</span>
                <div style={{ display: 'flex', height: '1px', width: '20px', backgroundColor: '#a855f7' }} />
              </div>

              {/* See You There */}
              <span style={{ fontSize: '30px', color: '#e2e8f0', fontStyle: 'italic', fontWeight: 600 }}>See You There!</span>
              <div style={{ display: 'flex', height: '3px', width: '140px', background: 'linear-gradient(to right, #3b82f6, #a855f7)', borderRadius: '2px', marginTop: '8px' }} />
            </div>
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
    return new Response(`Failed to generate image: ${e.message}`, {
      status: 500,
    });
  }
}
