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

    // Icons
    const UserIcon = () => (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
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
      <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
        <line x1="16" y1="2" x2="16" y2="6"></line>
        <line x1="8" y1="2" x2="8" y2="6"></line>
        <line x1="3" y1="10" x2="21" y2="10"></line>
      </svg>
    );

    const MapPinIcon = () => (
      <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#a855f7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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
            backgroundColor: '#ffffff', // outer padding background (if any), but we fill it
            fontFamily: 'sans-serif',
          }}
        >
          {/* Ticket Canvas */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'row',
              width: '1200px',
              height: '600px',
              backgroundColor: '#070a13', // Very dark blue/black
              borderRadius: '40px',
              overflow: 'hidden',
              position: 'relative',
            }}
          >
            {/* Background decorative elements */}
            <div style={{ position: 'absolute', top: '-100px', right: '350px', width: '500px', height: '500px', background: 'radial-gradient(circle, rgba(168,85,247,0.15) 0%, rgba(0,0,0,0) 70%)', borderRadius: '50%' }} />
            <div style={{ position: 'absolute', bottom: '-150px', left: '-100px', width: '600px', height: '600px', background: 'radial-gradient(circle, rgba(59,130,246,0.15) 0%, rgba(0,0,0,0) 70%)', borderRadius: '50%' }} />

            {/* LEFT PANEL */}
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                flex: 1,
                padding: '50px 60px',
                position: 'relative',
              }}
            >
              {/* Header: Logo and Subtitles */}
              <div style={{ display: 'flex', justifyContent: 'flex-start', alignItems: 'center', width: '100%', gap: '40px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '140px', height: '140px', borderRadius: '70px', overflow: 'hidden', border: '3px solid #3b82f6', padding: '5px' }}>
                  <img src={`${appUrl}/logo.png`} style={{ width: '100%', height: '100%', borderRadius: '65px', objectFit: 'cover' }} />
                </div>
                
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', justifyContent: 'center' }}>
                  <span style={{ color: '#d1d5db', fontSize: '18px', letterSpacing: '4px', marginBottom: '8px' }}>MUSIC / EVENTS / LIFESTYLE</span>
                  <span style={{ color: '#9ca3af', fontSize: '14px', letterSpacing: '6px' }}>CREATE • CONNECT • EXPERIENCE</span>
                </div>
              </div>

              {/* Event Title */}
              <div style={{ display: 'flex', flexDirection: 'column', marginTop: '40px' }}>
                <h1 style={{ fontSize: '72px', fontWeight: 900, color: 'white', margin: '0 0 15px 0', lineHeight: 1.1, textTransform: 'uppercase' }}>
                  {event}
                </h1>
                <div style={{ height: '6px', width: '350px', backgroundImage: 'linear-gradient(to right, #3b82f6, #a855f7)' }} />
              </div>

              {/* Attendee Info */}
              <div style={{ display: 'flex', flexDirection: 'column', marginTop: '40px', gap: '20px' }}>
                {name && (
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '15px', backgroundImage: 'linear-gradient(to right, #3b82f6, #a855f7)', padding: '12px 35px', borderRadius: '50px' }}>
                      <UserIcon />
                      <span style={{ fontSize: '24px', color: 'white', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px' }}>
                        ISSUED TO: {name}
                      </span>
                    </div>
                  </div>
                )}
                {phone && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginLeft: '20px' }}>
                    <PhoneIcon />
                    <span style={{ fontSize: '22px', color: '#e5e7eb', letterSpacing: '1px' }}>Phone: {phone}</span>
                  </div>
                )}
              </div>

              {/* Date & Venue */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '40px', marginTop: '40px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                  <CalendarIcon />
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <span style={{ fontSize: '16px', color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '4px' }}>Date</span>
                    <span style={{ fontSize: '24px', color: 'white', fontWeight: 600 }}>{date !== 'TBA' ? new Date(date).toLocaleDateString('en-US', { month: 'numeric', day: 'numeric', year: 'numeric' }) : 'TBA'}</span>
                  </div>
                </div>

                <div style={{ width: '2px', height: '50px', backgroundColor: '#374151' }} />

                <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                  <MapPinIcon />
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <span style={{ fontSize: '16px', color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '4px' }}>Venue</span>
                    <span style={{ fontSize: '24px', color: 'white', fontWeight: 600 }}>{venue}</span>
                  </div>
                </div>
              </div>

              {/* Footer text */}
              <div style={{ display: 'flex', marginTop: 'auto' }}>
                <span style={{ color: '#6b7280', fontSize: '14px', letterSpacing: '4px', textTransform: 'uppercase' }}>
                  GOOD VIBES • GREAT PEOPLE • UNFORGETTABLE MOMENTS
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
                width: '400px',
                borderLeft: '3px dashed #1f2937',
                position: 'relative',
              }}
            >
              {/* Ticket Cutouts */}
              <div style={{ position: 'absolute', top: '-25px', left: '-25px', width: '50px', height: '50px', backgroundColor: '#ffffff', borderRadius: '25px' }} />
              <div style={{ position: 'absolute', bottom: '-25px', left: '-25px', width: '50px', height: '50px', backgroundColor: '#ffffff', borderRadius: '25px' }} />

              <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '40px' }}>
                <div style={{ height: '2px', width: '30px', backgroundColor: '#3b82f6' }} />
                <span style={{ fontSize: '20px', color: '#e5e7eb', textTransform: 'uppercase', letterSpacing: '3px' }}>
                  SCAN AT ENTRY
                </span>
                <div style={{ height: '2px', width: '30px', backgroundColor: '#a855f7' }} />
              </div>

              {/* QR Code with Gradient Border */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '8px',
                  backgroundImage: 'linear-gradient(to bottom right, #3b82f6, #a855f7)',
                  borderRadius: '24px',
                  marginBottom: '40px',
                }}
              >
                <div style={{ display: 'flex', padding: '15px', backgroundColor: 'white', borderRadius: '16px' }}>
                  <img
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(`${appUrl}/ticket?id=${id}`)}`}
                    alt="QR"
                    style={{ width: '220px', height: '220px' }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '40px' }}>
                <div style={{ height: '2px', width: '20px', backgroundColor: '#3b82f6' }} />
                <span style={{ fontSize: '18px', color: '#9ca3af', fontFamily: 'monospace', letterSpacing: '2px' }}>
                  ID: {shortId}
                </span>
                <div style={{ height: '2px', width: '20px', backgroundColor: '#a855f7' }} />
              </div>

              <span style={{ fontSize: '32px', color: '#d1d5db', fontStyle: 'italic', fontWeight: 600 }}>
                See You There!
              </span>
              {/* Decorative swish under text */}
              <div style={{ height: '4px', width: '150px', backgroundImage: 'linear-gradient(to right, #3b82f6, #a855f7)', borderRadius: '2px', marginTop: '10px', transform: 'rotate(-2deg)' }} />

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
    return new Response(`Failed to generate image`, {
      status: 500,
    });
  }
}
