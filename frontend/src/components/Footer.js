import React from 'react';
import { Link } from 'react-router-dom';

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer style={{
      background: 'linear-gradient(0deg, #060b17 0%, #0a1024 100%)',
      borderTop: '1px solid rgba(255,255,255,0.06)',
      padding: '72px 24px 32px',
      marginTop: 'auto',
    }}>
      <div style={{ maxWidth: 1240, margin: '0 auto' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '40px', marginBottom: '56px' }}>

          {/* Brand */}
          <div style={{ gridColumn: 'span 1' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
              <div style={{
                width: 40, height: 40, borderRadius: '10px',
                background: 'linear-gradient(135deg, #3b82f6, #6366f1)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontFamily: "'Outfit', sans-serif", fontWeight: 900, color: '#fff', fontSize: '1.1rem',
              }}>SL</div>
              <span style={{
                fontFamily: "'Outfit', sans-serif", fontWeight: 800, fontSize: '1.05rem',
                background: 'linear-gradient(135deg, #cbd5e1, #f1f5f9)',
                WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
              }}>Silver Line Motors</span>
            </div>
            <p style={{ color: '#64748b', fontSize: '0.88rem', lineHeight: 1.7, marginBottom: '24px' }}>
              Premier vehicle auctions &amp; rentals in Sri Lanka. Drive the future today.
            </p>
            {/* Social icons */}
            <div style={{ display: 'flex', gap: '10px' }}>
              {[
                { label: 'Facebook', icon: 'f', href: '#' },
                { label: 'Instagram', icon: '📷', href: '#' },
                { label: 'WhatsApp', icon: '💬', href: '#' },
              ].map(s => (
                <a key={s.label} href={s.href} title={s.label} style={{
                  width: 36, height: 36, borderRadius: '50%',
                  background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '0.8rem', color: '#94a3b8', textDecoration: 'none',
                  transition: 'all 0.2s',
                }}
                  onMouseEnter={e => { e.currentTarget.style.background = 'rgba(59,130,246,0.2)'; e.currentTarget.style.borderColor = 'rgba(59,130,246,0.4)'; e.currentTarget.style.color = '#60a5fa'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'; e.currentTarget.style.color = '#94a3b8'; }}
                >{s.icon}</a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 700, fontSize: '0.95rem', color: '#f1f5f9', marginBottom: '20px', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
              Quick Links
            </h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {[['Home', '/'], ['Auctions', '/auctions'], ['Rent a Vehicle', '/rentals'], ['List Your Vehicle', '/add-vehicle']].map(([label, path]) => (
                <li key={path}>
                  <Link to={path} style={{ color: '#64748b', fontSize: '0.88rem', textDecoration: 'none', transition: 'color 0.2s' }}
                    onMouseEnter={e => e.currentTarget.style.color = '#60a5fa'}
                    onMouseLeave={e => e.currentTarget.style.color = '#64748b'}
                  >→ {label}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Services */}
          <div>
            <h4 style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 700, fontSize: '0.95rem', color: '#f1f5f9', marginBottom: '20px', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
              Services
            </h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {['Vehicle Auctions', 'Short-term Rentals', 'Vehicle Purchasing', 'Vehicle Listing'].map(s => (
                <li key={s} style={{ color: '#64748b', fontSize: '0.88rem' }}>{s}</li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 700, fontSize: '0.95rem', color: '#f1f5f9', marginBottom: '20px', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
              Contact
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {[
                { icon: '✉', text: 'info@silverlinemotors.lk' },
                { icon: '📞', text: '+94 11 234 5678' },
                { icon: '📍', text: '123 Motor Drive, Colombo, Sri Lanka' },
              ].map(({ icon, text }) => (
                <div key={text} style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                  <span style={{ fontSize: '0.85rem', flexShrink: 0, color: '#3b82f6' }}>{icon}</span>
                  <span style={{ color: '#64748b', fontSize: '0.85rem', lineHeight: 1.5 }}>{text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Newsletter */}
        <div style={{
          background: 'rgba(59,130,246,0.06)', border: '1px solid rgba(59,130,246,0.12)',
          borderRadius: '16px', padding: '28px 32px', marginBottom: '40px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '24px', flexWrap: 'wrap',
        }}>
          <div>
            <p style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 700, fontSize: '1rem', color: '#f1f5f9', marginBottom: '4px' }}>Get auction alerts</p>
            <p style={{ color: '#64748b', fontSize: '0.85rem' }}>Be the first to know about live auctions and new listings.</p>
          </div>
          <div style={{ display: 'flex', gap: '10px', flex: '0 0 auto', flexWrap: 'wrap' }}>
            <input type="email" placeholder="Your email address" style={{
              padding: '10px 16px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)',
              background: 'rgba(255,255,255,0.05)', color: '#f1f5f9', fontSize: '0.88rem',
              outline: 'none', width: '240px',
            }} />
            <button className="btn btn-accent btn-sm">Subscribe</button>
          </div>
        </div>

        {/* Bottom strip */}
        <div style={{
          borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '24px',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px',
        }}>
          <p style={{ color: '#475569', fontSize: '0.82rem' }}>
            © {year} Silver Line Motors PVT LTD. All rights reserved.
          </p>
          <div style={{ display: 'flex', gap: '20px' }}>
            {['Privacy Policy', 'Terms of Service'].map(l => (
              <span key={l} style={{ color: '#475569', fontSize: '0.82rem', cursor: 'pointer' }}>{l}</span>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}