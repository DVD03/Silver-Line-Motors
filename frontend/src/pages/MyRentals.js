import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../contexts/AuthContext';
import Skeleton from '../components/Skeleton';

const API = 'http://localhost:5000';

const statusChip = (s) => {
  const map = { Confirmed: 'chip chip-confirmed', Pending: 'chip chip-pending', Completed: 'chip chip-completed', Active: 'chip chip-active' };
  return map[s] || 'chip chip-muted';
};

export default function MyRentals() {
  const { token } = useContext(AuthContext);
  const [rentals, setRentals] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get(`${API}/api/rentals/my`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => setRentals(r.data))
      .catch(() => { })
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div style={{ background: 'var(--bg)', minHeight: '100vh' }}>
      <div className="page-hero">
        <h1 className="heading-lg text-gradient">My Rentals</h1>
        <p style={{ color: '#64748b', marginTop: '10px' }}>{rentals.length} total rental{rentals.length !== 1 ? 's' : ''}</p>
      </div>
      <div style={{ maxWidth: 900, margin: '0 auto', padding: '56px 24px' }}>
        {loading ? <Skeleton type="list" count={4} /> : rentals.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px', color: '#64748b' }}>
            <div style={{ fontSize: '3rem', marginBottom: '16px' }}>🔑</div>
            <h3 style={{ fontFamily: "'Outfit', sans-serif", color: '#94a3b8', marginBottom: '8px' }}>No rentals yet</h3>
            <p style={{ marginBottom: '24px' }}>Browse available vehicles and book your first rental.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {rentals.map((rental, i) => (
              <div key={rental._id} className="card" style={{ padding: '20px', display: 'grid', gridTemplateColumns: '1fr 1fr 1fr auto', gap: '20px', alignItems: 'center', animation: `slideUp 0.4s ${i * 0.06}s both` }}>
                <div>
                  <p style={{ color: '#64748b', fontSize: '0.72rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '4px' }}>Vehicle</p>
                  <p style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 700, color: '#f1f5f9', fontSize: '0.95rem' }}>
                    {rental.vehicle?.make} {rental.vehicle?.model}
                  </p>
                </div>
                <div>
                  <p style={{ color: '#64748b', fontSize: '0.72rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '4px' }}>Dates</p>
                  <p style={{ color: '#94a3b8', fontSize: '0.85rem' }}>
                    {new Date(rental.startDate).toLocaleDateString()} → {new Date(rental.endDate).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <p style={{ color: '#64748b', fontSize: '0.72rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '4px' }}>Total</p>
                  <p style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 800, fontSize: '1.05rem', color: '#34d399' }}>
                    LKR {rental.total?.toLocaleString()}
                  </p>
                </div>
                <span className={statusChip(rental.status)}>{rental.status}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}