import React, { useState, useContext } from 'react';
import axios from 'axios';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';
import { useToast } from '../components/Toast';
import { validateLoginForm } from '../utils/validators';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();
  const toast = useToast();
  const from = location.state?.from || '/';

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validateLoginForm({ username, password });
    setErrors(errs);
    if (Object.keys(errs).length) return;
    setLoading(true);
    try {
      const res = await axios.post('http://localhost:5000/api/auth/login', { username, password });
      login(res.data);
      toast.success(`Welcome back, ${res.data.user?.username || username}!`);
      navigate(from, { replace: true });
    } catch (err) {
      const msg = err.response?.data?.error || 'Invalid credentials. Please try again.';
      setErrors({ server: msg });
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg)' }}>
      {/* Left Brand Panel */}
      <div style={{
        flex: '0 0 45%', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center',
        background: 'linear-gradient(135deg, #0a1229 0%, #0d1a3a 100%)',
        padding: '60px 48px', position: 'relative', overflow: 'hidden',
      }} className="auth-brand">
        {/* Orbs */}
        {[{ x: '10%', y: '20%', s: 180, c: 'rgba(59,130,246,0.15)' }, { x: '70%', y: '60%', s: 140, c: 'rgba(99,102,241,0.12)' }].map((o, i) => (
          <div key={i} style={{ position: 'absolute', left: o.x, top: o.y, width: o.s, height: o.s, borderRadius: '50%', background: o.c, filter: 'blur(50px)', animation: `float ${6 + i * 2}s ease-in-out infinite`, animationDelay: `${i}s` }} />
        ))}
        <div style={{ position: 'relative', textAlign: 'center' }}>
          <div style={{ width: 64, height: 64, borderRadius: '16px', background: 'linear-gradient(135deg, #3b82f6, #6366f1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.6rem', fontWeight: 900, color: '#fff', margin: '0 auto 24px', boxShadow: '0 12px 32px rgba(59,130,246,0.3)' }}>SL</div>
          <h1 style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 900, fontSize: 'clamp(1.6rem, 3vw, 2.2rem)', color: '#f1f5f9', marginBottom: '12px' }}>Silver Line Motors</h1>
          <p style={{ color: '#64748b', fontSize: '1rem', lineHeight: 1.7 }}>Sri Lanka's premier vehicle marketplace for auctions, rentals &amp; sales.</p>
          <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', marginTop: '40px' }}>
            {['500+ Vehicles', 'Real-time Bidding', 'Secure Platform'].map(f => (
              <div key={f} style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '8px', padding: '8px 12px', fontSize: '0.75rem', color: '#94a3b8' }}>✓ {f}</div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Form Panel */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 24px' }}>
        <div style={{ width: '100%', maxWidth: 420 }}>
          <h2 style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 800, fontSize: '2rem', color: '#f1f5f9', marginBottom: '8px' }}>Welcome back</h2>
          <p style={{ color: '#64748b', marginBottom: '36px' }}>Sign in to your account to continue</p>

          <form onSubmit={handleSubmit}>
            <div className="floating-group">
              <input className={`input-field${errors.username ? ' error' : ''}`} id="username" type="text" placeholder=" " value={username} onChange={e => setUsername(e.target.value)} autoComplete="username" />
              <label className="floating-label" htmlFor="username">Username</label>
              {errors.username && <p style={{ color: '#ef4444', fontSize: '0.78rem', marginTop: '4px' }}>{errors.username}</p>}
            </div>

            <div className="floating-group" style={{ position: 'relative' }}>
              <input className={`input-field${errors.password ? ' error' : ''}`} id="password" type={showPwd ? 'text' : 'password'} placeholder=" " value={password} onChange={e => setPassword(e.target.value)} style={{ paddingRight: '48px' }} autoComplete="current-password" />
              <label className="floating-label" htmlFor="password">Password</label>
              <button type="button" onClick={() => setShowPwd(!showPwd)} style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', fontSize: '1rem' }}>
                {showPwd ? '🙈' : '👁'}
              </button>
              {errors.password && <p style={{ color: '#ef4444', fontSize: '0.78rem', marginTop: '4px' }}>{errors.password}</p>}
            </div>

            {errors.server && (
              <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: '8px', padding: '10px 14px', marginBottom: '16px', color: '#fca5a5', fontSize: '0.87rem' }}>
                {errors.server}
              </div>
            )}

            <button type="submit" disabled={loading} className="btn btn-primary btn-block btn-lg" style={{ marginBottom: '20px' }}>
              {loading ? <><span className="spinner" /> Signing in...</> : 'Sign In →'}
            </button>
          </form>

          <div className="divider" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ color: '#334155', fontSize: '0.8rem' }}>Don't have an account?</span>
          </div>
          <Link to="/register" className="btn btn-outline btn-block" style={{ marginTop: '12px', textAlign: 'center' }}>Create Account</Link>
          <p style={{ textAlign: 'center', marginTop: '24px', fontSize: '0.8rem', color: '#475569' }}>
            Are you an admin?{' '}<Link to="/admin-login" style={{ color: '#6366f1', fontWeight: 600 }}>Admin Login</Link>
          </p>
        </div>
      </div>

      <style>{`@media(max-width:768px){.auth-brand{display:none!important}}`}</style>
    </div>
  );
}