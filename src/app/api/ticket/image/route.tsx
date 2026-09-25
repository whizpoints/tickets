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
    
    const appUrl = 'https://flashpass.whizpoint.app';
    const shortId = id.split('-')[0].toUpperCase();

    let formattedDate = date;
    if (date !== 'TBA') {
      try {
        const d = new Date(date);
        if (!isNaN(d.getTime())) {
          formattedDate = `${d.getMonth() + 1}/${d.getDate()}/${d.getFullYear()}`;
        }
      } catch (e) {}
    }

    const UserIcon = () => (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path>
        <circle cx="12" cy="7" r="4"></circle>
      </svg>
    );

    const PhoneIcon = () => (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#a855f7" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
      </svg>
    );

    const CalendarIcon = () => (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#a855f7" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
        <line x1="16" y1="2" x2="16" y2="6"></line>
        <line x1="8" y1="2" x2="8" y2="6"></line>
        <line x1="3" y1="10" x2="21" y2="10"></line>
      </svg>
    );

    const MapPinIcon = () => (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#a855f7" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
        <circle cx="12" cy="10" r="3"></circle>
      </svg>
    );

    return new ImageResponse(
      (
        <div
          style={{
            height: '100%',
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#ffffff',
            fontFamily: 'sans-serif',
          }}
        >
          <div
            style={{
              display: 'flex',
              flexDirection: 'row',
              width: '1200px',
              height: '600px',
              backgroundColor: '#040814',
              borderRadius: '30px',
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            <div style={{
              position: 'absolute',
              bottom: '-50px',
              left: '600px',
              width: '300px',
              height: '300px',
              display: 'flex',
              transform: 'rotate(-45deg)',
            }}>
              <div style={{ width: '40px', height: '100%', backgroundColor: '#0ea5e9', marginRight: '15px' }} />
              <div style={{ width: '40px', height: '100%', backgroundColor: '#8b5cf6', marginRight: '15px' }} />
              <div style={{ width: '80px', height: '100%', backgroundColor: '#d946ef' }} />
            </div>

            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                flex: 1,
                padding: '40px 50px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <img 
                  src={`${appUrl}/logo.png?v=2`} 
                  style={{ width: '132px', height: '132px', borderRadius: '66px', border: '4px solid #3b82f6', marginRight: '30px' }} 
                />
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <span style={{ color: '#e2e8f0', fontSize: '18px', letterSpacing: '4px', marginBottom: '8px' }}>MUSIC / EVENTS / LIFESTYLE</span>
                  <span style={{ color: '#94a3b8', fontSize: '14px', letterSpacing: '6px' }}>CREATE • CONNECT • EXPERIENCE</span>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', marginTop: '50px' }}>
                <span style={{ fontSize: '72px', fontWeight: 900, color: 'white', lineHeight: 1.1, textTransform: 'uppercase', letterSpacing: '-1px' }}>
                  {event}
                </span>
                <div style={{ display: 'flex', height: '6px', width: '280px', marginTop: '10px', backgroundImage: 'linear-gradient(to right, #0ea5e9, #d946ef)', borderRadius: '3px' }} />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', marginTop: '40px' }}>
                {name && (
                  <div style={{ display: 'flex', alignItems: 'center', marginBottom: '15px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', backgroundImage: 'linear-gradient(to right, #0ea5e9, #d946ef)', padding: '12px 35px', borderRadius: '50px' }}>
                      <UserIcon />
                      <span style={{ fontSize: '24px', color: 'white', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', marginLeft: '15px' }}>
                        ADMITTING: {name}
                      </span>
                    </div>
                  </div>
                )}
                {phone && (
                  <div style={{ display: 'flex', alignItems: 'center', marginLeft: '20px' }}>
                    <PhoneIcon />
                    <span style={{ fontSize: '22px', color: '#e2e8f0', letterSpacing: '1px', marginLeft: '15px' }}>Phone: {phone}</span>
                  </div>
                )}
              </div>

              <div style={{ display: 'flex', alignItems: 'center', marginTop: '50px' }}>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <div style={{ display: 'flex', padding: '10px', backgroundColor: 'rgba(168, 85, 247, 0.15)', borderRadius: '12px', marginRight: '20px' }}>
                    <CalendarIcon />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <span style={{ fontSize: '14px', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '4px' }}>Date</span>
                    <span style={{ fontSize: '24px', color: 'white', fontWeight: 600 }}>{formattedDate}</span>
                  </div>
                </div>

                <div style={{ display: 'flex', width: '2px', height: '50px', backgroundColor: '#334155', marginLeft: '50px', marginRight: '50px' }} />

                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <div style={{ display: 'flex', padding: '10px', backgroundColor: 'rgba(168, 85, 247, 0.15)', borderRadius: '12px', marginRight: '20px' }}>
                    <MapPinIcon />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <span style={{ fontSize: '14px', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '4px' }}>Venue</span>
                    <span style={{ fontSize: '24px', color: 'white', fontWeight: 600 }}>{venue}</span>
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', marginTop: 'auto' }}>
                <span style={{ color: '#94a3b8', fontSize: '14px', letterSpacing: '4px', textTransform: 'uppercase' }}>
                  GOOD VIBES • GREAT PEOPLE • UNFORGETTABLE MOMENTS
                </span>
              </div>
            </div>

            <div style={{ 
              display: 'flex', 
              flexDirection: 'column', 
              width: '4px', 
              height: '100%',
              position: 'relative',
            }}>
              <div style={{ width: '100%', height: '100%', backgroundImage: 'linear-gradient(to bottom, #475569 50%, transparent 50%)', backgroundSize: '100% 15px' }} />
              <div style={{ position: 'absolute', top: '-20px', left: '-18px', width: '40px', height: '40px', backgroundColor: '#ffffff', borderRadius: '20px' }} />
              <div style={{ position: 'absolute', bottom: '-20px', left: '-18px', width: '40px', height: '40px', backgroundColor: '#ffffff', borderRadius: '20px' }} />
            </div>

            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                width: '380px',
                backgroundColor: '#040814',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', marginBottom: '30px' }}>
                <div style={{ display: 'flex', height: '2px', width: '30px', backgroundColor: '#0ea5e9', marginRight: '15px' }} />
                <span style={{ fontSize: '20px', color: '#e2e8f0', textTransform: 'uppercase', letterSpacing: '3px' }}>
                  SCAN AT ENTRY
                </span>
                <div style={{ display: 'flex', height: '2px', width: '30px', backgroundColor: '#d946ef', marginLeft: '15px' }} />
              </div>

              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '8px',
                  backgroundImage: 'linear-gradient(135deg, #0ea5e9, #d946ef)',
                  borderRadius: '24px',
                  marginBottom: '30px',
                }}
              >
                <div style={{ display: 'flex', padding: '15px', backgroundColor: 'white', borderRadius: '18px' }}>
                  <img
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(`${appUrl}/ticket?id=${id}`)}`}
                    alt="QR"
                    style={{ width: '220px', height: '220px' }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', marginBottom: '40px' }}>
                <div style={{ display: 'flex', height: '2px', width: '25px', backgroundColor: '#0ea5e9', marginRight: '15px' }} />
                <span style={{ fontSize: '18px', color: '#94a3b8', fontFamily: 'monospace', letterSpacing: '2px' }}>
                  ID: {shortId}
                </span>
                <div style={{ display: 'flex', height: '2px', width: '25px', backgroundColor: '#d946ef', marginLeft: '15px' }} />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <span style={{ fontSize: '36px', color: '#e2e8f0', fontStyle: 'italic', fontWeight: 500, fontFamily: 'serif' }}>
                  See You There!
                </span>
                <div style={{ display: 'flex', height: '3px', width: '180px', backgroundImage: 'linear-gradient(to right, #0ea5e9, #d946ef)', borderRadius: '2px', marginTop: '10px' }} />
              </div>
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
    return new ImageResponse(
      (
        <div style={{ display: 'flex', width: '100%', height: '100%', backgroundColor: '#040814', color: 'white', alignItems: 'center', justifyContent: 'center', fontSize: 40 }}>
          Ticket Error
        </div>
      )
    );
  }
}
