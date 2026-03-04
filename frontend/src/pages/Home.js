import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import BlurImage from '../components/BlurImage';
import Skeleton from '../components/Skeleton';

const API = 'http://localhost:5000';

export default function Home() {
  const [vehicles, setVehicles] = useState([]);
  const [tab, setTab] = useState('auctions');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const statsRef = useRef(null);
  const [statsVisible, setStatsVisible] = useState(false);

  const purpose = tab === 'auctions' ? 'auction' : tab === 'rentals' ? 'rent' : 'sell';

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams({ search, purpose });
    axios.get(`${API}/api/vehicles?${params}`)
      .then(r => setVehicles(r.data))
      .catch(() => setVehicles([]))
      .finally(() => setLoading(false));
  }, [tab, search, purpose]);

  useEffect(() => {
    const el = statsRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setStatsVisible(true); }, { threshold: 0.3 });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  const tabConfig = [
    { key: 'auctions', label: '🔴 Live Auctions' },
    { key: 'rentals', label: '🔑 Rent a Vehicle' },
    { key: 'sales', label: '🏷️ Buy Now' },
  ];

  const btnStyle = (t) => ({
    padding: '11px 22px', borderRadius: '40px', fontWeight: 700, fontSize: '0.9rem',
    cursor: 'pointer', border: 'none', transition: 'all 0.25s',
    background: tab === t ? 'linear-gradient(135deg, #3b82f6, #6366f1)' : 'rgba(255,255,255,0.05)',
    color: tab === t ? '#fff' : '#94a3b8',
    boxShadow: tab === t ? '0 4px 20px rgba(59,130,246,0.35)' : 'none',
  });

  return (
    <div style={{ background: 'var(--bg)', minHeight: '100vh' }}>

      {/* ── Hero ──────────────────────────────────────────── */}
      <section style={{
        position: 'relative', overflow: 'hidden',
        padding: '120px 24px 100px',
        background: 'radial-gradient(ellipse 80% 60% at 50% -10%, rgba(59,130,246,0.2) 0%, transparent 70%), var(--bg)',
        textAlign: 'center',
      }}>
        {/* Orbs */}
        {[
          { size: 280, x: '8%', y: '20%', color: 'rgba(59,130,246,0.12)' },
          { size: 200, x: '80%', y: '30%', color: 'rgba(99,102,241,0.1)' },
          { size: 140, x: '60%', y: '70%', color: 'rgba(245,158,11,0.08)' },
        ].map((o, i) => (
          <div key={i} style={{
            position: 'absolute', width: o.size, height: o.size, borderRadius: '50%',
            background: o.color, left: o.x, top: o.y,
            filter: 'blur(60px)', animation: `float ${5 + i * 2}s ease-in-out infinite`,
            animationDelay: `${i * 1.5}s`, pointerEvents: 'none',
          }} />
        ))}
        <div style={{ position: 'relative', maxWidth: 800, margin: '0 auto' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', marginBottom: '24px' }}>
            <span className="badge badge-live">LIVE AUCTIONS NOW</span>
          </div>
          <h1 className="heading-xl text-gradient" style={{ marginBottom: '20px' }}>
            Sri Lanka's Premier<br />Vehicle Marketplace
          </h1>
          <p style={{ color: '#94a3b8', fontSize: 'clamp(1rem, 2vw, 1.2rem)', marginBottom: '40px', lineHeight: 1.7 }}>
            Bid on exclusive auctions, rent premium vehicles, or find your perfect car. Trusted by thousands across Sri Lanka.
          </p>
          <div style={{ display: 'flex', gap: '14px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/auctions" className="btn btn-accent btn-lg">View Live Auctions →</Link>
            <Link to="/rentals" className="btn btn-outline btn-lg">Rent a Vehicle</Link>
          </div>
        </div>
      </section>

      {/* ── Stats ─────────────────────────────────────────── */}
      <section ref={statsRef} style={{
        background: 'var(--surface)', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)',
        padding: '48px 24px',
      }}>
        <div style={{ maxWidth: 900, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px', textAlign: 'center' }}>
          {[
            { num: 500, suffix: '+', label: 'Vehicles Listed' },
            { num: 120, suffix: '+', label: 'Live Auctions' },
            { num: 2000, suffix: '+', label: 'Happy Customers' },
          ].map(({ num, suffix, label }, i) => (
            <div key={i} style={{ animation: statsVisible ? `slideUp 0.6s ${i * 0.15}s both` : 'none' }}>
              <div style={{ fontFamily: "'Outfit', sans-serif", fontSize: 'clamp(2rem, 5vw, 3.2rem)', fontWeight: 900, background: 'linear-gradient(135deg, #60a5fa, #818cf8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                {statsVisible ? num : 0}{suffix}
              </div>
              <div style={{ color: '#64748b', fontSize: '0.9rem', fontWeight: 500, marginTop: '4px' }}>{label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Browse Section ────────────────────────────────── */}
      <section style={{ padding: '72px 24px', maxWidth: 1240, margin: '0 auto' }}>
        {/* Tabs */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginBottom: '32px', flexWrap: 'wrap' }}>
          {tabConfig.map(({ key, label }) => (
            <button key={key} style={btnStyle(key)} onClick={() => setTab(key)}>{label}</button>
          ))}
        </div>

        {/* Search */}
        <div style={{ position: 'relative', maxWidth: 600, margin: '0 auto 40px' }}>
          <span style={{ position: 'absolute', left: 18, top: '50%', transform: 'translateY(-50%)', color: '#64748b', fontSize: '1.1rem', pointerEvents: 'none' }}>🔍</span>
          <input
            type="text"
            placeholder="Search by make or model..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{
              width: '100%', padding: '14px 20px 14px 48px',
              borderRadius: '40px', border: '1.5px solid rgba(255,255,255,0.1)',
              background: 'rgba(255,255,255,0.04)', color: '#f1f5f9',
              fontSize: '0.95rem', outline: 'none',
              transition: 'border-color 0.25s, box-shadow 0.25s',
            }}
            onFocus={e => { e.target.style.borderColor = '#3b82f6'; e.target.style.boxShadow = '0 0 0 3px rgba(59,130,246,0.15)'; }}
            onBlur={e => { e.target.style.borderColor = 'rgba(255,255,255,0.1)'; e.target.style.boxShadow = 'none'; }}
          />
        </div>

        {/* Grid */}
        {loading ? <Skeleton type="card" count={6} /> : (
          vehicles.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '80px 0', color: '#64748b' }}>
              <div style={{ fontSize: '3rem', marginBottom: '16px' }}>🚗</div>
              <p style={{ fontSize: '1.1rem' }}>No vehicles found. Try a different search.</p>
            </div>
          ) : (
            <div className="grid-3">
              {vehicles.map((v, i) => (
                <VehicleCard key={v._id} vehicle={v} purpose={purpose} index={i} />
              ))}
            </div>
          )
        )}
      </section>

      {/* ── Why Us ────────────────────────────────────────── */}
      <section style={{ background: 'var(--surface)', borderTop: '1px solid var(--border)', padding: '72px 24px' }}>
        <div style={{ maxWidth: 1000, margin: '0 auto' }}>
          <h2 className="heading-lg text-gradient" style={{ textAlign: 'center', marginBottom: '48px' }}>Why Silver Line Motors?</h2>
          <div className="grid-3" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))' }}>
            {[
              { icon: '🏆', title: 'Trusted Dealer', desc: 'Over 10 years serving Sri Lankan automotive enthusiasts with integrity and professionalism.' },
              { icon: '⚡', title: 'Fast & Seamless', desc: 'Bid, rent or buy in minutes. Instant notifications and real-time auction updates via live socket.' },
              { icon: '🔒', title: 'Secure Transactions', desc: 'All listings verified. Your payments and data protected at every step.' },
            ].map(({ icon, title, desc }) => (
              <div key={title} className="card" style={{ padding: '32px 24px', textAlign: 'center', background: 'rgba(255,255,255,0.02)' }}>
                <div style={{ fontSize: '2.4rem', marginBottom: '16px' }}>{icon}</div>
                <h3 style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 700, fontSize: '1.1rem', marginBottom: '10px', color: '#f1f5f9' }}>{title}</h3>
                <p style={{ color: '#64748b', fontSize: '0.88rem', lineHeight: 1.7 }}>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

function VehicleCard({ vehicle, purpose, index }) {
  const purposeBtn = {
    auction: {
      label: 'View Auction →',
      to: vehicle.activeAuctionId ? `/auctions/${vehicle.activeAuctionId}` : '/auctions',
      cls: 'btn btn-danger btn-sm'
    },
    rent: { label: 'Rent Now →', to: `/rentals/${vehicle._id}`, cls: 'btn btn-success btn-sm' },
    sell: { label: 'Buy Now →', to: `/vehicle/${vehicle._id}`, cls: 'btn btn-accent btn-sm' },
  }[purpose] || { label: 'View →', to: `/vehicle/${vehicle._id}`, cls: 'btn btn-ghost btn-sm' };

  return (
    <div className="card reveal" style={{ animationDelay: `${index * 0.07}s` }}
      ref={el => { if (el) setTimeout(() => el.classList.add('visible'), index * 70); }}>
      <div style={{ position: 'relative' }}>
        <BlurImage
          src={`http://localhost:5000${vehicle.images?.[0] || ''}`}
          alt={`${vehicle.make} ${vehicle.model}`}
          style={{ height: 220 }}
        />
        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(to top, rgba(8,13,26,0.8) 0%, transparent 55%)',
        }} />
        <div style={{ position: 'absolute', bottom: '12px', left: '12px', display: 'flex', gap: '6px' }}>
          <span className="badge badge-accent">{vehicle.category}</span>
          <span className="badge badge-muted">{vehicle.fuelType}</span>
        </div>
        {purpose === 'auction' && (
          <span className="badge badge-live" style={{ position: 'absolute', top: '12px', right: '12px' }}>LIVE</span>
        )}
      </div>
      <div style={{ padding: '20px' }}>
        <h3 style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 700, fontSize: '1.05rem', color: '#f1f5f9', marginBottom: '6px' }}>
          {vehicle.make} {vehicle.model} <span style={{ color: '#64748b', fontWeight: 500 }}>({vehicle.year})</span>
        </h3>
        <p style={{ color: '#64748b', fontSize: '0.82rem', marginBottom: '12px' }}>
          {vehicle.mileage?.toLocaleString()} km · {vehicle.condition}
        </p>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 800, fontSize: '1.1rem', color: '#60a5fa' }}>
            LKR {vehicle.basePrice?.toLocaleString()}
          </span>
          <Link to={purposeBtn.to} className={purposeBtn.cls}>{purposeBtn.label}</Link>
        </div>
      </div>
    </div>
  );
}