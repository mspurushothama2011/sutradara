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
        background: 'radial-gradient(ellipse at center, #FAF8F5 0%, #F4EFEA 100%)',
        color: 'var(--text)',
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
            background: '#ffffff',
            border: '1.5px solid var(--gold)',
            borderRadius: '16px',
            padding: '40px 36px',
            boxShadow: '0 16px 48px rgba(26, 19, 13, 0.08)',
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
              SUTRAಧಾರ ACCOUNT
            </span>
            <h1
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: '2.1rem',
                color: 'var(--text)',
                marginTop: '6px',
              }}
            >
              {step === 'DETAILS' ? 'Create Customer Account' : 'Verify Email'}
            </h1>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-dim)', marginTop: '6px' }}>
              {step === 'DETAILS'
                ? 'Create your account to enjoy exclusive saree reservations and fast tracked delivery'
                : `Enter the 6-digit code sent to ${email}`}
            </p>
          </div>

          {/* Dev OTP Notification */}
          {devOtp && (
            <div
              style={{
                marginBottom: '20px',
                padding: '12px 16px',
                background: '#FAF8F5',
                border: '1px dashed var(--gold)',
                borderRadius: '8px',
                textAlign: 'center',
              }}
            >
              <span style={{ fontSize: '0.75rem', color: 'var(--gold)', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 600 }}>
                🔑 Developer Test Code:
              </span>
              <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text)', letterSpacing: '4px', marginTop: '2px' }}>
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
                background: 'rgba(239, 68, 68, 0.12)',
                border: '1px solid #ef4444',
                borderRadius: '8px',
                color: '#b91c1c',
                fontSize: '0.85rem',
                textAlign: 'center',
                fontWeight: 600,
              }}
            >
              {error}
            </div>
          )}

          {step === 'DETAILS' ? (
            <form onSubmit={handleSendOtp} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--gold)', marginBottom: '6px', fontWeight: 600 }}>
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
                    background: '#FAF8F5',
                    border: '1px solid rgba(179, 137, 56, 0.3)',
                    borderRadius: '8px',
                    color: 'var(--text)',
                    fontSize: '0.95rem',
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--gold)', marginBottom: '6px', fontWeight: 600 }}>
                  Mobile Number (for delivery tracking)
                </label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <span
                    style={{
                      padding: '12px 14px',
                      background: '#FAF8F5',
                      border: '1px solid rgba(179, 137, 56, 0.3)',
                      borderRadius: '8px',
                      color: 'var(--gold)',
                      fontSize: '0.9rem',
                      fontWeight: 600,
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
                      background: '#FAF8F5',
                      border: '1px solid rgba(179, 137, 56, 0.3)',
                      borderRadius: '8px',
                      color: 'var(--text)',
                      fontSize: '0.95rem',
                      fontFamily: 'monospace',
                    }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--gold)', marginBottom: '6px', fontWeight: 600 }}>
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
                    background: '#FAF8F5',
                    border: '1px solid rgba(179, 137, 56, 0.3)',
                    borderRadius: '8px',
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
                  borderRadius: '8px',
                  fontWeight: 700,
                  fontSize: '0.95rem',
                  letterSpacing: '0.05em',
                  cursor: !turnstileToken || isLoading ? 'not-allowed' : 'pointer',
                  transition: 'all 0.2s ease',
                  marginTop: '6px',
                  boxShadow: '0 4px 14px rgba(179, 137, 56, 0.25)',
                }}
              >
                {isLoading ? 'Generating Security Code...' : 'Create Account & Send Code'}
              </button>

              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', margin: '8px 0' }}>
                <div style={{ flex: 1, height: '1px', background: 'rgba(179, 137, 56, 0.15)' }} />
                <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)', textTransform: 'uppercase' }}>or</span>
                <div style={{ flex: 1, height: '1px', background: 'rgba(179, 137, 56, 0.15)' }} />
              </div>

              {/* Google Sign-in */}
              <GoogleAuthButton
                text="signup_with"
                onSuccess={handleGoogleSuccess}
                onError={() => setError('Google sign-in could not be completed.')}
              />
            </form>
          ) : (
            <form onSubmit={handleVerifyOtp} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--gold)', marginBottom: '8px', textAlign: 'center', fontWeight: 600 }}>
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
                    background: '#FAF8F5',
                    border: '1.5px solid var(--gold)',
                    borderRadius: '8px',
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
                  borderRadius: '8px',
                  fontWeight: 700,
                  fontSize: '0.95rem',
                  letterSpacing: '0.05em',
                  cursor: otp.length < 6 || isLoading ? 'not-allowed' : 'pointer',
                  transition: 'all 0.2s ease',
                  boxShadow: '0 4px 14px rgba(179, 137, 56, 0.25)',
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
                  color: 'var(--gold)',
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                  textDecoration: 'underline',
                  textAlign: 'center',
                  fontWeight: 600,
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
              borderTop: '1px solid rgba(179, 137, 56, 0.15)',
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
