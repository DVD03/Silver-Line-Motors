import React from 'react';

export default function Skeleton({ type = 'card', count = 6 }) {
    if (type === 'card') {
        return (
            <div className="grid-3" style={{ maxWidth: '1200px', margin: '0 auto' }}>
                {Array.from({ length: count }).map((_, i) => (
                    <div key={i} className="skeleton-card" style={{ animationDelay: `${i * 0.08}s` }}>
                        <div className="skeleton-pulse" style={{ height: '220px', borderRadius: 0 }} />
                        <div style={{ padding: '20px' }}>
                            <div className="skeleton-pulse" style={sk.title} />
                            <div className="skeleton-pulse" style={sk.line} />
                            <div className="skeleton-pulse" style={sk.lineShort} />
                            <div className="skeleton-pulse" style={sk.btn} />
                        </div>
                    </div>
                ))}
            </div>
        );
    }

    if (type === 'detail') {
        return (
            <div style={{ maxWidth: '1000px', margin: '40px auto', padding: '0 24px' }}>
                <div className="skeleton-card">
                    <div className="skeleton-pulse" style={{ height: '380px', borderRadius: 0 }} />
                    <div style={{ padding: '32px' }}>
                        <div className="skeleton-pulse" style={{ ...sk.title, width: '60%' }} />
                        <div className="skeleton-pulse" style={sk.line} />
                        <div className="skeleton-pulse" style={sk.line} />
                        <div className="skeleton-pulse" style={{ ...sk.line, width: '40%' }} />
                    </div>
                </div>
            </div>
        );
    }

    if (type === 'list') {
        return (
            <div style={{ maxWidth: '1000px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {Array.from({ length: count }).map((_, i) => (
                    <div key={i} className="skeleton-card" style={{ padding: '20px', display: 'flex', gap: '16px', alignItems: 'center' }}>
                        <div className="skeleton-pulse" style={{ width: '80px', height: '60px', borderRadius: '8px', flexShrink: 0 }} />
                        <div style={{ flex: 1 }}>
                            <div className="skeleton-pulse" style={sk.title} />
                            <div className="skeleton-pulse" style={{ ...sk.line, width: '50%' }} />
                        </div>
                        <div className="skeleton-pulse" style={{ width: '80px', height: '28px', borderRadius: '20px' }} />
                    </div>
                ))}
            </div>
        );
    }

    return null;
}

const sk = {
    title: { height: '22px', marginBottom: '12px', width: '75%' },
    line: { height: '14px', marginBottom: '10px' },
    lineShort: { height: '14px', marginBottom: '16px', width: '55%' },
    btn: { height: '38px', borderRadius: '20px', width: '110px' },
};
