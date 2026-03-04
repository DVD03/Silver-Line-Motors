import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../contexts/AuthContext';
import { useToast } from '../components/Toast';

const API = 'http://localhost:5000';

function ConfirmModal({ message, onConfirm, onCancel }) {
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
      <div style={{ background: 'var(--surface)', border: '1px solid var(--border-2)', borderRadius: '20px', padding: '32px', maxWidth: '400px', width: '100%', boxShadow: '0 24px 80px rgba(0,0,0,0.6)', animation: 'slideDown 0.25s ease' }}>
        <div style={{ fontSize: '2.5rem', textAlign: 'center', marginBottom: '16px' }}>⚠️</div>
        <p style={{ color: '#f1f5f9', textAlign: 'center', fontSize: '1rem', marginBottom: '28px', lineHeight: 1.6 }}>{message}</p>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button onClick={onCancel} className="btn btn-outline btn-block">Cancel</button>
          <button onClick={onConfirm} className="btn btn-danger btn-block">Confirm</button>
        </div>
      </div>
    </div>
  );
}

const TABS = [
  { key: 'vehicles', label: 'Vehicles', icon: '🚗' },
  { key: 'auctions', label: 'Auctions', icon: '🔨' },
  { key: 'rentals', label: 'Rentals', icon: '🔑' },
  { key: 'users', label: 'Users', icon: '👥' },
  { key: 'pending-vehicles', label: 'Pending', icon: '📋' },
];

