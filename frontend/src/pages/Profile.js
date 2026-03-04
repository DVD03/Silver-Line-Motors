import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../contexts/AuthContext';
import { useToast } from '../components/Toast';
import { isPhoneNumber } from '../utils/validators';

const API = 'http://localhost:5000';

export default function Profile() {
  const { user, token } = useContext(AuthContext);
  const toast = useToast();
  const [profile, setProfile] = useState({ fullName: '', address: '', phone: '' });
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const favorites = user?.favorites || [];
  const bidHistory = user?.bidHistory || [];

  useEffect(() => {
    if (user) setProfile({ fullName: user.profile?.fullName || user.fullName || '', address: user.profile?.address || user.address || '', phone: user.profile?.phone || user.phone || '' });
  }, [user]);

  const validate = () => {
    const errs = {};
    if (profile.fullName && profile.fullName.trim().length < 2) errs.fullName = 'Full name must be at least 2 characters';
    if (profile.phone && !isPhoneNumber(profile.phone)) errs.phone = 'Enter a valid 10-digit phone number';
    if (profile.address && profile.address.length > 200) errs.address = 'Address must be under 200 characters';
    return errs;
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    const errs = validate();
    setErrors(errs);
    if (Object.keys(errs).length) return;
    setSaving(true);
    try {
      await axios.put(`${API}/api/profile`, profile, { headers: { Authorization: `Bearer ${token}` } });
      toast.success('Profile updated successfully!');
    } catch { toast.error('Failed to update profile.'); }
    finally { setSaving(false); }
  };

  const initials = user?.username?.[0]?.toUpperCase() || '?';

  return (
    <div style={{ background: 'var(--bg)', minHeight: '100vh' }}>
      <div className="page-hero">
        <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'linear-gradient(135deg, #3b82f6, #6366f1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', fontWeight: 900, color: '#fff', margin: '0 auto 16px', boxShadow: '0 0 0 4px rgba(59,130,246,0.25), 0 8px 24px rgba(59,130,246,0.3)' }}>
          {initials}
        </div>
        <h1 className="heading-lg text-gradient">{user?.username}</h1>
        <p style={{ color: '#64748b', marginTop: '6px' }}>{user?.email}</p>
      </div>

      <div style={{ maxWidth: 860, margin: '0 auto', padding: '48px 24px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', alignItems: 'start' }}>

        {/* Personal Info */}
        <div className="card" style={{ padding: '28px' }}>
          <h2 style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 700, fontSize: '1.1rem', color: '#f1f5f9', marginBottom: '24px' }}>Personal Information</h2>
          <form onSubmit={handleUpdate}>
            {[
              { name: 'fullName', label: 'Full Name', type: 'text' },
              { name: 'phone', label: 'Phone Number', type: 'tel' },
            ].map(({ name, label, type }) => (
              <div key={name} className="floating-group">
                <input className={`input-field${errors[name] ? ' error' : ''}`} id={name} name={name} type={type} placeholder=" " value={profile[name] || ''} onChange={e => setProfile(p => ({ ...p, [name]: e.target.value }))} />
                <label className="floating-label" htmlFor={name}>{label}</label>
                {errors[name] && <p style={{ color: '#ef4444', fontSize: '0.75rem', marginTop: '4px' }}>{errors[name]}</p>}
              </div>
            ))}
            <div className="floating-group">
              <textarea className={`input-field${errors.address ? ' error' : ''}`} id="address" name="address" placeholder=" " value={profile.address || ''} onChange={e => setProfile(p => ({ ...p, address: e.target.value }))} style={{ minHeight: '90px', resize: 'vertical' }} />
              <label className="floating-label" htmlFor="address">Address</label>
              {errors.address && <p style={{ color: '#ef4444', fontSize: '0.75rem', marginTop: '4px' }}>{errors.address}</p>}
            </div>
            <button type="submit" disabled={saving} className="btn btn-accent btn-block">
              {saving ? <><span className="spinner" /> Saving...</> : 'Save Changes'}
            </button>
          </form>
        </div>

        {/* Favorites & Bid History */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div className="card" style={{ padding: '24px' }}>
            <h3 style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 700, fontSize: '1rem', color: '#f1f5f9', marginBottom: '16px' }}>
              ❤️ Favorites <span style={{ color: '#64748b', fontWeight: 400 }}>({favorites.length})</span>
            </h3>
            {favorites.length === 0 ? <p style={{ color: '#64748b', fontSize: '0.88rem' }}>No favorites saved yet.</p> : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {favorites.slice(0, 5).map((fav, i) => (
                  <div key={i} style={{ display: 'flex', gap: '10px', padding: '10px', background: 'var(--surface-2)', borderRadius: '8px', alignItems: 'center' }}>
                    <span style={{ color: '#60a5fa', fontSize: '0.88rem', fontWeight: 600 }}>{fav.vehicle?.make} {fav.vehicle?.model}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="card" style={{ padding: '24px' }}>
            <h3 style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 700, fontSize: '1rem', color: '#f1f5f9', marginBottom: '16px' }}>
              🔨 Bid History <span style={{ color: '#64748b', fontWeight: 400 }}>({bidHistory.length})</span>
            </h3>
            {bidHistory.length === 0 ? <p style={{ color: '#64748b', fontSize: '0.88rem' }}>No bids placed yet.</p> : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {bidHistory.slice(0, 5).map((bid, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px', background: 'var(--surface-2)', borderRadius: '8px' }}>
                    <span style={{ color: '#94a3b8', fontSize: '0.85rem' }}>{bid.auction?.vehicle?.make} {bid.auction?.vehicle?.model}</span>
                    <span style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 700, color: '#f59e0b', fontSize: '0.85rem' }}>LKR {bid.amount?.toLocaleString()}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
      <style>{`@media(max-width:720px){[style*="grid-template-columns: 1fr 1fr"]{grid-template-columns:1fr!important}}`}</style>
    </div>
  );
}