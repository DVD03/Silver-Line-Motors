import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';
import BlurImage from '../components/BlurImage';
import Skeleton from '../components/Skeleton';

const API = 'http://localhost:5000';

export default function AuctionsList() {
  const { token } = useContext(AuthContext);
  const [auctions, setAuctions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get(`${API}/api/auctions`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => setAuctions(r.data))
      .catch(() => { })
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div style={{ background: 'var(--bg)', minHeight: '100vh' }}>
      {/* Hero */}
      <div className="page-hero">
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
          <span className="badge badge-live">LIVE NOW</span>
        </div>
        <h1 className="heading-lg text-gradient">Live Vehicle Auctions</h1>
        <p style={{ color: '#64748b', marginTop: '10px', fontSize: '1rem' }}>
          Real-time bidding on premium Sri Lankan vehicles. Register to place your bid.
        </p>
      </div>

      <div style={{ maxWidth: 1240, margin: '0 auto', padding: '56px 24px' }}>
        {loading ? <Skeleton type="card" count={6} /> : auctions.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '100px 0', color: '#64748b' }}>
            <div style={{ fontSize: '3.5rem', marginBottom: '16px' }}>🔨</div>
            <h3 style={{ fontFamily: "'Outfit', sans-serif", fontSize: '1.3rem', color: '#94a3b8', marginBottom: '8px' }}>No active auctions</h3>
            <p>Check back soon — new auctions are posted regularly.</p>
          </div>
        ) : (
          <div className="grid-3">
            {auctions.map((auction, i) => (
              <AuctionCard key={auction._id} auction={auction} index={i} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function AuctionCard({ auction, index }) {
  const v = auction.vehicle || {};
  const timeLeft = auction.endTime ? Math.max(0, new Date(auction.endTime) - Date.now()) : 0;
  const mins = Math.floor(timeLeft / 60000);
  const hrs = Math.floor(mins / 60);
  const displayTime = timeLeft === 0 ? 'Ended' : hrs > 0 ? `${hrs}h ${mins % 60}m left` : `${mins}m left`;

  return (
    <div className="card" style={{ animation: `slideUp 0.5s ${index * 0.08}s both` }}>
      <div style={{ position: 'relative' }}>
        <BlurImage src={`${API}${v.images?.[0] || ''}`} alt={v.make} style={{ height: 220 }} />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(8,13,26,0.85) 0%, transparent 55%)' }} />
        <div style={{ position: 'absolute', top: '12px', left: '12px', display: 'flex', gap: '6px' }}>
          <span className="badge badge-live">🔴 LIVE</span>
        </div>
        <div style={{ position: 'absolute', bottom: '12px', right: '12px' }}>
          <span style={{
            background: timeLeft === 0 ? 'rgba(100,116,139,0.8)' : 'rgba(8,13,26,0.8)',
            border: '1px solid rgba(255,255,255,0.12)', borderRadius: '8px',
            padding: '4px 10px', fontSize: '0.78rem', fontWeight: 600, color: timeLeft === 0 ? '#94a3b8' : '#f59e0b',
          }}>⏱ {displayTime}</span>
        </div>
      </div>
      <div style={{ padding: '20px' }}>
        <h3 style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 700, fontSize: '1.05rem', color: '#f1f5f9', marginBottom: '8px' }}>
          {v.make} {v.model} <span style={{ color: '#64748b', fontWeight: 400 }}>({v.year})</span>
        </h3>
        <div style={{ display: 'flex', gap: '6px', marginBottom: '14px' }}>
          <span className="badge badge-accent">{v.category}</span>
          <span className="badge badge-muted">{v.fuelType}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <p style={{ color: '#64748b', fontSize: '0.72rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Current Bid</p>
            <p style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 800, fontSize: '1.3rem', color: '#f59e0b' }}>
              LKR {auction.currentBid?.toLocaleString()}
            </p>
          </div>
          <Link to={`/auctions/${auction._id}`} className="btn btn-danger btn-sm">Bid Now →</Link>
        </div>
      </div>
    </div>
  );
}