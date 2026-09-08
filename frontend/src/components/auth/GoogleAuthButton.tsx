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
      return; // If no client ID is set, rely on clean dev simulator
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
          theme: 'filled_black',
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
      {/* Official Google GSI Button container */}
      {clientId && <div ref={buttonRef} style={{ minHeight: '44px', width: '100%' }} />}

      {/* Styled Luxury Google Button (Universal & Dev Simulator) */}
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
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.18)',
                borderRadius: '8px',
                color: '#fff',
                fontSize: '0.9rem',
                fontWeight: 500,
                cursor: disabled ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
                e.currentTarget.style.borderColor = 'var(--gold)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.18)';
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
                padding: '14px',
                background: 'rgba(0, 0, 0, 0.4)',
                border: '1px solid var(--gold)',
                borderRadius: '8px',
                display: 'flex',
                flexDirection: 'column',
                gap: '10px',
              }}
            >
              <span style={{ fontSize: '0.78rem', color: 'var(--gold)', letterSpacing: '0.05em' }}>
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
                  background: 'rgba(255, 255, 255, 0.08)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  borderRadius: '6px',
                  color: '#fff',
                  fontSize: '0.85rem',
                }}
              />
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  type="submit"
                  style={{
                    flex: 1,
                    padding: '8px',
                    background: 'var(--gold)',
                    color: '#110c08',
                    border: 'none',
                    borderRadius: '6px',
                    fontWeight: 700,
                    fontSize: '0.8rem',
                    cursor: 'pointer',
                  }}
                >
                  Confirm Sign In
                </button>
                <button
                  type="button"
                  onClick={() => setIsDevTesting(false)}
                  style={{
                    padding: '8px 12px',
                    background: 'transparent',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    borderRadius: '6px',
                    color: 'var(--text-dim)',
                    fontSize: '0.8rem',
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
