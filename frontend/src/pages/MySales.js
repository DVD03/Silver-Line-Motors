import React, { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../contexts/AuthContext';
import Skeleton from '../components/Skeleton';

const API = 'http://localhost:5000';

const statusChip = (s) => {
  const map = { Completed: 'chip chip-completed', Pending: 'chip chip-pending', Confirmed: 'chip chip-confirmed' };
  return map[s] || 'chip chip-muted';
};

export default function MySales() {
  const { token } = useContext(AuthContext);
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get(`${API}/api/sales/my`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => setSales(r.data))
      .catch(() => { })
      .finally(() => setLoading(false));
  }, [token]);

  return (
    <div style={{ background: 'var(--bg)', minHeight: '100vh' }}>
      <div className="page-hero">
        <h1 className="heading-lg text-gradient">My Purchases</h1>
        <p style={{ color: '#64748b', marginTop: '10px' }}>{sales.length} purchase{sales.length !== 1 ? 's' : ''}</p>
      </div>
      <div style={{ maxWidth: 900, margin: '0 auto', padding: '56px 24px' }}>
        {loading ? <Skeleton type="list" count={4} /> : sales.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px', color: '#64748b' }}>
            <div style={{ fontSize: '3rem', marginBottom: '16px' }}>🏷️</div>
            <h3 style={{ fontFamily: "'Outfit', sans-serif", color: '#94a3b8', marginBottom: '8px' }}>No purchases yet</h3>
            <p>Browse available vehicles and find your next car.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {sales.map((sale, i) => (
              <div key={sale._id} className="card" style={{ padding: '20px', display: 'grid', gridTemplateColumns: '1fr 1fr 1fr auto', gap: '20px', alignItems: 'center', animation: `slideUp 0.4s ${i * 0.06}s both` }}>
                <div>
                  <p style={{ color: '#64748b', fontSize: '0.72rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '4px' }}>Vehicle</p>
                  <p style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 700, color: '#f1f5f9', fontSize: '0.95rem' }}>
                    {sale.vehicle?.make} {sale.vehicle?.model}
                  </p>
                </div>
                <div>
                  <p style={{ color: '#64748b', fontSize: '0.72rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '4px' }}>Price</p>
                  <p style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 800, fontSize: '1.05rem', color: '#60a5fa' }}>
                    LKR {sale.price?.toLocaleString()}
                  </p>
                </div>
                <div>
                  <p style={{ color: '#64748b', fontSize: '0.72rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '4px' }}>Date</p>
                  <p style={{ color: '#94a3b8', fontSize: '0.85rem' }}>{new Date(sale.createdAt).toLocaleDateString()}</p>
                </div>
                <span className={statusChip(sale.status)}>{sale.status}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}