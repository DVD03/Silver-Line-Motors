import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';
import { useToast } from '../components/Toast';
import BlurImage from '../components/BlurImage';
import Skeleton from '../components/Skeleton';

const API = 'http://localhost:5000';

const specs = (v) => [
  { icon: '📅', label: 'Year', value: v.year },
  { icon: '🛣️', label: 'Mileage', value: `${v.mileage?.toLocaleString()} km` },
  { icon: '⛽', label: 'Fuel', value: v.fuelType },
  { icon: '🏷️', label: 'Condition', value: v.condition },
  { icon: '🚗', label: 'Category', value: v.category },
  { icon: '💰', label: 'Base Price', value: `LKR ${v.basePrice?.toLocaleString()}` },
];

export default function VehicleDetails() {
  const { id } = useParams();
  const [vehicle, setVehicle] = useState(null);
  const [loading, setLoading] = useState(true);
  const { user, token } = useContext(AuthContext);
  const navigate = useNavigate();
  const toast = useToast();

  useEffect(() => {
    axios.get(`${API}/api/vehicles/${id}`)
      .then(r => setVehicle(r.data))
      .catch(() => toast.error('Error loading vehicle'))
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const addToFavorites = async () => {
    if (!user) { toast.info('Please login to save favorites'); navigate('/login'); return; }
    try {
      const favorites = [...(user.favorites || []), { vehicle: id }];
      await axios.put(`${API}/api/profile/favorites`, { favorites }, { headers: { Authorization: `Bearer ${token}` } });
      toast.success('Added to favorites! ❤️');
    } catch { toast.error('Could not add to favorites'); }
  };

  if (loading) return <Skeleton type="detail" />;
  if (!vehicle) return (
    <div style={{ textAlign: 'center', padding: '120px 24px', color: '#64748b' }}>
      <div style={{ fontSize: '3rem', marginBottom: '16px' }}>🚗</div>
      <p>Vehicle not found.</p>
      <Link to="/" className="btn btn-ghost" style={{ marginTop: '20px' }}>Go Home</Link>
    </div>
  );

  return (
    <div style={{ background: 'var(--bg)', minHeight: '100vh' }}>
      {/* Image Hero */}
      <div style={{ position: 'relative', height: 'clamp(280px, 45vh, 480px)', overflow: 'hidden' }}>
        <BlurImage src={`${API}${vehicle.images?.[0] || ''}`} alt={`${vehicle.make} ${vehicle.model}`} style={{ height: '100%' }} />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(8,13,26,0.95) 0%, rgba(8,13,26,0.4) 60%, transparent 100%)' }} />
        <div style={{ position: 'absolute', bottom: '32px', left: '40px' }}>
          <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
            <span className="badge badge-accent">{vehicle.category}</span>
            <span className="badge badge-muted">{vehicle.fuelType}</span>
            <span className="badge badge-muted">{vehicle.condition}</span>
          </div>
          <h1 style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 900, fontSize: 'clamp(1.6rem, 4vw, 3rem)', color: '#f1f5f9', lineHeight: 1.1 }}>
            {vehicle.make} {vehicle.model}
          </h1>
          <p style={{ color: '#94a3b8', marginTop: '8px' }}>{vehicle.year} · {vehicle.mileage?.toLocaleString()} km</p>
        </div>
      </div>

      {/* Content */}
      <div style={{ maxWidth: 1000, margin: '0 auto', padding: '48px 24px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '40px', alignItems: 'start' }}>

          {/* Left */}
          <div>
            {/* Specs grid */}
            <h2 style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 700, fontSize: '1.1rem', color: '#f1f5f9', marginBottom: '20px' }}>Vehicle Specifications</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '12px', marginBottom: '40px' }}>
              {specs(vehicle).map(({ icon, label, value }) => (
                <div key={label} style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '12px', padding: '16px', textAlign: 'center' }}>
                  <div style={{ fontSize: '1.4rem', marginBottom: '6px' }}>{icon}</div>
                  <div style={{ color: '#64748b', fontSize: '0.72rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '4px' }}>{label}</div>
                  <div style={{ color: '#f1f5f9', fontWeight: 600, fontSize: '0.92rem' }}>{value}</div>
                </div>
              ))}
            </div>

            {/* Description */}
            {vehicle.description && (
              <>
                <h2 style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 700, fontSize: '1.1rem', color: '#f1f5f9', marginBottom: '12px' }}>About this Vehicle</h2>
                <p style={{ color: '#94a3b8', lineHeight: 1.8, fontSize: '0.95rem', background: 'var(--surface)', padding: '20px', borderRadius: '12px', border: '1px solid var(--border)' }}>{vehicle.description}</p>
              </>
            )}
          </div>

          {/* Right sticky CTA */}
          <div style={{ position: 'sticky', top: '88px', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '20px', padding: '28px', width: '280px', flexShrink: 0 }}>
            <div style={{ marginBottom: '20px' }}>
              <p style={{ color: '#64748b', fontSize: '0.78rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '6px' }}>Base Price</p>
              <p style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 900, fontSize: '2rem', color: '#60a5fa' }}>LKR {vehicle.basePrice?.toLocaleString()}</p>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <button onClick={addToFavorites} className="btn btn-ghost btn-block">❤️ Save to Favorites</button>

              {vehicle.purpose === 'auction' && (
                <Link to={vehicle.activeAuctionId ? `/auctions/${vehicle.activeAuctionId}` : `/auctions`} className="btn btn-danger btn-block">
                  🔨 {vehicle.activeAuctionId ? 'Bid Now' : 'View Auctions'}
                </Link>
              )}

              {vehicle.purpose === 'rent' && (
                <Link to={`/rentals/${id}`} className="btn btn-success btn-block">🔑 Rent Now</Link>
              )}

              {vehicle.purpose === 'sell' && (
                <button onClick={() => toast.info('Contact seller for purchase details.')} className="btn btn-accent btn-block">🏷️ Buy Now</button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}