export default function AdminDashboard() {
  const { token } = useContext(AuthContext);
  const toast = useToast();
  const [tab, setTab] = useState('vehicles');
  const [vehicles, setVehicles] = useState([]);
  const [auctions, setAuctions] = useState([]);
  const [rentals, setRentals] = useState([]);
  const [users, setUsers] = useState([]);
  const [pendings, setPendings] = useState([]);
  const [newAuction, setNewAuction] = useState({ vehicleId: '', startingBid: '', startTime: '', endTime: '' });
  const [auctionErrors, setAuctionErrors] = useState({});
  const [selectedVehicles, setSelectedVehicles] = useState([]);
  const [bulkHours, setBulkHours] = useState('');
  const [confirm, setConfirm] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const h = { Authorization: `Bearer ${token}` };

  const fetch = {
    vehicles: () => axios.get(`${API}/api/vehicles`, { headers: h }).then(r => setVehicles(r.data)).catch(() => { }),
    auctions: () => axios.get(`${API}/api/auctions`, { headers: h }).then(r => setAuctions(r.data)).catch(() => { }),
    rentals: () => axios.get(`${API}/api/rentals`, { headers: h }).then(r => setRentals(r.data)).catch(() => { }),
    users: () => axios.get(`${API}/api/users`, { headers: h }).then(r => setUsers(r.data)).catch(() => { }),
    'pending-vehicles': () => axios.get(`${API}/api/pending-vehicles`, { headers: h }).then(r => setPendings(r.data)).catch(() => { }),
  };

  useEffect(() => { fetch[tab]?.(); if (tab === 'auctions') fetch.vehicles(); }, [tab]); // eslint-disable-line

  const ask = (msg, action) => setConfirm({ msg, action });

  const validateAuction = () => {
    const errs = {};
    const now = new Date().toISOString().slice(0, 16);
    if (!newAuction.vehicleId) errs.vehicleId = 'Select a vehicle';
    if (!newAuction.startingBid || Number(newAuction.startingBid) <= 0) errs.startingBid = 'Enter a valid starting bid';
    if (!newAuction.startTime || newAuction.startTime < now) errs.startTime = 'Start time must be in the future';
    if (!newAuction.endTime || newAuction.endTime <= newAuction.startTime) errs.endTime = 'End time must be after start time';
    return errs;
  };

  const startAuction = async (e) => {
    e.preventDefault();
    const errs = validateAuction();
    setAuctionErrors(errs);
    if (Object.keys(errs).length) return;
    try {
      await axios.post(`${API}/api/auctions`, newAuction, { headers: h });
      toast.success('Auction created!');
      setNewAuction({ vehicleId: '', startingBid: '', startTime: '', endTime: '' });
      fetch.auctions();
    } catch (err) { toast.error(err.response?.data?.error || 'Failed to create auction'); }
  };

  const endAuction = (id) => ask('End this auction? This action cannot be undone.', async () => {
    try {
      await axios.patch(`${API}/api/auctions/${id}/end`, {}, { headers: h });
      toast.success('Auction ended.');
      fetch.auctions();
    } catch { toast.error('Failed to end auction'); }
    setConfirm(null);
  });

  const approve = async (id) => {
    try { await axios.patch(`${API}/api/pending-vehicles/${id}/approve`, {}, { headers: h }); toast.success('Vehicle approved!'); fetch['pending-vehicles'](); }
    catch { toast.error('Failed to approve vehicle'); }
  };

  const reject = (id) => ask('Reject this vehicle submission?', async () => {
    try { await axios.patch(`${API}/api/pending-vehicles/${id}/reject`, {}, { headers: h }); toast.success('Vehicle rejected.'); fetch['pending-vehicles'](); }
    catch { toast.error('Failed to reject'); }
    setConfirm(null);
  });

  const bulkAuction = async () => {
    if (!selectedVehicles.length) { toast.error('Select at least one vehicle'); return; }
    if (!bulkHours || Number(bulkHours) <= 0) { toast.error('Enter a valid duration in hours'); return; }
    try {
      await axios.post(`${API}/api/auctions/bulk`, { vehicleIds: selectedVehicles, durationHours: bulkHours }, { headers: h });
      toast.success(`${selectedVehicles.length} auction(s) started!`);
      setSelectedVehicles([]); setBulkHours(''); fetch.auctions();
    } catch (err) { toast.error(err.response?.data?.error || 'Bulk auction failed'); }
  };

  const stats = [
    { label: 'Total Vehicles', value: vehicles.length, icon: '🚗', color: '#3b82f6' },
    { label: 'Live Auctions', value: auctions.filter(a => a.status === 'active' || a.status === 'Active').length, icon: '🔨', color: '#ef4444' },
    { label: 'Pending', value: pendings.length, icon: '📋', color: '#f59e0b' },
    { label: 'Total Rentals', value: rentals.length, icon: '🔑', color: '#10b981' },
  ];

  const th = { padding: '12px 16px', textAlign: 'left', color: '#64748b', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', borderBottom: '1px solid var(--border)' };
  const td = { padding: '14px 16px', color: '#94a3b8', fontSize: '0.88rem', borderBottom: '1px solid rgba(255,255,255,0.04)' };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg)' }}>
      {confirm && <ConfirmModal message={confirm.msg} onConfirm={confirm.action} onCancel={() => setConfirm(null)} />}

      {/* Sidebar */}
      <aside style={{ width: sidebarOpen ? 220 : 64, background: 'var(--surface)', borderRight: '1px solid var(--border)', padding: '24px 0', flexShrink: 0, transition: 'width 0.3s', overflow: 'hidden' }}>
        <div style={{ padding: '0 12px', marginBottom: '32px', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ width: 36, height: 36, borderRadius: '8px', background: 'linear-gradient(135deg, #6366f1, #3b82f6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.9rem', flexShrink: 0 }}>🛡️</div>
          {sidebarOpen && <span style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 700, fontSize: '0.9rem', color: '#f1f5f9', whiteSpace: 'nowrap' }}>Admin Panel</span>}
        </div>
        {TABS.map(({ key, label, icon }) => (
          <button key={key} onClick={() => setTab(key)} style={{
            display: 'flex', alignItems: 'center', gap: '12px', width: '100%',
            padding: '12px 16px', border: 'none', cursor: 'pointer', textAlign: 'left',
            background: tab === key ? 'rgba(59,130,246,0.1)' : 'transparent',
            borderLeft: `3px solid ${tab === key ? '#3b82f6' : 'transparent'}`,
            color: tab === key ? '#60a5fa' : '#64748b',
            fontSize: '0.88rem', fontWeight: tab === key ? 700 : 400,
            transition: 'all 0.2s',
          }}>
            <span style={{ flexShrink: 0, fontSize: '1rem' }}>{icon}</span>
            {sidebarOpen && <span style={{ whiteSpace: 'nowrap' }}>{label}</span>}
          </button>
        ))}
        <button onClick={() => setSidebarOpen(s => !s)} style={{ display: 'flex', alignItems: 'center', gap: '12px', width: '100%', padding: '12px 16px', border: 'none', background: 'none', color: '#4b5563', cursor: 'pointer', marginTop: '16px', fontSize: '0.85rem' }}>
          <span style={{ flexShrink: 0 }}>{sidebarOpen ? '◀' : '▶'}</span>
          {sidebarOpen && 'Collapse'}
        </button>
      </aside>

      {/* Main */}
      <div style={{ flex: 1, padding: '32px', overflow: 'auto' }}>
        <div style={{ marginBottom: '32px' }}>
          <h1 style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 900, fontSize: '1.9rem', color: '#f1f5f9', marginBottom: '4px' }}>Admin Dashboard</h1>
          <p style={{ color: '#64748b' }}>Manage vehicles, auctions, rentals, and users.</p>
        </div>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '36px' }}>
          {stats.map(({ label, value, icon, color }) => (
            <div key={label} style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '16px', padding: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                <span style={{ fontSize: '1.4rem' }}>{icon}</span>
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: color, boxShadow: `0 0 8px ${color}` }} />
              </div>
              <p style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 900, fontSize: '2rem', color: '#f1f5f9', lineHeight: 1 }}>{value}</p>
              <p style={{ color: '#64748b', fontSize: '0.8rem', marginTop: '4px' }}>{label}</p>
            </div>
          ))}
        </div>

        {/* Vehicles tab */}
        {tab === 'vehicles' && (
          <div>
            <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '16px', padding: '24px', marginBottom: '24px' }}>
              <h3 style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 700, color: '#f1f5f9', marginBottom: '16px' }}>Start Bulk Auction</h3>
              <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-end', flexWrap: 'wrap' }}>
                <div>
                  <label style={{ color: '#64748b', fontSize: '0.78rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block', marginBottom: '8px' }}>Duration (hours)</label>
                  <input type="number" value={bulkHours} onChange={e => setBulkHours(e.target.value)} className="input-field" placeholder="e.g. 24" style={{ width: '160px' }} />
                </div>
                <button onClick={bulkAuction} disabled={!selectedVehicles.length || !bulkHours} className="btn btn-success" style={{ marginBottom: '1px' }}>
                  ⚡ Auction {selectedVehicles.length} Selected
                </button>
                {selectedVehicles.length > 0 && <button onClick={() => setSelectedVehicles([])} className="btn btn-outline btn-sm">Clear selection</button>}
              </div>
            </div>
            <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '16px', overflow: 'hidden' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead><tr><th style={th}><input type="checkbox" onChange={e => setSelectedVehicles(e.target.checked ? vehicles.map(v => v._id) : [])} /></th><th style={th}>Vehicle</th><th style={th}>Category</th><th style={th}>Price</th><th style={th}>Purpose</th></tr></thead>
                <tbody>
                  {vehicles.map(v => (
                    <tr key={v._id} style={{ background: selectedVehicles.includes(v._id) ? 'rgba(59,130,246,0.05)' : 'transparent' }}>
                      <td style={td}><input type="checkbox" checked={selectedVehicles.includes(v._id)} onChange={e => setSelectedVehicles(p => e.target.checked ? [...p, v._id] : p.filter(id => id !== v._id))} /></td>
                      <td style={{ ...td, color: '#f1f5f9', fontWeight: 600 }}>{v.make} {v.model} ({v.year})</td>
                      <td style={td}><span className="badge badge-accent">{v.category}</span></td>
                      <td style={{ ...td, color: '#60a5fa', fontFamily: "'Outfit', sans-serif", fontWeight: 700 }}>LKR {v.basePrice?.toLocaleString()}</td>
                      <td style={td}><span className="badge badge-muted">{v.purpose}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Auctions tab */}
        {tab === 'auctions' && (
          <div>
            <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '16px', padding: '28px', marginBottom: '24px' }}>
              <h3 style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 700, color: '#f1f5f9', marginBottom: '20px' }}>Start New Auction</h3>
              <form onSubmit={startAuction}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                  <div>
                    <label style={{ color: '#64748b', fontSize: '0.78rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block', marginBottom: '8px' }}>Vehicle *</label>
                    <select value={newAuction.vehicleId} onChange={e => setNewAuction(p => ({ ...p, vehicleId: e.target.value }))} className={`input-field${auctionErrors.vehicleId ? ' error' : ''}`}>
                      <option value="">Select a vehicle...</option>
                      {vehicles.map(v => <option key={v._id} value={v._id}>{v.make} {v.model} ({v.year}) — LKR {v.basePrice?.toLocaleString()}</option>)}
                    </select>
                    {auctionErrors.vehicleId && <p style={{ color: '#ef4444', fontSize: '0.75rem', marginTop: '4px' }}>{auctionErrors.vehicleId}</p>}
                  </div>
                  <div>
                    <label style={{ color: '#64748b', fontSize: '0.78rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block', marginBottom: '8px' }}>Starting Bid (LKR) *</label>
                    <input type="number" value={newAuction.startingBid} onChange={e => setNewAuction(p => ({ ...p, startingBid: e.target.value }))} className={`input-field${auctionErrors.startingBid ? ' error' : ''}`} placeholder="e.g. 500000" />
                    {auctionErrors.startingBid && <p style={{ color: '#ef4444', fontSize: '0.75rem', marginTop: '4px' }}>{auctionErrors.startingBid}</p>}
                  </div>
                  <div>
                    <label style={{ color: '#64748b', fontSize: '0.78rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block', marginBottom: '8px' }}>Start Time *</label>
                    <input type="datetime-local" value={newAuction.startTime} onChange={e => setNewAuction(p => ({ ...p, startTime: e.target.value }))} className={`input-field${auctionErrors.startTime ? ' error' : ''}`} />
                    {auctionErrors.startTime && <p style={{ color: '#ef4444', fontSize: '0.75rem', marginTop: '4px' }}>{auctionErrors.startTime}</p>}
                  </div>
                  <div>
                    <label style={{ color: '#64748b', fontSize: '0.78rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block', marginBottom: '8px' }}>End Time *</label>
                    <input type="datetime-local" value={newAuction.endTime} onChange={e => setNewAuction(p => ({ ...p, endTime: e.target.value }))} className={`input-field${auctionErrors.endTime ? ' error' : ''}`} />
                    {auctionErrors.endTime && <p style={{ color: '#ef4444', fontSize: '0.75rem', marginTop: '4px' }}>{auctionErrors.endTime}</p>}
                  </div>
                </div>
                <button type="submit" className="btn btn-success">🔨 Start Auction</button>
              </form>
            </div>
            <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '16px', overflow: 'hidden' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead><tr><th style={th}>Vehicle</th><th style={th}>Current Bid</th><th style={th}>Status</th><th style={th}>Action</th></tr></thead>
                <tbody>
                  {auctions.map(a => (
                    <tr key={a._id}>
                      <td style={{ ...td, color: '#f1f5f9', fontWeight: 600 }}>{a.vehicle?.make} {a.vehicle?.model}</td>
                      <td style={{ ...td, color: '#f59e0b', fontFamily: "'Outfit', sans-serif", fontWeight: 700 }}>LKR {a.currentBid?.toLocaleString()}</td>
                      <td style={td}><span className={`badge ${a.status === 'active' ? 'badge-live' : 'badge-muted'}`}>{a.status}</span></td>
                      <td style={td}><button onClick={() => endAuction(a._id)} className="btn btn-danger btn-sm">End</button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Rentals tab */}
        {tab === 'rentals' && (
          <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '16px', overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead><tr><th style={th}>User</th><th style={th}>Vehicle</th><th style={th}>Dates</th><th style={th}>Total</th><th style={th}>Status</th></tr></thead>
              <tbody>
                {rentals.map(r => (
                  <tr key={r._id}>
                    <td style={td}>{r.user?.username}</td>
                    <td style={{ ...td, color: '#f1f5f9' }}>{r.vehicle?.make} {r.vehicle?.model}</td>
                    <td style={td}>{new Date(r.startDate).toLocaleDateString()} → {new Date(r.endDate).toLocaleDateString()}</td>
                    <td style={{ ...td, color: '#34d399', fontWeight: 700 }}>LKR {r.total?.toLocaleString()}</td>
                    <td style={td}><span className={`chip ${r.status === 'Confirmed' ? 'chip-confirmed' : 'chip-pending'}`}>{r.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Users tab */}
        {tab === 'users' && (
          <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '16px', overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead><tr><th style={th}>Username</th><th style={th}>Email</th><th style={th}>Role</th></tr></thead>
              <tbody>
                {users.map(u => (
                  <tr key={u._id}>
                    <td style={{ ...td, color: '#f1f5f9', fontWeight: 600 }}>{u.username}</td>
                    <td style={td}>{u.email}</td>
                    <td style={td}><span className={`badge ${u.role === 'admin' ? 'badge-gold' : 'badge-muted'}`}>{u.role}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pending vehicles tab */}
        {tab === 'pending-vehicles' && (
          <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '16px', overflow: 'hidden' }}>
            {pendings.length === 0 ? (
              <div style={{ padding: '60px', textAlign: 'center', color: '#64748b' }}>✅ No pending vehicle submissions</div>
            ) : (
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead><tr><th style={th}>Vehicle</th><th style={th}>Submitted By</th><th style={th}>Category</th><th style={th}>Price</th><th style={th}>Actions</th></tr></thead>
                <tbody>
                  {pendings.map(p => (
                    <tr key={p._id}>
                      <td style={{ ...td, color: '#f1f5f9', fontWeight: 600 }}>{p.make} {p.model} ({p.year})</td>
                      <td style={td}>{p.submittedBy?.username}</td>
                      <td style={td}><span className="badge badge-accent">{p.category}</span></td>
                      <td style={{ ...td, color: '#60a5fa', fontWeight: 700 }}>LKR {p.basePrice?.toLocaleString()}</td>
                      <td style={td}>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <button onClick={() => approve(p._id)} className="btn btn-success btn-sm">✓ Approve</button>
                          <button onClick={() => reject(p._id)} className="btn btn-danger btn-sm">✕ Reject</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}
      </div>

      <style>{`@media(max-width:900px){[style*="grid-template-columns: repeat(4"]{grid-template-columns:repeat(2,1fr)!important}}`}</style>
    </div>
  );
}