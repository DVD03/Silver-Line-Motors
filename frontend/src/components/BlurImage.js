import React, { useState } from 'react';

export default function BlurImage({ src, alt, style = {}, className = '' }) {
    const [loaded, setLoaded] = useState(false);
    const [error, setError] = useState(false);

    return (
        <div style={{ position: 'relative', overflow: 'hidden', background: '#0f1629', ...style }} className={className}>
            {!loaded && !error && (
                <div
                    className="skeleton-pulse"
                    style={{ position: 'absolute', inset: 0, borderRadius: 0 }}
                />
            )}
            {error ? (
                <div style={{
                    position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column',
                    alignItems: 'center', justifyContent: 'center', color: '#64748b', gap: '8px',
                }}>
                    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="9" cy="9" r="2" />
                        <path d="m21 15-5-5L5 21" />
                    </svg>
                    <span style={{ fontSize: '0.75rem' }}>No image</span>
                </div>
            ) : (
                <img
                    src={src}
                    alt={alt}
                    loading="lazy"
                    onLoad={() => setLoaded(true)}
                    onError={() => { setLoaded(true); setError(true); }}
                    style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        transition: 'opacity 0.4s ease, filter 0.4s ease',
                        opacity: loaded ? 1 : 0,
                        filter: loaded ? 'none' : 'blur(12px)',
                    }}
                />
            )}
        </div>
    );
}
