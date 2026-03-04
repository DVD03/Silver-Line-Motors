import React, { useContext, useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';
import { useToast } from './Toast';

export default function NavBar() {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();
  const toast = useToast();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // close mobile menu on route change
  useEffect(() => setMenuOpen(false), [location.pathname]);

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
    navigate('/');
  };

  const isActive = (path) =>
    path === '/' ? location.pathname === '/' : location.pathname.startsWith(path);

  const navLinks = [
    { to: '/', label: 'Home' },
    { to: '/auctions', label: 'Auctions' },
    { to: '/rentals', label: 'Rent' },
  ];

  const userLinks = [
    { to: '/favorites', label: '♥ Favorites' },
    { to: '/my-rentals', label: 'My Rentals' },
    { to: '/my-sales', label: 'My Sales' },
    { to: '/add-vehicle', label: '＋ List Vehicle' },
    { to: '/profile', label: 'Profile' },
  ];

  return (
    <>
      <nav style={{
        position: 'sticky', top: 0, zIndex: 1000,
        background: scrolled ? 'rgba(8,13,26,0.92)' : 'rgba(8,13,26,0.75)',
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
        borderBottom: '1px solid rgba(255,255,255,0.07)',
        boxShadow: scrolled ? '0 8px 32px rgba(0,0,0,0.5)' : 'none',
        transition: 'all 0.4s cubic-bezier(0.4,0,0.2,1)',
        padding: scrolled ? '10px 40px' : '14px 40px',
      }}>
        <div style={{ maxWidth: 1240, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          {/* Logo */}
          <Link to="/" style={{ textDecoration: 'none' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{
                width: 36, height: 36, borderRadius: '8px',
                background: 'linear-gradient(135deg, #3b82f6, #6366f1)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '1rem', fontWeight: 900, color: '#fff', flexShrink: 0,
              }}>SL</div>
              <span style={{
                fontFamily: "'Outfit', sans-serif",
                fontWeight: 800, fontSize: '1.15rem',
                background: 'linear-gradient(135deg, #cbd5e1, #f1f5f9)',
                WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                letterSpacing: '0.01em',
              }}>Silver Line Motors</span>
            </div>
          </Link>

          {/* Desktop Links */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }} className="nav-desktop">
            {navLinks.map(({ to, label }) => (
              <NavLink key={to} to={to} active={isActive(to)}>{label}</NavLink>
            ))}
            {user && userLinks.map(({ to, label }) => (
              <NavLink key={to} to={to} active={isActive(to)}>{label}</NavLink>
            ))}
            {user?.role === 'admin' && (
              <NavLink to="/admin" active={isActive('/admin')}>Admin</NavLink>
            )}
          </div>

          {/* Right section */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {!user ? (
              <>
                <Link to="/login" className="btn btn-ghost btn-sm">Login</Link>
                <Link to="/register" className="btn btn-accent btn-sm">Register</Link>
              </>
            ) : (
              <>
                <div style={{
                  display: 'flex', alignItems: 'center', gap: '8px',
                  background: 'rgba(255,255,255,0.05)', borderRadius: '24px',
                  padding: '5px 12px 5px 5px', border: '1px solid rgba(255,255,255,0.08)',
                }}>
                  <div style={{
                    width: 28, height: 28, borderRadius: '50%',
                    background: 'linear-gradient(135deg, #3b82f6, #6366f1)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '0.72rem', fontWeight: 700, color: '#fff', flexShrink: 0,
                  }}>
                    {user.username?.[0]?.toUpperCase()}
                  </div>
                  <span style={{ fontSize: '0.88rem', fontWeight: 600, color: '#e2e8f0' }}>
                    {user.username}
                  </span>
                </div>
                <button onClick={handleLogout} className="btn btn-outline btn-sm">Logout</button>
              </>
            )}

            {/* Hamburger */}
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              style={{ display: 'none', flexDirection: 'column', gap: '5px', padding: '6px', background: 'none', border: 'none', cursor: 'pointer' }}
              className="hamburger"
              aria-label="Toggle menu"
            >
              {[0, 1, 2].map(i => (
                <div key={i} style={{
                  width: 22, height: 2, background: '#f1f5f9', borderRadius: 2,
                  transition: '0.3s',
                  transform: menuOpen
                    ? i === 0 ? 'rotate(45deg) translateY(7px)'
                      : i === 2 ? 'rotate(-45deg) translateY(-7px)'
                        : 'scaleX(0)'
                    : 'none',
                }} />
              ))}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Drawer */}
      {menuOpen && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 999,
          background: 'rgba(8,13,26,0.95)',
          backdropFilter: 'blur(20px)',
          display: 'flex', flexDirection: 'column',
          padding: '80px 28px 40px',
          animation: 'fadeIn 0.25s ease',
          overflowY: 'auto',
        }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {navLinks.map(({ to, label }) => (
              <MobileLink key={to} to={to} active={isActive(to)} onClick={() => setMenuOpen(false)}>{label}</MobileLink>
            ))}
            {user && userLinks.map(({ to, label }) => (
              <MobileLink key={to} to={to} active={isActive(to)} onClick={() => setMenuOpen(false)}>{label}</MobileLink>
            ))}
            {user?.role === 'admin' && (
              <MobileLink to="/admin" active={isActive('/admin')} onClick={() => setMenuOpen(false)}>Admin Dashboard</MobileLink>
            )}
            <div style={{ height: 1, background: 'rgba(255,255,255,0.07)', margin: '16px 0' }} />
            {!user ? (
              <>
                <Link to="/login" className="btn btn-ghost btn-block" onClick={() => setMenuOpen(false)}>Login</Link>
                <Link to="/register" className="btn btn-accent btn-block" onClick={() => setMenuOpen(false)}>Register</Link>
              </>
            ) : (
              <button onClick={() => { handleLogout(); setMenuOpen(false); }} className="btn btn-outline btn-block">Logout</button>
            )}
          </div>
        </div>
      )}

      <style>{`
        @media (max-width: 900px) {
          .nav-desktop { display: none !important; }
          .hamburger { display: flex !important; }
        }
      `}</style>
    </>
  );
}

