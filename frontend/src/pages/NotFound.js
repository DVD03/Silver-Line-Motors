import React from 'react';
import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div style={{ background: 'var(--bg)', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '24px', position: 'relative', overflow: 'hidden' }}>
      {/* Background orbs */}
      {[{ x: '10%', y: '20%', c: 'rgba(59,130,246,0.08)', s: 300 }, { x: '70%', y: '60%', c: 'rgba(99,102,241,0.06)', s: 200 }].map((o, i) => (
        <div key={i} style={{ position: 'absolute', left: o.x, top: o.y, width: o.s, height: o.s, borderRadius: '50%', background: o.c, filter: 'blur(80px)', animation: `float ${6 + i * 2}s ease-in-out infinite`, pointerEvents: 'none' }} />
      ))}
      <div style={{ position: 'relative' }}>
        <div style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 900, fontSize: 'clamp(5rem, 18vw, 12rem)', lineHeight: 1, color: 'transparent', WebkitTextStroke: '2px rgba(59,130,246,0.3)', animation: 'glitch 2s ease-in-out infinite', letterSpacing: '-0.02em', textShadow: '0 0 60px rgba(59,130,246,0.2)' }}>
          404
        </div>
        <h2 style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 700, fontSize: 'clamp(1.2rem, 3vw, 1.8rem)', color: '#94a3b8', marginTop: '-8px', marginBottom: '16px' }}>
          Page Not Found
        </h2>
        <p style={{ color: '#64748b', fontSize: '1rem', marginBottom: '40px', maxWidth: '400px' }}>
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link to="/" className="btn btn-accent btn-lg">← Go Home</Link>
          <Link to="/auctions" className="btn btn-outline btn-lg">View Auctions</Link>
        </div>
      </div>
    </div>
  );
}