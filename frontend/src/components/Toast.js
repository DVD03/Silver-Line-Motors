import React, { createContext, useContext, useState, useCallback } from 'react';
import '../theme.css';

const ToastContext = createContext(null);

export function useToast() {
    return useContext(ToastContext);
}

export function ToastProvider({ children }) {
    const [toasts, setToasts] = useState([]);

    const addToast = useCallback((message, type = 'info', duration = 3500) => {
        const id = Date.now() + Math.random();
        setToasts(prev => [...prev, { id, message, type }]);
        setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), duration);
    }, []);

    const removeToast = useCallback((id) => {
        setToasts(prev => prev.filter(t => t.id !== id));
    }, []);

    const toast = {
        success: (msg) => addToast(msg, 'success'),
        error: (msg) => addToast(msg, 'error'),
        info: (msg) => addToast(msg, 'info'),
    };

    return (
        <ToastContext.Provider value={toast}>
            {children}
            <div style={styles.container}>
                {toasts.map(t => (
                    <div key={t.id} style={{ ...styles.toast, ...styles[t.type] }}>
                        <span style={styles.icon}>{icons[t.type]}</span>
                        <span style={styles.msg}>{t.message}</span>
                        <button style={styles.close} onClick={() => removeToast(t.id)}>✕</button>
                    </div>
                ))}
            </div>
        </ToastContext.Provider>
    );
}

const icons = {
    success: '✓',
    error: '✕',
    info: 'ℹ',
};

const styles = {
    container: {
        position: 'fixed',
        top: '88px',
        right: '24px',
        zIndex: 9999,
        display: 'flex',
        flexDirection: 'column',
        gap: '10px',
        maxWidth: '360px',
        width: 'calc(100vw - 48px)',
        pointerEvents: 'none',
    },
    toast: {
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        padding: '14px 16px',
        borderRadius: '12px',
        boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
        animation: 'slideIn 0.3s cubic-bezier(0.4,0,0.2,1)',
        backdropFilter: 'blur(16px)',
        border: '1px solid rgba(255,255,255,0.08)',
        pointerEvents: 'all',
    },
    success: {
        background: 'rgba(16,185,129,0.15)',
        borderColor: 'rgba(16,185,129,0.3)',
        color: '#6ee7b7',
    },
    error: {
        background: 'rgba(239,68,68,0.15)',
        borderColor: 'rgba(239,68,68,0.3)',
        color: '#fca5a5',
    },
    info: {
        background: 'rgba(59,130,246,0.15)',
        borderColor: 'rgba(59,130,246,0.3)',
        color: '#93c5fd',
    },
    icon: {
        fontSize: '1rem',
        fontWeight: 800,
        flexShrink: 0,
        width: '20px',
        height: '20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: '50%',
        background: 'rgba(255,255,255,0.1)',
    },
    msg: { flex: 1, fontSize: '0.9rem', fontWeight: 500, color: '#f1f5f9' },
    close: {
        background: 'none',
        border: 'none',
        color: 'rgba(255,255,255,0.4)',
        cursor: 'pointer',
        fontSize: '0.75rem',
        padding: '2px 4px',
        borderRadius: '4px',
    },
};
