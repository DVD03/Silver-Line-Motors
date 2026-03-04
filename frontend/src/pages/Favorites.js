import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';

const API = 'http://localhost:5000';

export default function Favorites() {
  const { user } = useContext(AuthContext);
  const favorites = user?.favorites || [];

  return (
    <div style={{ background: 'var(--bg)', minHeight: '100vh' }}>
      <div className="page-hero">
        <h1 className="heading-lg text-gradient">Your Favorites</h1>
        <p style={{ color: '#64748b', marginTop: '10px' }}>{favorites.length} saved vehicle{favorites.length !== 1 ? 's' : ''}</p>
      </div>

      <div style={{ maxWidth: 1240, margin: '0 auto', padding: '56px 24px' }}>
        {favorites.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px 0' }}>
            <div style={{ fontSize: '4rem', marginBottom: '24px' }}>❤️</div>
            <h2 style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 700, fontSize: '1.4rem', color: '#94a3b8', marginBottom: '12px' }}>No favorites yet</h2>
            <p style={{ color: '#64748b', marginBottom: '32px', fontSize: '0.95rem' }}>Start exploring vehicles and save the ones you love.</p>
            <Link to="/" className="btn btn-accent btn-lg">Browse Vehicles →</Link>
          </div>
        ) : (
          <div className="grid-3">
            {favorites.map((fav, i) => {
              const v = fav.vehicle;
              if (!v) return null;
              return (
                <div key={i} className="card" style={{ animation: `slideUp 0.5s ${i * 0.07}s both` }}>
                  {v.images?.[0] && (
                    <div style={{ position: 'relative', height: 200, overflow: 'hidden' }}>
                      <img src={`${API}${v.images[0]}`} alt={v.make} loading="lazy" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(8,13,26,0.7) 0%, transparent 60%)' }} />
                    </div>
                  )}
                  <div style={{ padding: '20px' }}>
                    <h3 style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 700, fontSize: '1.05rem', color: '#f1f5f9', marginBottom: '6px' }}>
                      {v.make} {v.model} <span style={{ color: '#64748b', fontWeight: 400 }}>({v.year})</span>
                    </h3>
                    <p style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 800, fontSize: '1.1rem', color: '#60a5fa', marginBottom: '16px' }}>
                      LKR {v.basePrice?.toLocaleString()}
                    </p>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <Link to={`/vehicle/${v._id || fav.vehicle}`} className="btn btn-ghost btn-sm" style={{ flex: 1, justifyContent: 'center' }}>View Details →</Link>
                      <Link to={`/auctions/${v._id || fav.vehicle}`} className="btn btn-danger btn-sm">Bid</Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}