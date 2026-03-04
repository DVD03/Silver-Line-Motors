import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import io from 'socket.io-client';
import { AuthContext } from '../contexts/AuthContext';
import { useToast } from '../components/Toast';
import { validateBidAmount } from '../utils/validators';
import BlurImage from '../components/BlurImage';
import Skeleton from '../components/Skeleton';

const API = 'http://localhost:5000';
const socket = io(API);

function useCountdown(endTime) {
  const [timeLeft, setTimeLeft] = useState(0);
  useEffect(() => {
    const calc = () => Math.max(0, new Date(endTime).getTime() - Date.now());
    setTimeLeft(calc());
    const id = setInterval(() => setTimeLeft(calc()), 1000);
    return () => clearInterval(id);
  }, [endTime]);
  return timeLeft;
}

function TimerBlock({ value, label }) {
  return (
    <div style={{ textAlign: 'center' }}>
      <div style={{
        background: 'var(--surface-2)', border: '1px solid var(--border-2)',
        borderRadius: '12px', padding: '16px 20px', minWidth: '60px',
        fontFamily: "'Outfit', sans-serif", fontWeight: 900,
        fontSize: '2rem', color: '#f1f5f9', lineHeight: 1,
      }}>{String(value).padStart(2, '0')}</div>
      <p style={{ color: '#64748b', fontSize: '0.7rem', fontWeight: 600, marginTop: '6px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{label}</p>
    </div>
  );
}

export default function Auctions() {
  const { id } = useParams();
  const { user, token } = useContext(AuthContext);
  const navigate = useNavigate();
  const toast = useToast();
  const [auction, setAuction] = useState(null);
  const [loading, setLoading] = useState(true);
  const [bidAmount, setBidAmount] = useState('');
  const [bidError, setBidError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const timeLeft = useCountdown(auction?.endTime);
  const ended = auction && timeLeft === 0;

  const hh = Math.floor(timeLeft / 3600000);
  const mm = Math.floor((timeLeft % 3600000) / 60000);
  const ss = Math.floor((timeLeft % 60000) / 1000);

  const fetchAuction = async () => {
    try {
      const r = await axios.get(`${API}/api/auctions/${id}`, { headers: { Authorization: `Bearer ${token}` } });
      setAuction(r.data);
    } catch {
      // Fallback: Try fetching by vehicle ID if this was a vehicle link
      try {
        const r2 = await axios.get(`${API}/api/auctions/vehicle/${id}`, { headers: { Authorization: `Bearer ${token}` } });
        setAuction(r2.data);
        // Correct the URL without reloading
        window.history.replaceState(null, '', `/auctions/${r2.data._id}`);
      } catch {
        toast.error('Failed to load auction');
      }
    } finally { setLoading(false); }
  };

  useEffect(() => {
    fetchAuction();
    socket.emit('joinAuction', id);
    socket.on('bidUpdate', data => {
      if (data.auctionId === id) {
        setAuction(prev => prev ? { ...prev, currentBid: data.currentBid } : prev);
        toast.info(`New bid: LKR ${data.currentBid?.toLocaleString()}`);
      }
    });
    return () => socket.off('bidUpdate');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const addIncrement = (inc) => setBidAmount(prev => String((Number(prev) || (auction?.currentBid || 0)) + inc));

  const placeBid = async () => {
    if (!user) { toast.info('Please login to place a bid'); navigate('/login'); return; }
    const err = validateBidAmount(bidAmount, auction?.currentBid || 0);
    if (err) { setBidError(err); return; }
    setBidError('');
    setSubmitting(true);
    try {
      await axios.post(`${API}/api/auctions/${id}/bid`, { amount: Number(bidAmount) }, { headers: { Authorization: `Bearer ${token}` } });
      toast.success(`Bid of LKR ${Number(bidAmount).toLocaleString()} placed! 🎉`);
      setBidAmount('');
      fetchAuction();
    } catch (err) {
      const msg = err.response?.data?.error || 'Bid failed';
      setBidError(msg);
      toast.error(msg);
    } finally { setSubmitting(false); }
  };

  if (loading) return <Skeleton type="detail" />;
  if (!auction) return <div style={{ textAlign: 'center', padding: '80px', color: '#64748b' }}>Auction not found.</div>;

  const v = auction.vehicle || {};

  return (
    <div style={{ background: 'var(--bg)', minHeight: '100vh' }}>
      {/* Hero image */}
      <div style={{ position: 'relative', height: 'clamp(240px, 40vh, 420px)', overflow: 'hidden' }}>
        <BlurImage src={`${API}${v.images?.[0] || ''}`} alt={v.make} style={{ height: '100%' }} />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(8,13,26,1) 0%, rgba(8,13,26,0.5) 60%, transparent 100%)' }} />
        <div style={{ position: 'absolute', top: '16px', left: '20px' }}>
          <span className="badge badge-live">🔴 LIVE AUCTION</span>
        </div>
      </div>

      <div style={{ maxWidth: 900, margin: '0 auto', padding: '0 24px 80px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '32px', marginTop: '32px' }}>

          {/* Left */}
          <div>
            <h1 style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 900, fontSize: 'clamp(1.5rem, 3vw, 2.2rem)', color: '#f1f5f9', marginBottom: '8px' }}>
              {v.make} {v.model} <span style={{ color: '#64748b', fontWeight: 500 }}>({v.year})</span>
            </h1>
            <div style={{ display: 'flex', gap: '8px', marginBottom: '32px' }}>
              <span className="badge badge-accent">{v.category}</span>
              <span className="badge badge-muted">{v.fuelType}</span>
              <span className="badge badge-muted">{v.condition}</span>
            </div>

            {/* Timer */}
            <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '16px', padding: '24px', marginBottom: '24px' }}>
              <p style={{ color: '#64748b', fontSize: '0.8rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '16px' }}>
                {ended ? '⏱ Auction Ended' : '⏱ Time Remaining'}
              </p>
              {ended ? (
                <p style={{ fontFamily: "'Outfit', sans-serif", color: '#ef4444', fontSize: '1.2rem', fontWeight: 700 }}>This auction has ended.</p>
              ) : (
                <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                  <TimerBlock value={hh} label="Hours" />
                  <span style={{ color: '#64748b', fontSize: '1.4rem', fontWeight: 700, paddingBottom: '20px' }}>:</span>
                  <TimerBlock value={mm} label="Min" />
                  <span style={{ color: '#64748b', fontSize: '1.4rem', fontWeight: 700, paddingBottom: '20px' }}>:</span>
                  <TimerBlock value={ss} label="Sec" />
                </div>
              )}
            </div>

            {/* Bid history */}
            {auction.bids?.length > 0 && (
              <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '16px', padding: '20px' }}>
                <h3 style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 700, fontSize: '1rem', color: '#f1f5f9', marginBottom: '16px' }}>Recent Bids</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '200px', overflowY: 'auto' }}>
                  {[...auction.bids].reverse().map((b, i) => (
                    <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 14px', background: i === 0 ? 'rgba(245,158,11,0.08)' : 'var(--surface-2)', borderRadius: '8px', border: `1px solid ${i === 0 ? 'rgba(245,158,11,0.2)' : 'var(--border)'}`, animation: 'fadeIn 0.3s ease' }}>
                      <span style={{ color: i === 0 ? '#f1f5f9' : '#94a3b8', fontSize: '0.88rem', fontWeight: i === 0 ? 700 : 400 }}>
                        {b.bidder?.username || 'Anonymous'}
                      </span>
                      <span style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 700, color: i === 0 ? '#f59e0b' : '#64748b', fontSize: '0.9rem' }}>
                        LKR {b.amount?.toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right – bidding panel */}
          <div style={{ position: 'sticky', top: '88px' }}>
            <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '20px', padding: '28px' }}>
              <p style={{ color: '#64748b', fontSize: '0.72rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '6px' }}>Current Bid</p>
              <p style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 900, fontSize: '2.4rem', color: '#f59e0b', lineHeight: 1, marginBottom: '24px' }}>
                LKR {auction.currentBid?.toLocaleString()}
              </p>

              {!ended && (
                <>
                  {/* Quick increments */}
                  <p style={{ color: '#94a3b8', fontSize: '0.8rem', marginBottom: '8px' }}>Quick add:</p>
                  <div style={{ display: 'flex', gap: '6px', marginBottom: '16px', flexWrap: 'wrap' }}>
                    {[1000, 5000, 10000].map(inc => (
                      <button key={inc} onClick={() => addIncrement(inc)} className="btn btn-ghost btn-sm" style={{ fontSize: '0.78rem' }}>
                        +{(inc / 1000).toFixed(0)}K
                      </button>
                    ))}
                  </div>

                  <div className="input-wrapper">
                    <input
                      type="number"
                      className={`input-field${bidError ? ' error' : ''}`}
                      placeholder={`Min: LKR ${((auction.currentBid || 0) + 500).toLocaleString()}`}
                      value={bidAmount}
                      onChange={e => { setBidAmount(e.target.value); setBidError(''); }}
                    />
                    {bidError && <p style={{ color: '#ef4444', fontSize: '0.78rem', marginTop: '6px' }}>{bidError}</p>}
                  </div>

                  <button onClick={placeBid} disabled={submitting} className="btn btn-danger btn-block btn-lg" style={{ marginTop: '8px' }}>
                    {submitting ? <><span className="spinner" /> Placing bid...</> : '🔨 Place Bid'}
                  </button>
                  <p style={{ color: '#475569', fontSize: '0.75rem', textAlign: 'center', marginTop: '12px' }}>
                    Minimum increment: LKR 500
                  </p>
                </>
              )}

              {ended && (
                <div style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: '10px', padding: '16px', textAlign: 'center', color: '#fca5a5', fontSize: '0.9rem' }}>
                  🏁 This auction has closed.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}