import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import BlurImage from '../components/BlurImage';
import Skeleton from '../components/Skeleton';

const API = 'http://localhost:5000';

export default function RentalsList() {
  const [vehicles, setVehicles] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    axios.get(`${API}/api/vehicles?${new URLSearchParams({ search, purpose: 'rent' })}`)
      .then(r => setVehicles(r.data))
      .catch(() => setVehicles([]))
      .finally(() => setLoading(false));
  }, [search]);

  return (
    <div style={{ background: 'var(--bg)', minHeight: '100vh' }}>
      <div className="page-hero">
        <h1 className="heading-lg text-gradient">Rent a Vehicle</h1>
        <p style={{ color: '#64748b', marginTop: '10px' }}>Premium vehicles available for short-term rental across Sri Lanka.</p>
      </div>

      <div style={{ maxWidth: 1240, margin: '0 auto', padding: '48px 24px' }}>
        {/* Search */}
        <div style={{ position: 'relative', maxWidth: 560, margin: '0 auto 48px' }}>
          <span style={{ position: 'absolute', left: 18, top: '50%', transform: 'translateY(-50%)', color: '#64748b', pointerEvents: 'none' }}>🔍</span>
          <input type="text" placeholder="Search by make or model..." value={search} onChange={e => setSearch(e.target.value)}
            style={{ width: '100%', padding: '13px 20px 13px 46px', borderRadius: '40px', border: '1.5px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.04)', color: '#f1f5f9', fontSize: '0.95rem', outline: 'none', transition: 'border-color 0.25s, box-shadow 0.25s' }}
            onFocus={e => { e.target.style.borderColor = '#10b981'; e.target.style.boxShadow = '0 0 0 3px rgba(16,185,129,0.15)'; }}
            onBlur={e => { e.target.style.borderColor = 'rgba(255,255,255,0.1)'; e.target.style.boxShadow = 'none'; }}
          />
        </div>

        {loading ? <Skeleton type="card" count={6} /> : vehicles.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px', color: '#64748b' }}>
            <div style={{ fontSize: '3rem', marginBottom: '16px' }}>🔑</div>
            <p style={{ fontSize: '1.1rem' }}>No vehicles available for rent right now.</p>
          </div>
        ) : (
          <div className="grid-3">
            {vehicles.map((v, i) => (
              <div key={v._id} className="card" style={{ animation: `slideUp 0.5s ${i * 0.07}s both` }}>
                <div style={{ position: 'relative' }}>
                  <BlurImage src={`${API}${v.images?.[0] || ''}`} alt={v.make} style={{ height: 210 }} />
                  <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(8,13,26,0.85) 0%, transparent 55%)' }} />
                  <div style={{ position: 'absolute', bottom: '12px', left: '12px', display: 'flex', gap: '6px' }}>
                    <span className="badge badge-success">{v.category}</span>
                    <span className="badge badge-muted">{v.fuelType}</span>
                  </div>
                </div>
                <div style={{ padding: '20px' }}>
                  <h3 style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 700, fontSize: '1.05rem', color: '#f1f5f9', marginBottom: '6px' }}>
                    {v.make} {v.model} <span style={{ color: '#64748b', fontWeight: 400 }}>({v.year})</span>
                  </h3>
                  <p style={{ color: '#64748b', fontSize: '0.82rem', marginBottom: '14px' }}>{v.mileage?.toLocaleString()} km · {v.condition}</p>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <p style={{ color: '#64748b', fontSize: '0.7rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Daily Rate</p>
                      <p style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 800, fontSize: '1.2rem', color: '#34d399' }}>LKR {v.basePrice?.toLocaleString()}</p>
                    </div>
                    <Link to={`/rentals/${v._id}`} className="btn btn-success btn-sm">🔑 Rent Now →</Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}