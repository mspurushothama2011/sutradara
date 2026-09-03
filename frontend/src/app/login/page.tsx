'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { apiRequest } from '@/lib/api';

export default function CustomerLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [step, setStep] = useState<'EMAIL' | 'OTP'>('EMAIL');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [devOtp, setDevOtp] = useState<string | null>(null);

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const res = await apiRequest('/customer/auth/send-otp', {
        method: 'POST',
        body: JSON.stringify({ email }),
      });

      if (res.devOtp) {
        setDevOtp(res.devOtp);
      }
      setStep('OTP');
    } catch (err: any) {
      setError(err.message || 'Failed to send OTP. Please check your email.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const res = await apiRequest('/customer/auth/verify-otp', {
        method: 'POST',
        body: JSON.stringify({ email, otp, name, phone }),
      });

      if (res.accessToken) {
        localStorage.setItem('accessToken', res.accessToken);
        localStorage.setItem('customerUser', JSON.stringify(res.user));
        router.push('/account');
      }
    } catch (err: any) {
      setError(err.message || 'Invalid or expired OTP code.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'radial-gradient(ellipse at center, #1a140e 0%, #0d0906 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '32px 16px',
        color: '#fff',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '460px',
          background: 'rgba(17, 12, 8, 0.95)',
          border: '1px solid var(--gold)',
          borderRadius: '16px',
          padding: '44px 36px',
          boxShadow: '0 32px 80px rgba(0, 0, 0, 0.8)',
          backdropFilter: 'blur(12px)',
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <span style={{ fontSize: '0.75rem', letterSpacing: '0.3em', color: 'var(--gold)', textTransform: 'uppercase' }}>
            SUTRAಧಾರ
          </span>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', color: '#fff', marginTop: '6px' }}>
            Customer Sign In
          </h1>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-dim)', marginTop: '8px' }}>
            {step === 'EMAIL'
              ? 'Enter your email to receive a secure 6-digit verification code'
              : `Enter the code sent to ${email}`}
          </p>
        </div>

        {error && (
          <div
            style={{
              padding: '12px 16px',
              borderRadius: '8px',
              background: 'rgba(239, 68, 68, 0.15)',
              border: '1px solid #ef4444',
              color: '#fca5a5',
              fontSize: '0.85rem',
              marginBottom: '20px',
            }}
          >
            {error}
          </div>
        )}

        {devOtp && step === 'OTP' && (
          <div
            style={{
              padding: '10px 14px',
              borderRadius: '6px',
              background: 'rgba(201, 168, 76, 0.15)',
              border: '1px dashed var(--gold)',
              color: 'var(--gold)',
              fontSize: '0.82rem',
              marginBottom: '20px',
              textAlign: 'center',
            }}
          >
            🔑 Dev Testing Code: <strong>{devOtp}</strong>
          </div>
        )}

        {step === 'EMAIL' ? (
          <form onSubmit={handleSendOtp} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-dim)', marginBottom: '6px' }}>
                Email Address
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="e.g. ananya@example.com"
                suppressHydrationWarning
                style={{
                  width: '100%',
                  padding: '14px',
                  background: 'rgba(10, 6, 3, 0.8)',
                  border: '1px solid rgba(201, 168, 76, 0.3)',
                  borderRadius: '8px',
                  color: '#fff',
                  fontSize: '0.95rem',
                }}
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              suppressHydrationWarning
              style={{
                marginTop: '8px',
                padding: '16px',
                background: 'var(--gold)',
                border: 'none',
                borderRadius: '8px',
                color: '#110c08',
                fontSize: '0.95rem',
                fontWeight: 700,
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                cursor: isLoading ? 'not-allowed' : 'pointer',
                boxShadow: '0 8px 24px rgba(201, 168, 76, 0.3)',
              }}
            >
              {isLoading ? 'Sending Code...' : 'Send Verification Code →'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerifyOtp} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-dim)', marginBottom: '6px' }}>
                6-Digit Verification Code
              </label>
              <input
                type="text"
                required
                maxLength={6}
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                placeholder="••••••"
                suppressHydrationWarning
                style={{
                  width: '100%',
                  padding: '14px',
                  background: 'rgba(10, 6, 3, 0.8)',
                  border: '1px solid var(--gold)',
                  borderRadius: '8px',
                  color: '#fff',
                  fontSize: '1.4rem',
                  letterSpacing: '0.4em',
                  textAlign: 'center',
                  fontFamily: 'monospace',
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-dim)', marginBottom: '6px' }}>
                Your Full Name (Optional)
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Ananya Deshmukh"
                suppressHydrationWarning
                style={{
                  width: '100%',
                  padding: '12px',
                  background: 'rgba(10, 6, 3, 0.8)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '8px',
                  color: '#fff',
                  fontSize: '0.9rem',
                }}
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              suppressHydrationWarning
              style={{
                marginTop: '8px',
                padding: '16px',
                background: 'var(--gold)',
                border: 'none',
                borderRadius: '8px',
                color: '#110c08',
                fontSize: '0.95rem',
                fontWeight: 700,
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                cursor: isLoading ? 'not-allowed' : 'pointer',
              }}
            >
              {isLoading ? 'Verifying...' : 'Verify & Enter Account →'}
            </button>

            <button
              type="button"
              onClick={() => setStep('EMAIL')}
              style={{
                background: 'transparent',
                border: 'none',
                color: 'var(--text-dim)',
                fontSize: '0.8rem',
                cursor: 'pointer',
                textAlign: 'center',
              }}
            >
              ← Change Email Address
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
