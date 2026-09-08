'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { apiRequest } from '@/lib/api';
import TurnstileCaptcha from '@/components/auth/TurnstileCaptcha';
import GoogleAuthButton from '@/components/auth/GoogleAuthButton';
import LandingNavbar from '@/components/landing/LandingNavbar';

export default function CustomerRegisterPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  
  const [step, setStep] = useState<'DETAILS' | 'OTP'>('DETAILS');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [devOtp, setDevOtp] = useState<string | null>(null);

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError('Please enter your full name.');
      return;
    }

    if (!email || !email.includes('@')) {
      setError('Please enter a valid email address.');
      return;
    }

    if (!turnstileToken) {
      setError('Please complete the security verification below.');
      return;
    }

    setIsLoading(true);

    try {
      const res = await apiRequest('/customer/auth/send-otp', {
        method: 'POST',
        data: { email, turnstileToken },
      });

      if (res.devOtp) {
        setDevOtp(res.devOtp);
      }
      setStep('OTP');
    } catch (err: any) {
      setError(err.message || 'Failed to send verification code. Please try again.');
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
        data: {
          email,
          otp,
          name: name.trim(),
          phone: phone.trim() ? (phone.startsWith('+91') ? phone : `+91 ${phone}`) : undefined,
        },
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
      setError(err.message || 'Google registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'radial-gradient(ellipse at center, #1a140e 0%, #0d0906 100%)',
        color: '#fff',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <LandingNavbar />

      <div
        style={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '120px 16px 60px 16px',
        }}
      >
        <div
          style={{
            width: '100%',
            maxWidth: '520px',
            background: 'rgba(17, 12, 8, 0.95)',
            border: '1px solid var(--gold)',
            borderRadius: '16px',
            padding: '40px 36px',
            boxShadow: '0 32px 80px rgba(0, 0, 0, 0.85)',
            backdropFilter: 'blur(16px)',
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
                fontWeight: 600,
              }}
            >
              SUTRAಧಾರ SANCTUARY
            </span>
            <h1
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: '2.1rem',
                color: '#fff',
                marginTop: '6px',
              }}
            >
              {step === 'DETAILS' ? 'Become a Patron' : 'Verify Email'}
            </h1>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-dim)', marginTop: '6px' }}>
              {step === 'DETAILS'
                ? 'Create your account to unlock 1-of-1 weave reservations & insured express dispatch'
                : `Enter the 6-digit code sent to ${email}`}
            </p>
          </div>

          {/* Dev OTP Notification */}
          {devOtp && (
            <div
              style={{
                marginBottom: '20px',
                padding: '12px 16px',
                background: 'rgba(201, 168, 76, 0.15)',
                border: '1px solid var(--gold)',
                borderRadius: '8px',
                textAlign: 'center',
              }}
            >
              <span style={{ fontSize: '0.75rem', color: 'var(--gold)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                🔑 Developer Test Code:
              </span>
              <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#fff', letterSpacing: '4px', marginTop: '2px' }}>
                {devOtp}
              </div>
            </div>
          )}

          {/* Error Banner */}
          {error && (
            <div
              style={{
                marginBottom: '20px',
                padding: '12px 16px',
                background: 'rgba(239, 68, 68, 0.15)',
                border: '1px solid #ef4444',
                borderRadius: '8px',
                color: '#fca5a5',
                fontSize: '0.85rem',
                textAlign: 'center',
              }}
            >
              {error}
            </div>
          )}

          {step === 'DETAILS' ? (
            <form onSubmit={handleSendOtp} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--gold)', marginBottom: '6px' }}>
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Maharani Priyamvada"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid rgba(255, 255, 255, 0.15)',
                    borderRadius: '8px',
                    color: '#fff',
                    fontSize: '0.95rem',
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--gold)', marginBottom: '6px' }}>
                  Mobile Number (for delivery tracking)
                </label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <span
                    style={{
                      padding: '12px 14px',
                      background: 'rgba(255, 255, 255, 0.05)',
                      border: '1px solid rgba(255, 255, 255, 0.15)',
                      borderRadius: '8px',
                      color: 'var(--gold)',
                      fontSize: '0.9rem',
                    }}
                  >
                    +91
                  </span>
                  <input
                    type="tel"
                    placeholder="98765 43210"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value.replace(/[^0-9]/g, ''))}
                    maxLength={10}
                    style={{
                      flex: 1,
                      padding: '12px 16px',
                      background: 'rgba(255, 255, 255, 0.05)',
                      border: '1px solid rgba(255, 255, 255, 0.15)',
                      borderRadius: '8px',
                      color: '#fff',
                      fontSize: '0.95rem',
                      fontFamily: 'monospace',
                    }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--gold)', marginBottom: '6px' }}>
                  Email Address *
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
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid rgba(255, 255, 255, 0.15)',
                    borderRadius: '8px',
                    color: '#fff',
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
                  background: !turnstileToken ? 'rgba(201, 168, 76, 0.3)' : 'var(--gold)',
                  color: !turnstileToken ? 'var(--text-dim)' : '#110c08',
                  border: 'none',
                  borderRadius: '8px',
                  fontWeight: 700,
                  fontSize: '0.95rem',
                  letterSpacing: '0.05em',
                  cursor: !turnstileToken || isLoading ? 'not-allowed' : 'pointer',
                  transition: 'all 0.2s ease',
                  marginTop: '6px',
                }}
              >
                {isLoading ? 'Generating Security Code...' : 'Create Account & Send Code'}
              </button>

              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', margin: '8px 0' }}>
                <div style={{ flex: 1, height: '1px', background: 'rgba(255, 255, 255, 0.1)' }} />
                <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)', textTransform: 'uppercase' }}>or</span>
                <div style={{ flex: 1, height: '1px', background: 'rgba(255, 255, 255, 0.1)' }} />
              </div>

              {/* Google Sign-in */}
              <GoogleAuthButton
                text="signup_with"
                onSuccess={handleGoogleSuccess}
                onError={(err) => setError('Google sign-in could not be completed.')}
              />
            </form>
          ) : (
            <form onSubmit={handleVerifyOtp} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--gold)', marginBottom: '8px', textAlign: 'center' }}>
                  6-Digit Verification Code
                </label>
                <input
                  type="text"
                  required
                  autoFocus
                  maxLength={6}
                  placeholder="• • • • • •"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/[^0-9]/g, ''))}
                  style={{
                    width: '100%',
                    padding: '16px',
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid var(--gold)',
                    borderRadius: '8px',
                    color: '#fff',
                    fontSize: '1.6rem',
                    textAlign: 'center',
                    letterSpacing: '8px',
                    fontFamily: 'monospace',
                  }}
                />
              </div>

              <button
                type="submit"
                disabled={isLoading || otp.length < 6}
                style={{
                  width: '100%',
                  padding: '14px',
                  background: otp.length < 6 ? 'rgba(201, 168, 76, 0.3)' : 'var(--gold)',
                  color: otp.length < 6 ? 'var(--text-dim)' : '#110c08',
                  border: 'none',
                  borderRadius: '8px',
                  fontWeight: 700,
                  fontSize: '0.95rem',
                  letterSpacing: '0.05em',
                  cursor: otp.length < 6 || isLoading ? 'not-allowed' : 'pointer',
                  transition: 'all 0.2s ease',
                }}
              >
                {isLoading ? 'Verifying...' : 'Complete Registration'}
              </button>

              <button
                type="button"
                onClick={() => setStep('DETAILS')}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--text-dim)',
                  fontSize: '0.8rem',
                  cursor: 'pointer',
                  textDecoration: 'underline',
                  textAlign: 'center',
                }}
              >
                ← Edit registration details
              </button>
            </form>
          )}

          {/* Footer toggle */}
          <div
            style={{
              marginTop: '28px',
              paddingTop: '20px',
              borderTop: '1px solid rgba(255, 255, 255, 0.08)',
              textAlign: 'center',
              fontSize: '0.85rem',
              color: 'var(--text-dim)',
            }}
          >
            Already have an account?{' '}
            <Link
              href="/login"
              style={{
                color: 'var(--gold)',
                fontWeight: 600,
                textDecoration: 'none',
              }}
            >
              Sign In here →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
