import React, { useState, useContext } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';
import { useToast } from '../components/Toast';
import { validateAddVehicleStep1, validateAddVehicleStep2 } from '../utils/validators';

const API = 'http://localhost:5000';

const STEPS = ['Basic Info', 'Specifications', 'Images & Submit'];

export default function AddVehicle() {
  const [step, setStep] = useState(0);
  const [form, setForm] = useState({
    make: '', model: '', year: '', condition: 'Used',
    mileage: '', fuelType: 'Petrol', category: 'Car', basePrice: '', description: '', purpose: 'sell',
    images: null,
  });
  const [errors, setErrors] = useState({});
  const [previews, setPreviews] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const { token } = useContext(AuthContext);
  const navigate = useNavigate();
  const toast = useToast();

  const set = (e) => setForm(p => ({ ...p, [e.target.name]: e.target.value }));

  const handleFiles = (e) => {
    const files = Array.from(e.target.files);
    setForm(p => ({ ...p, images: e.target.files }));
    setPreviews(files.map(f => URL.createObjectURL(f)));
  };

  const validateStep = () => {
    let errs = {};
    if (step === 0) errs = validateAddVehicleStep1(form);
    if (step === 1) errs = validateAddVehicleStep2(form);
    if (step === 2 && (!form.images || form.images.length === 0)) errs.images = 'Please upload at least one image';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const next = () => { if (validateStep()) setStep(s => s + 1); };
  const prev = () => { setStep(s => s - 1); setErrors({}); };

  const handleSubmit = async () => {
    if (!validateStep()) return;
    setSubmitting(true);
    const data = new FormData();
    Object.keys(form).forEach(k => { if (k !== 'images') data.append(k, form[k]); });
    if (form.images) for (let f of form.images) data.append('images', f);
    try {
      await axios.post(`${API}/api/pending-vehicles`, data, { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' } });
      toast.success('Vehicle submitted for admin approval! 🚗');
      setTimeout(() => navigate('/'), 1800);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Submission failed. Please try again.');
    } finally { setSubmitting(false); }
  };

  return (
    <div style={{ background: 'var(--bg)', minHeight: '100vh', padding: '48px 24px 80px' }}>
      <div style={{ maxWidth: 620, margin: '0 auto' }}>
        <div style={{ marginBottom: '40px', textAlign: 'center' }}>
          <span className="badge badge-accent" style={{ marginBottom: '12px', display: 'inline-flex' }}>Submit Vehicle</span>
          <h1 style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 900, fontSize: 'clamp(1.6rem, 4vw, 2.2rem)', color: '#f1f5f9' }}>List Your Vehicle</h1>
          <p style={{ color: '#64748b', marginTop: '8px' }}>Your listing will be reviewed and published within 24 hours.</p>
        </div>

        {/* Step progress */}
        <div className="step-bar">
          {STEPS.map((label, i) => (
            <React.Fragment key={i}>
              <div className="step-item">
                <div className={`step-circle ${i < step ? 'done' : i === step ? 'active' : ''}`}>
                  {i < step ? '✓' : i + 1}
                </div>
                <span className="step-label">{label}</span>
              </div>
              {i < STEPS.length - 1 && <div className={`step-connector${i < step ? ' done' : ''}`} />}
            </React.Fragment>
          ))}
        </div>

        <div className="form-card">
          {/* Step 0 */}
          {step === 0 && (
            <>
              <h3 style={stepHeading}>Basic Information</h3>
              {[['make', 'Make (e.g. Toyota)', 'text'], ['model', 'Model (e.g. Corolla)', 'text'], ['year', 'Year (e.g. 2020)', 'number']].map(([name, label, type]) => (
                <div key={name} className="floating-group">
                  <input className={`input-field${errors[name] ? ' error' : ''}`} id={name} name={name} type={type} placeholder=" " value={form[name]} onChange={set} />
                  <label className="floating-label" htmlFor={name}>{label}</label>
                  {errors[name] && <p style={errStyle}>{errors[name]}</p>}
                </div>
              ))}
              <div style={{ marginBottom: '20px' }}>
                <label style={selectLabel}>Condition</label>
                <select name="condition" value={form.condition} onChange={set} className="input-field">
                  {['New', 'Used', 'Refurbished'].map(o => <option key={o}>{o}</option>)}
                </select>
              </div>
            </>
          )}

          {/* Step 1 */}
          {step === 1 && (
            <>
              <h3 style={stepHeading}>Vehicle Specifications</h3>
              {[['mileage', 'Mileage (km)', 'number'], ['basePrice', 'Base Price (LKR)', 'number']].map(([name, label, type]) => (
                <div key={name} className="floating-group">
                  <input className={`input-field${errors[name] ? ' error' : ''}`} id={name} name={name} type={type} placeholder=" " value={form[name]} onChange={set} />
                  <label className="floating-label" htmlFor={name}>{label}</label>
                  {errors[name] && <p style={errStyle}>{errors[name]}</p>}
                </div>
              ))}
              {[['fuelType', 'Fuel Type', ['Petrol', 'Diesel', 'Electric', 'Hybrid']], ['category', 'Category', ['Car', 'SUV', 'Motorcycle', 'Truck', 'Van', 'PickUp', 'Three Wheeler']], ['purpose', 'Purpose', ['sell', 'auction', 'rent']]].map(([name, label, opts]) => (
                <div key={name} style={{ marginBottom: '20px' }}>
                  <label style={selectLabel}>{label}</label>
                  <select name={name} value={form[name]} onChange={set} className="input-field">{opts.map(o => <option key={o} value={o}>{o.charAt(0).toUpperCase() + o.slice(1)}</option>)}</select>
                </div>
              ))}
              <div className="floating-group">
                <textarea className={`input-field${errors.description ? ' error' : ''}`} id="description" name="description" placeholder=" " value={form.description} onChange={set} style={{ minHeight: '110px', resize: 'vertical' }} />
                <label className="floating-label" htmlFor="description">Description (min 20 characters)</label>
                {errors.description && <p style={errStyle}>{errors.description}</p>}
              </div>
            </>
          )}

          {/* Step 2 */}
          {step === 2 && (
            <>
              <h3 style={stepHeading}>Upload Images</h3>
              <label className="upload-zone" htmlFor="images-upload">
                <input id="images-upload" type="file" multiple accept="image/*" onChange={handleFiles} />
                <div style={{ fontSize: '2.5rem', marginBottom: '12px' }}>📷</div>
                <p style={{ color: '#94a3b8', fontWeight: 600 }}>Click to upload images</p>
                <p style={{ color: '#64748b', fontSize: '0.8rem', marginTop: '4px' }}>Up to 5 images. JPG, PNG, WebP accepted.</p>
              </label>
              {errors.images && <p style={{ ...errStyle, marginTop: '8px' }}>{errors.images}</p>}
              {previews.length > 0 && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px', marginTop: '16px' }}>
                  {previews.map((src, i) => (
                    <img key={i} src={src} alt={`preview-${i}`} style={{ width: '100%', height: '70px', objectFit: 'cover', borderRadius: '8px', border: '1px solid var(--border-2)' }} />
                  ))}
                </div>
              )}

              {/* Summary */}
              <div style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: '12px', padding: '20px', marginTop: '24px' }}>
                <h4 style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 700, color: '#f1f5f9', marginBottom: '12px' }}>Review Summary</h4>
                {[['Vehicle', `${form.make} ${form.model} (${form.year})`], ['Condition', form.condition], ['Mileage', `${Number(form.mileage).toLocaleString()} km`], ['Price', `LKR ${Number(form.basePrice).toLocaleString()}`], ['Purpose', form.purpose], ['Images', `${previews.length} uploaded`]].map(([k, v]) => (
                  <div key={k} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid var(--border)' }}>
                    <span style={{ color: '#64748b', fontSize: '0.85rem' }}>{k}</span>
                    <span style={{ color: '#f1f5f9', fontSize: '0.85rem', fontWeight: 600 }}>{v}</span>
                  </div>
                ))}
              </div>
            </>
          )}

          {/* Navigation */}
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '32px', gap: '12px' }}>
            {step > 0 ? (
              <button onClick={prev} className="btn btn-outline">← Back</button>
            ) : <div />}
            {step < 2 ? (
              <button onClick={next} className="btn btn-primary">Continue →</button>
            ) : (
              <button onClick={handleSubmit} disabled={submitting} className="btn btn-accent btn-lg">
                {submitting ? <><span className="spinner" /> Submitting...</> : '🚗 Submit Vehicle'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

const stepHeading = { fontFamily: "'Outfit', sans-serif", fontWeight: 700, fontSize: '1.1rem', color: '#f1f5f9', marginBottom: '24px' };
const errStyle = { color: '#ef4444', fontSize: '0.75rem', marginTop: '4px' };
const selectLabel = { display: 'block', color: '#94a3b8', fontSize: '0.78rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '8px' };