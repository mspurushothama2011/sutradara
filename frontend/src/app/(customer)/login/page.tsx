'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { apiRequest } from '@/lib/api';
import TurnstileCaptcha from '@/components/auth/TurnstileCaptcha';
import GoogleAuthButton from '@/components/auth/GoogleAuthButton';
import LandingNavbar from '@/components/landing/LandingNavbar';
import Footer from '@/components/shared/ui/Footer';
import { Key, ArrowLeft, ArrowRight } from 'lucide-react';

function CustomerLoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialEmail = searchParams.get('email') || '';

  const [email, setEmail] = useState(initialEmail);
  const [otp, setOtp] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);

  useEffect(() => {
    if (initialEmail) {
      setEmail(initialEmail);
    }
  }, [initialEmail]);

  const [step, setStep] = useState<'EMAIL' | 'OTP'>('EMAIL');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email || !email.includes('@')) {
      setError('Please enter a valid email address.');
      return;
    }

    if (!turnstileToken) {
      setError('Please complete the security check before generating OTP.');
      return;
    }

    setIsLoading(true);

    try {
      await apiRequest('/customer/auth/send-otp', {
        method: 'POST',
        data: { email, turnstileToken },
      });

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
        data: { email, otp, name, phone },
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

  const handleGoogleSuccess = async (idToken: string) => {
    setError(null);
    setIsLoading(true);

    try {
      const res = await apiRequest('/customer/auth/google', {
        method: 'POST',
        data: { idToken },
      });

      if (res.accessToken) {
        localStorage.setItem('accessToken', res.accessToken);
        localStorage.setItem('customerUser', JSON.stringify(res.user));
        router.push('/account');
      }
    } catch (err: any) {
      setError(err.message || 'Google sign-in could not be completed.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#FAF8F5',
        display: 'flex',
        flexDirection: 'column',
        color: 'var(--text)',
      }}
    >
      <LandingNavbar />

      <div
        style={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '140px 16px 80px 16px',
        }}
      >
        <div
          style={{
            width: '100%',
            maxWidth: '480px',
            background: '#ffffff',
            border: '1px solid rgba(179, 137, 56, 0.35)',
            borderRadius: '3px',
            padding: '40px 36px',
            boxShadow: '0 8px 32px rgba(26, 19, 13, 0.06)',
          }}
        >
          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: '28px' }}>
            <span
              style={{
                fontSize: '0.75rem',
                letterSpacing: '0.3em',
                color: 'var(--gold)',
                textTransform: 'uppercase',
                fontWeight: 700,
              }}
            >
              SUTRAಧಾರ
            </span>
            <h1
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: '2.1rem',
                color: 'var(--text)',
                marginTop: '6px',
              }}
            >
              Customer Sign In
            </h1>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-dim)', marginTop: '8px' }}>
              {step === 'EMAIL'
                ? 'Enter your email to receive a secure 6-digit verification code'
                : `Enter the code sent to ${email}`}
            </p>
          </div>

          {/* Error Banner */}
          {error && (
            <div
              style={{
                marginBottom: '20px',
                padding: '12px 16px',
                background: 'rgba(239, 68, 68, 0.12)',
                border: '1px solid #ef4444',
                borderRadius: '3px',
                color: '#b91c1c',
                fontSize: '0.85rem',
                textAlign: 'center',
                fontWeight: 600,
              }}
            >
              {error}
            </div>
          )}

          {step === 'EMAIL' ? (
            <form onSubmit={handleSendOtp} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--gold)', marginBottom: '6px', fontWeight: 600 }}>
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  placeholder="patron@royalmail.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    background: '#FAF8F5',
                    border: '1px solid rgba(179, 137, 56, 0.3)',
                    borderRadius: '3px',
                    color: 'var(--text)',
                    fontSize: '0.95rem',
                  }}
                />
              </div>

              {/* Cloudflare Turnstile CAPTCHA */}
              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-dim)', marginBottom: '4px', textAlign: 'center' }}>
                  Security Verification (Bot Protection)
                </label>
                <TurnstileCaptcha
                  onVerify={(token) => setTurnstileToken(token)}
                  onExpire={() => setTurnstileToken(null)}
                />
              </div>

              <button
                type="submit"
                disabled={isLoading || !turnstileToken}
                style={{
                  width: '100%',
                  padding: '14px',
                  background: !turnstileToken ? 'rgba(179, 137, 56, 0.3)' : 'var(--gold)',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '3px',
                  fontWeight: 700,
                  fontSize: '0.95rem',
                  letterSpacing: '0.05em',
                  cursor: !turnstileToken || isLoading ? 'not-allowed' : 'pointer',
                  transition: 'all 0.2s ease',
                  marginTop: '4px',
                  boxShadow: '0 4px 14px rgba(179, 137, 56, 0.25)',
                }}
              >
                {isLoading ? 'Generating OTP...' : 'Send Verification Code'}
              </button>

              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', margin: '4px 0' }}>
                <div style={{ flex: 1, height: '1px', background: 'rgba(179, 137, 56, 0.15)' }} />
                <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)', textTransform: 'uppercase' }}>or</span>
                <div style={{ flex: 1, height: '1px', background: 'rgba(179, 137, 56, 0.15)' }} />
              </div>

              {/* Google Sign-in */}
              <GoogleAuthButton
                text="signin_with"
                onSuccess={handleGoogleSuccess}
                onError={() => setError('Google sign-in could not be completed.')}
              />
            </form>
          ) : (
            <form onSubmit={handleVerifyOtp} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--gold)', marginBottom: '8px', textAlign: 'center', fontWeight: 600 }}>
                  Enter 6-Digit Code
                </label>
                <input
                  type="text"
                  required
                  autoFocus
                  maxLength={6}
                  placeholder="••••••"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/[^0-9]/g, ''))}
                  style={{
                    width: '100%',
                    padding: '16px',
                    background: '#FAF8F5',
                    border: '1.5px solid var(--gold)',
                    borderRadius: '3px',
                    color: 'var(--text)',
                    fontSize: '1.6rem',
                    textAlign: 'center',
                    letterSpacing: '8px',
                    fontFamily: 'monospace',
                    fontWeight: 700,
                  }}
                />
              </div>

              <button
                type="submit"
                disabled={isLoading || otp.length < 6}
                style={{
                  width: '100%',
                  padding: '14px',
                  background: otp.length < 6 ? 'rgba(179, 137, 56, 0.3)' : 'var(--gold)',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '3px',
                  fontWeight: 700,
                  fontSize: '0.95rem',
                  letterSpacing: '0.05em',
                  cursor: otp.length < 6 || isLoading ? 'not-allowed' : 'pointer',
                  transition: 'all 0.2s ease',
                  boxShadow: '0 4px 14px rgba(179, 137, 56, 0.25)',
                }}
              >
                {isLoading ? 'Verifying...' : 'Sign In'}
              </button>

              <button
                type="button"
                onClick={() => setStep('EMAIL')}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--gold)',
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                  textDecoration: 'underline',
                  textAlign: 'center',
                  fontWeight: 600,
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '4px',
                }}
              >
                <ArrowLeft size={14} strokeWidth={1.5} /> Change Email Address
              </button>
            </form>
          )}

          {/* Footer toggle to /register */}
          <div
            style={{
              marginTop: '28px',
              paddingTop: '20px',
              borderTop: '1px solid rgba(179, 137, 56, 0.15)',
              textAlign: 'center',
              fontSize: '0.85rem',
              color: 'var(--text-dim)',
            }}
          >
            New to Sutraಧಾರ?{' '}
            <Link
              href="/register"
              style={{
                color: 'var(--gold)',
                fontWeight: 600,
                textDecoration: 'none',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
              }}
            >
              Create Account here <ArrowRight size={14} strokeWidth={1.5} />
            </Link>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}

export default function CustomerLoginPage() {
  return (
    <Suspense fallback={<div style={{ minHeight: '100vh', background: '#FAF8F5' }} />}>
      <CustomerLoginForm />
    </Suspense>
  );
}
