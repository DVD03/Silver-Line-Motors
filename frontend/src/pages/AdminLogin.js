import React, { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../contexts/AuthContext';
import { useToast } from '../components/Toast';

const API = 'http://localhost:5000';

export default function AdminLogin() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login, user } = useContext(AuthContext);
  const navigate = useNavigate();
  const toast = useToast();

  if (user?.role === 'admin') { navigate('/admin'); return null; }

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username || !password) { setError('Both fields are required.'); return; }
    setLoading(true); setError('');
    try {
      const res = await axios.post(`${API}/api/auth/admin-login`, { username, password });
      login(res.data);
      toast.success('Welcome, Admin!');
      navigate('/admin');
    } catch (err) {
      const msg = err.response?.data?.error || 'Login failed. Check your admin credentials.';
      setError(msg);
    } finally { setLoading(false); }
  };

  return (
    <div style={{ background: 'var(--bg)', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
      <div style={{ width: '100%', maxWidth: 400 }}>
        {/* Icon */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{ width: 72, height: 72, borderRadius: '20px', background: 'linear-gradient(135deg, #6366f1, #3b82f6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', margin: '0 auto 16px', boxShadow: '0 8px 32px rgba(99,102,241,0.4), 0 0 0 1px rgba(99,102,241,0.2)' }}>🛡️</div>
          <h1 style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 900, fontSize: '1.8rem', color: '#f1f5f9' }}>Admin Portal</h1>
          <p style={{ color: '#64748b', marginTop: '6px', fontSize: '0.9rem' }}>Restricted to authorized administrators only</p>
        </div>

        <div style={{ background: 'var(--surface)', border: '1px solid rgba(99,102,241,0.15)', borderRadius: '20px', padding: '36px', boxShadow: '0 0 0 1px rgba(99,102,241,0.08), 0 20px 60px rgba(0,0,0,0.5)' }}>
          <form onSubmit={handleSubmit}>
            <div className="floating-group">
              <input className={`input-field${error ? ' error' : ''}`} id="username" type="text" placeholder=" " value={username} onChange={e => setUsername(e.target.value)} autoComplete="username" />
              <label className="floating-label" htmlFor="username">Admin Username</label>
            </div>
            <div className="floating-group" style={{ position: 'relative' }}>
              <input className={`input-field${error ? ' error' : ''}`} id="password" type={showPwd ? 'text' : 'password'} placeholder=" " value={password} onChange={e => setPassword(e.target.value)} style={{ paddingRight: '48px' }} autoComplete="current-password" />
              <label className="floating-label" htmlFor="password">Password</label>
              <button type="button" onClick={() => setShowPwd(!showPwd)} style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: '#64748b', cursor: 'pointer' }}>{showPwd ? '🙈' : '👁'}</button>
            </div>
            {error && (
              <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: '8px', padding: '10px 14px', marginBottom: '16px', color: '#fca5a5', fontSize: '0.85rem', animation: 'shake 0.4s ease' }}>
                {error}
              </div>
            )}
            <button type="submit" disabled={loading} className="btn btn-primary btn-block btn-lg" style={{ background: 'linear-gradient(135deg, #6366f1, #3b82f6)' }}>
              {loading ? <><span className="spinner" /> Authenticating...</> : '🛡️ Sign In as Admin'}
            </button>
          </form>
        </div>
        <p style={{ textAlign: 'center', marginTop: '20px', color: '#475569', fontSize: '0.82rem' }}>
          Not an admin? <Link to="/login" style={{ color: '#60a5fa' }}>User Login</Link>
        </p>
      </div>
    </div>
  );
}