function NavLink({ to, active, children }) {
  return (
    <Link to={to} style={{
      padding: '8px 14px',
      borderRadius: '8px',
      fontSize: '0.9rem',
      fontWeight: 600,
      color: active ? '#f1f5f9' : '#94a3b8',
      textDecoration: 'none',
      transition: 'all 0.2s',
      background: active ? 'rgba(255,255,255,0.08)' : 'transparent',
      position: 'relative',
    }}
      onMouseEnter={e => { if (!active) e.currentTarget.style.color = '#f1f5f9'; e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; }}
      onMouseLeave={e => { if (!active) { e.currentTarget.style.color = '#94a3b8'; e.currentTarget.style.background = 'transparent'; } }}
    >
      {children}
      {active && (
        <span style={{
          position: 'absolute', bottom: 2, left: '50%', transform: 'translateX(-50%)',
          width: '20px', height: '2px', background: '#3b82f6', borderRadius: '2px',
        }} />
      )}
    </Link>
  );
}

function MobileLink({ to, active, children, onClick }) {
  return (
    <Link to={to} onClick={onClick} style={{
      padding: '14px 16px',
      borderRadius: '10px',
      fontSize: '1rem',
      fontWeight: 600,
      color: active ? '#60a5fa' : '#94a3b8',
      textDecoration: 'none',
      background: active ? 'rgba(59,130,246,0.1)' : 'transparent',
      border: '1px solid',
      borderColor: active ? 'rgba(59,130,246,0.2)' : 'transparent',
      transition: 'all 0.2s',
    }}>
      {children}
    </Link>
  );
}