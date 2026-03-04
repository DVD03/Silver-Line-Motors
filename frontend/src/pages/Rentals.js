import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';
import { useToast } from '../components/Toast';
import BlurImage from '../components/BlurImage';

const API = 'http://localhost:5000';

export default function Rentals() {
  const { id } = useParams();
  const [vehicle, setVehicle] = useState(null);
  const [days, setDays] = useState(1);
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const { user, token } = useContext(AuthContext);
  const navigate = useNavigate();
  const toast = useToast();
  const today = new Date().toISOString().split('T')[0];

  useEffect(() => {
    axios.get(`${API}/api/vehicles/${id}`)
      .then(r => setVehicle(r.data))
      .catch(() => toast.error('Failed to load vehicle'));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const validate = () => {
    const errs = {};
    if (!days || days < 1) errs.days = 'Minimum 1 day required';
    if (days > 90) errs.days = 'Maximum rental period is 90 days';
    if (!startDate || startDate < today) errs.startDate = 'Start date must be today or in the future';
    return errs;
  };

  const bookRental = async () => {
    if (!user) { toast.info('Please login to book a rental'); navigate('/login'); return; }
    const errs = validate();
    setErrors(errs);
    if (Object.keys(errs).length) return;
    setSubmitting(true);
    try {
      await axios.post(`${API}/api/rentals`, { vehicleId: id, days, startDate }, { headers: { Authorization: `Bearer ${token}` } });
      toast.success('Rental booked successfully! 🎉');
      setTimeout(() => navigate('/my-rentals'), 1500);
    } catch (err) {
      const msg = err.response?.data?.error || 'Booking failed. Please try again.';
      toast.error(msg);
    } finally { setSubmitting(false); }
  };

  if (!vehicle) return (
    <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b' }}>
      <div style={{ textAlign: 'center' }}>
        <div className="spinner" style={{ width: 40, height: 40, margin: '0 auto 16px', borderWidth: '3px' }} />
        <p>Loading vehicle...</p>
      </div>
    </div>
  );

  const total = vehicle.basePrice * days;

  return (
    <div style={{ background: 'var(--bg)', minHeight: '100vh', padding: '48px 24px 80px' }}>
      <div style={{ maxWidth: 900, margin: '0 auto' }}>
        <div style={{ marginBottom: '32px' }}>
          <span className="badge badge-success" style={{ marginBottom: '12px', display: 'inline-flex' }}>🔑 Rental Booking</span>
          <h1 style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 900, fontSize: 'clamp(1.6rem, 4vw, 2.5rem)', color: '#f1f5f9' }}>
            Rent {vehicle.make} {vehicle.model}
          </h1>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: '32px', alignItems: 'start' }}>
          {/* Left – vehicle info */}
          <div>
            <div style={{ borderRadius: '20px', overflow: 'hidden', marginBottom: '24px' }}>
              <BlurImage src={`${API}${vehicle.images?.[0] || ''}`} alt={vehicle.make} style={{ height: 280 }} />
            </div>
            <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '16px', padding: '24px' }}>
              <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', flexWrap: 'wrap' }}>
                <span className="badge badge-accent">{vehicle.category}</span>
                <span className="badge badge-muted">{vehicle.fuelType}</span>
                <span className="badge badge-muted">{vehicle.condition}</span>
              </div>
              {vehicle.description && <p style={{ color: '#94a3b8', fontSize: '0.9rem', lineHeight: 1.7 }}>{vehicle.description}</p>}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginTop: '20px' }}>
                {[['Year', vehicle.year], ['Mileage', `${vehicle.mileage?.toLocaleString()} km`]].map(([l, v]) => (
                  <div key={l} style={{ background: 'var(--surface-2)', borderRadius: '10px', padding: '12px 16px' }}>
                    <p style={{ color: '#64748b', fontSize: '0.7rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{l}</p>
                    <p style={{ color: '#f1f5f9', fontWeight: 600, fontSize: '0.95rem', marginTop: '4px' }}>{v}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right – booking form */}
          <div style={{ position: 'sticky', top: '88px' }}>
            <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '20px', padding: '28px' }}>
              <h3 style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 700, fontSize: '1.1rem', color: '#f1f5f9', marginBottom: '24px' }}>Booking Details</h3>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ color: '#94a3b8', fontSize: '0.8rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block', marginBottom: '8px' }}>Rental Days</label>
                <input type="number" min="1" max="90" value={days} onChange={e => { setDays(Number(e.target.value)); setErrors(p => ({ ...p, days: undefined })); }}
                  className={`input-field${errors.days ? ' error' : ''}`} />
                {errors.days && <p style={{ color: '#ef4444', fontSize: '0.75rem', marginTop: '4px' }}>{errors.days}</p>}
              </div>

              <div style={{ marginBottom: '24px' }}>
                <label style={{ color: '#94a3b8', fontSize: '0.8rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block', marginBottom: '8px' }}>Start Date</label>
                <input type="date" min={today} value={startDate} onChange={e => { setStartDate(e.target.value); setErrors(p => ({ ...p, startDate: undefined })); }}
                  className={`input-field${errors.startDate ? ' error' : ''}`} />
                {errors.startDate && <p style={{ color: '#ef4444', fontSize: '0.75rem', marginTop: '4px' }}>{errors.startDate}</p>}
              </div>

              {/* Price summary */}
              <div style={{ background: 'rgba(16,185,129,0.07)', border: '1px solid rgba(16,185,129,0.15)', borderRadius: '12px', padding: '16px 20px', marginBottom: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <span style={{ color: '#64748b', fontSize: '0.85rem' }}>LKR {vehicle.basePrice?.toLocaleString()} × {days} day{days !== 1 ? 's' : ''}</span>
                  <span style={{ color: '#94a3b8', fontSize: '0.85rem' }}>= LKR {total.toLocaleString()}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '10px', borderTop: '1px solid rgba(255,255,255,0.06)', marginTop: '6px' }}>
                  <span style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 700, color: '#f1f5f9' }}>Total</span>
                  <span style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 900, fontSize: '1.4rem', color: '#34d399' }}>LKR {total.toLocaleString()}</span>
                </div>
              </div>

              <button onClick={bookRental} disabled={submitting} className="btn btn-success btn-block btn-lg">
                {submitting ? <><span className="spinner" /> Booking...</> : '🔑 Confirm Rental'}
              </button>
              <p style={{ color: '#475569', fontSize: '0.75rem', textAlign: 'center', marginTop: '12px' }}>
                You can cancel up to 24 hours before start date.
              </p>
            </div>
          </div>
        </div>
      </div>

      <style>{`@media(max-width:720px){[style*="grid-template-columns"]{grid-template-columns:1fr!important}}`}</style>
    </div>
  );
}