'use client';

import { useEffect, useRef, useState } from 'react';

interface GoogleAuthButtonProps {
  onSuccess: (idToken: string) => void;
  onError?: (error: any) => void;
  text?: 'signin_with' | 'signup_with' | 'continue_with';
  disabled?: boolean;
}

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: {
            client_id: string;
            callback: (response: { credential: string }) => void;
            auto_select?: boolean;
          }) => void;
          renderButton: (
            parent: HTMLElement,
            options: {
              type?: 'standard' | 'icon';
              theme?: 'outline' | 'filled_blue' | 'filled_black';
              size?: 'large' | 'medium' | 'small';
              text?: string;
              shape?: 'rectangular' | 'pill' | 'circle' | 'square';
              logo_alignment?: 'left' | 'center';
              width?: string | number;
            }
          ) => void;
          prompt?: () => void;
        };
      };
    };
  }
}

export default function GoogleAuthButton({
  onSuccess,
  onError,
  text = 'continue_with',
  disabled = false,
}: GoogleAuthButtonProps) {
  const buttonRef = useRef<HTMLDivElement>(null);
  const [isGsiLoaded, setIsGsiLoaded] = useState(false);
  const [isDevTesting, setIsDevTesting] = useState(false);
  const [devEmail, setDevEmail] = useState('');

  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || '';

  useEffect(() => {
    let isMounted = true;

    if (!clientId) {
      return;
    }

    const initGsi = () => {
      if (!window.google?.accounts?.id || !buttonRef.current || !isMounted) return;

      try {
        window.google.accounts.id.initialize({
          client_id: clientId,
          callback: (res) => {
            if (res.credential && isMounted) {
              onSuccess(res.credential);
            }
          },
        });

        window.google.accounts.id.renderButton(buttonRef.current, {
          theme: 'outline',
          size: 'large',
          text: text,
          shape: 'rectangular',
          width: '100%',
        });

        setIsGsiLoaded(true);
      } catch (err) {
        console.warn('[GoogleAuth] Init error:', err);
        onError?.(err);
      }
    };

    if (window.google?.accounts?.id) {
      initGsi();
    } else {
      const script = document.createElement('script');
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      script.onload = () => initGsi();
      document.head.appendChild(script);
    }

    return () => {
      isMounted = false;
    };
  }, [clientId, text]);

  const handleMockGoogleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!devEmail || !devEmail.includes('@')) {
      alert('Please enter a valid email for Google sign-in simulation.');
      return;
    }
    onSuccess(`mock-google-token:${devEmail.trim()}`);
  };

  return (
    <div style={{ width: '100%', marginTop: '16px', marginBottom: '16px' }}>
      {clientId && <div ref={buttonRef} style={{ minHeight: '44px', width: '100%' }} />}

      {(!clientId || !isGsiLoaded) && (
        <div>
          {!isDevTesting ? (
            <button
              type="button"
              disabled={disabled}
              onClick={() => setIsDevTesting(true)}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '12px',
                padding: '12px 18px',
                background: '#ffffff',
                border: '1px solid rgba(179, 137, 56, 0.35)',
                borderRadius: '8px',
                color: 'var(--text)',
                fontSize: '0.9rem',
                fontWeight: 600,
                cursor: disabled ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s ease',
                boxShadow: '0 2px 8px rgba(26, 19, 13, 0.04)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = '#FAF8F5';
                e.currentTarget.style.borderColor = 'var(--gold)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = '#ffffff';
                e.currentTarget.style.borderColor = 'rgba(179, 137, 56, 0.35)';
              }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"
                />
                <path
                  fill="#34A853"
                  d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.34 24 12 24z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
                />
                <path
                  fill="#EA4335"
                  d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.34 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                />
              </svg>
              <span>Continue with Google</span>
            </button>
          ) : (
            <form
              onSubmit={handleMockGoogleLogin}
              style={{
                padding: '16px',
                background: '#FAF8F5',
                border: '1px solid rgba(179, 137, 56, 0.35)',
                borderRadius: '8px',
                display: 'flex',
                flexDirection: 'column',
                gap: '12px',
                boxShadow: '0 2px 10px rgba(26, 19, 13, 0.05)',
              }}
            >
              <span style={{ fontSize: '0.78rem', color: 'var(--gold-dark)', letterSpacing: '0.05em', fontWeight: 600 }}>
                Google Sign-In Simulator
              </span>
              <input
                type="email"
                required
                placeholder="Enter your Google email (e.g. patron@gmail.com)"
                value={devEmail}
                onChange={(e) => setDevEmail(e.target.value)}
                style={{
                  padding: '10px 12px',
                  background: '#ffffff',
                  border: '1px solid rgba(179, 137, 56, 0.3)',
                  borderRadius: '6px',
                  color: 'var(--text)',
                  fontSize: '0.85rem',
                  outline: 'none',
                }}
              />
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  type="submit"
                  style={{
                    flex: 1,
                    padding: '9px',
                    background: 'var(--gold)',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '6px',
                    fontWeight: 700,
                    fontSize: '0.82rem',
                    cursor: 'pointer',
                  }}
                >
                  Confirm Sign In
                </button>
                <button
                  type="button"
                  onClick={() => setIsDevTesting(false)}
                  style={{
                    padding: '9px 14px',
                    background: '#ffffff',
                    border: '1px solid rgba(179, 137, 56, 0.25)',
                    borderRadius: '6px',
                    color: 'var(--text-dim)',
                    fontSize: '0.82rem',
                    cursor: 'pointer',
                  }}
                >
                  Cancel
                </button>
              </div>
            </form>
          )}
        </div>
      )}
    </div>
  );
}
