'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiRequest } from '@/lib/api';

export default function PortalLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e?: React.FormEvent, customEmail?: string, customPass?: string) => {
    if (e) e.preventDefault();
    setError(null);
    setIsLoading(true);

    const loginEmail = customEmail || email;
    const loginPassword = customPass || password;

    try {
      const data = await apiRequest('/auth/login', {
        method: 'POST',
        data: { email: loginEmail, password: loginPassword },
      });

      localStorage.setItem('sutradara_token', data.accessToken);
      localStorage.setItem('sutradara_user', JSON.stringify(data.user));

      router.push('/portal/dashboard');
    } catch (err: any) {
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickLogin = (role: 'admin' | 'staff') => {
    if (role === 'admin') {
      setEmail('admin@sutradara.in');
      setPassword('AdminPassword@2026');
      handleLogin(undefined, 'admin@sutradara.in', 'AdminPassword@2026');
    } else {
      setEmail('staff@sutradara.in');
      setPassword('StaffPassword@2026');
      handleLogin(undefined, 'staff@sutradara.in', 'StaffPassword@2026');
    }
  };

  return (
    <div
      suppressHydrationWarning
      style={{
        minHeight: '100vh',
        background: 'radial-gradient(ellipse at center, #261d15 0%, #110c08 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px',
        color: 'var(--text)',
      }}
    >
      <div
        suppressHydrationWarning
        style={{
          width: '100%',
          maxWidth: '440px',
          background: 'rgba(26, 20, 14, 0.85)',
          backdropFilter: 'blur(16px)',
          border: '1px solid rgba(201, 168, 76, 0.25)',
          borderRadius: '12px',
          padding: '40px 32px',
          boxShadow: '0 24px 64px rgba(0, 0, 0, 0.6)',
        }}
      >
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <span style={{ fontSize: '0.75rem', color: 'var(--gold)', letterSpacing: '0.3em', textTransform: 'uppercase' }}>
            SUTRADARA
          </span>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '1.8rem', color: '#fff', marginTop: '6px' }}>
            Unified Portal Login
          </h1>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-dim)', marginTop: '4px' }}>
            Enter your credentials to access your workspace
          </p>
        </div>

        {error && (
          <div
            style={{
              padding: '12px 14px',
              background: 'rgba(220, 38, 38, 0.15)',
              border: '1px solid rgba(220, 38, 38, 0.4)',
              borderRadius: '6px',
              color: '#fca5a5',
              fontSize: '0.82rem',
              marginBottom: '20px',
            }}
          >
            {error}
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleLogin} suppressHydrationWarning style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.75rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--gold)', marginBottom: '6px' }}>
              Email Address
            </label>
            <input
              type="email"
              required
              suppressHydrationWarning
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. admin@sutradara.in"
              style={{
                width: '100%',
                padding: '12px 14px',
                background: 'rgba(10, 6, 2, 0.6)',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                borderRadius: '6px',
                color: '#fff',
                fontSize: '0.9rem',
                outline: 'none',
              }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.75rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--gold)', marginBottom: '6px' }}>
              Password
            </label>
            <input
              type="password"
              required
              suppressHydrationWarning
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••••"
              style={{
                width: '100%',
                padding: '12px 14px',
                background: 'rgba(10, 6, 2, 0.6)',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                borderRadius: '6px',
                color: '#fff',
                fontSize: '0.9rem',
                outline: 'none',
              }}
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            suppressHydrationWarning
            style={{
              marginTop: '8px',
              padding: '14px',
              background: 'var(--gold)',
              border: 'none',
              borderRadius: '6px',
              color: '#110c08',
              fontSize: '0.85rem',
              fontWeight: 600,
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              cursor: isLoading ? 'not-allowed' : 'pointer',
              opacity: isLoading ? 0.7 : 1,
              transition: 'all 0.2s ease',
            }}
          >
            {isLoading ? 'Signing In...' : 'Enter Portal'}
          </button>
        </form>

        {/* Quick Testing Toggles */}
        <div style={{ marginTop: '32px', paddingTop: '20px', borderTop: '1px solid rgba(255,255,255,0.08)', textAlign: 'center' }}>
          <p style={{ fontSize: '0.72rem', color: 'var(--text-dim)', marginBottom: '12px', letterSpacing: '0.05em' }}>
            QUICK DEV DEMO ACCESS:
          </p>
          <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
            <button
              onClick={() => handleQuickLogin('admin')}
              type="button"
              suppressHydrationWarning
              style={{
                flex: 1,
                padding: '8px 12px',
                background: 'rgba(201, 168, 76, 0.12)',
                border: '1px solid rgba(201, 168, 76, 0.3)',
                borderRadius: '6px',
                color: 'var(--gold)',
                fontSize: '0.75rem',
                cursor: 'pointer',
                fontWeight: 500,
              }}
            >
              👑 Admin Mode
            </button>
            <button
              onClick={() => handleQuickLogin('staff')}
              type="button"
              suppressHydrationWarning
              style={{
                flex: 1,
                padding: '8px 12px',
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                borderRadius: '6px',
                color: '#fff',
                fontSize: '0.75rem',
                cursor: 'pointer',
                fontWeight: 500,
              }}
            >
              📦 Staff Mode
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
