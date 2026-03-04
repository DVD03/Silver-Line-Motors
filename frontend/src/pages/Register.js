import React, { useState, useContext } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';
import { useToast } from '../components/Toast';
import { validateRegisterForm, passwordStrength } from '../utils/validators';

const FIELDS = [
  { name: 'fullName', label: 'Full Name', type: 'text', required: true },
  { name: 'username', label: 'Username', type: 'text', required: true },
  { name: 'email', label: 'Email', type: 'email', required: true },
  { name: 'nic', label: 'NIC Number', type: 'text', required: true },
  { name: 'phone', label: 'Phone', type: 'tel', required: false },
  { name: 'address', label: 'Address', type: 'text', required: false },
];

export default function Register() {
  const [form, setForm] = useState({ fullName: '', username: '', email: '', password: '', confirmPassword: '', nic: '', phone: '', address: '' });
  const [touched, setTouched] = useState({});
  const [errors, setErrors] = useState({});
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();
  const toast = useToast();

  const pwdStr = passwordStrength(form.password);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(p => ({ ...p, [name]: value }));
    if (touched[name]) {
      const allErrs = validateRegisterForm({ ...form, [name]: value });
      setErrors(p => ({ ...p, [name]: allErrs[name] }));
    }
  };

  const handleBlur = (e) => {
    const { name } = e.target;
    setTouched(p => ({ ...p, [name]: true }));
    const allErrs = validateRegisterForm(form);
    setErrors(p => ({ ...p, [name]: allErrs[name] }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const allErrs = validateRegisterForm(form);
    setErrors(allErrs);
    setTouched(Object.keys(form).reduce((acc, k) => ({ ...acc, [k]: true }), {}));
    if (Object.keys(allErrs).length) { toast.error('Please fix the errors below.'); return; }
    setLoading(true);
    try {
      const res = await axios.post('http://localhost:5000/api/auth/register', form);
      login(res.data);
      toast.success('Account created! Welcome to Silver Line Motors.');
      navigate('/');
    } catch (err) {
      const msg = err.response?.data?.error || 'Registration failed. Please try again.';
      setErrors({ server: msg });
      toast.error(msg);
    } finally { setLoading(false); }
  };

  const fieldStatus = (name) => {
    if (!touched[name]) return null;
    return errors[name] ? 'error' : 'success';
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg)' }}>
      {/* Brand panel */}
      <div style={{ flex: '0 0 40%', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', background: 'linear-gradient(135deg, #0a1229 0%, #0d1a3a 100%)', padding: '60px 40px', position: 'relative', overflow: 'hidden' }} className="auth-brand">
        {[{ x: '15%', y: '25%', s: 160, c: 'rgba(99,102,241,0.15)' }, { x: '65%', y: '55%', s: 120, c: 'rgba(59,130,246,0.12)' }].map((o, i) => (
          <div key={i} style={{ position: 'absolute', left: o.x, top: o.y, width: o.s, height: o.s, borderRadius: '50%', background: o.c, filter: 'blur(50px)', animation: `float ${5 + i * 2}s ease-in-out infinite` }} />
        ))}
        <div style={{ position: 'relative', textAlign: 'center' }}>
          <div style={{ width: 64, height: 64, borderRadius: '16px', background: 'linear-gradient(135deg, #3b82f6, #6366f1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.6rem', fontWeight: 900, color: '#fff', margin: '0 auto 20px', boxShadow: '0 12px 32px rgba(59,130,246,0.3)' }}>SL</div>
          <h2 style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 800, color: '#f1f5f9', fontSize: '1.6rem', marginBottom: '12px' }}>Join Silver Line Motors</h2>
          <p style={{ color: '#64748b', fontSize: '0.9rem', lineHeight: 1.7 }}>Create your free account and start bidding, renting, or listing your vehicle today.</p>
        </div>
      </div>

      {/* Form */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 24px', overflowY: 'auto' }}>
        <div style={{ width: '100%', maxWidth: 480 }}>
          <h2 style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 800, fontSize: '1.8rem', color: '#f1f5f9', marginBottom: '8px' }}>Create Account</h2>
          <p style={{ color: '#64748b', marginBottom: '32px' }}>Fill in your details to get started</p>

          <form onSubmit={handleSubmit}>
            {errors.server && (
              <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: '8px', padding: '10px 14px', marginBottom: '20px', color: '#fca5a5', fontSize: '0.87rem' }}>{errors.server}</div>
            )}

            {FIELDS.map(({ name, label, type }) => (
              <div key={name} style={{ position: 'relative', marginBottom: '16px' }}>
                <div className="floating-group" style={{ marginBottom: 0 }}>
                  <input
                    className={`input-field${fieldStatus(name) === 'error' ? ' error' : fieldStatus(name) === 'success' ? ' success' : ''}`}
                    name={name} id={name} type={type} placeholder=" "
                    value={form[name]} onChange={handleChange} onBlur={handleBlur}
                  />
                  <label className="floating-label" htmlFor={name}>{label}{name === 'fullName' || name === 'username' || name === 'email' || name === 'nic' ? ' *' : ''}</label>
                </div>
                {fieldStatus(name) && (
                  <span style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', fontSize: '0.9rem' }}>
                    {fieldStatus(name) === 'success' ? '✅' : '❌'}
                  </span>
                )}
                {errors[name] && <p style={{ color: '#ef4444', fontSize: '0.75rem', marginTop: '4px' }}>{errors[name]}</p>}
              </div>
            ))}

            {/* Password */}
            <div style={{ position: 'relative', marginBottom: '4px' }}>
              <div className="floating-group" style={{ marginBottom: 0 }}>
                <input className={`input-field${fieldStatus('password') === 'error' ? ' error' : ''}`} id="password" name="password" type={showPwd ? 'text' : 'password'} placeholder=" " value={form.password} onChange={handleChange} onBlur={handleBlur} style={{ paddingRight: '48px' }} />
                <label className="floating-label" htmlFor="password">Password *</label>
                <button type="button" onClick={() => setShowPwd(!showPwd)} style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: '#64748b', cursor: 'pointer' }}>{showPwd ? '🙈' : '👁'}</button>
              </div>
            </div>
            {form.password && (
              <div style={{ marginBottom: '12px' }}>
                <div className="strength-bar"><div className="strength-fill" style={{ width: `${(pwdStr.score / 4) * 100}%`, background: pwdStr.color }} /></div>
                <p style={{ fontSize: '0.72rem', color: pwdStr.color, marginTop: '4px' }}>{pwdStr.label}</p>
              </div>
            )}
            {errors.password && <p style={{ color: '#ef4444', fontSize: '0.75rem', marginBottom: '12px' }}>{errors.password}</p>}

            {/* Confirm password */}
            <div className="floating-group">
              <input className={`input-field${fieldStatus('confirmPassword') === 'error' ? ' error' : ''}`} id="confirmPassword" name="confirmPassword" type="password" placeholder=" " value={form.confirmPassword} onChange={handleChange} onBlur={handleBlur} />
              <label className="floating-label" htmlFor="confirmPassword">Confirm Password *</label>
              {errors.confirmPassword && <p style={{ color: '#ef4444', fontSize: '0.75rem', marginTop: '4px' }}>{errors.confirmPassword}</p>}
            </div>

            <button type="submit" disabled={loading} className="btn btn-primary btn-block btn-lg" style={{ marginTop: '8px', marginBottom: '20px' }}>
              {loading ? <><span className="spinner" /> Creating account...</> : 'Create Account →'}
            </button>
          </form>

          <p style={{ textAlign: 'center', color: '#64748b', fontSize: '0.87rem' }}>
            Already have an account?{' '}<Link to="/login" style={{ color: '#60a5fa', fontWeight: 600 }}>Sign In</Link>
          </p>
        </div>
      </div>
      <style>{`@media(max-width:768px){.auth-brand{display:none!important}}`}</style>
    </div>
  );
}