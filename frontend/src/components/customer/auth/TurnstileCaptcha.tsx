'use client';

import { useEffect, useRef, useState } from 'react';
import { ShieldCheck, CheckCircle2 } from 'lucide-react';

interface TurnstileCaptchaProps {
  onVerify: (token: string) => void;
  onError?: (error?: any) => void;
  onExpire?: () => void;
  theme?: 'dark' | 'light' | 'auto';
}

declare global {
  interface Window {
    turnstile?: {
      render: (
        container: HTMLElement | string,
        params: {
          sitekey: string;
          theme?: string;
          callback?: (token: string) => void;
          'error-callback'?: (err?: any) => void;
          'expired-callback'?: () => void;
        }
      ) => string;
      reset: (widgetId?: string) => void;
      remove: (widgetId?: string) => void;
    };
    onloadTurnstileCallback?: () => void;
  }
}

export default function TurnstileCaptcha({
  onVerify,
  onError,
  onExpire,
  theme = 'dark',
}: TurnstileCaptchaProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const widgetIdRef = useRef<string | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasDevBypassed, setHasDevBypassed] = useState(false);

  const siteKey =
    process.env.NEXT_PUBLIC_CLOUDFLARE_TURNSTILE_SITE_KEY || '1x00000000000000000000AA';

  useEffect(() => {
    let isMounted = true;

    const renderWidget = () => {
      if (!isMounted || !containerRef.current || !window.turnstile) return;

      try {
        if (widgetIdRef.current) {
          window.turnstile.remove(widgetIdRef.current);
        }

        const id = window.turnstile.render(containerRef.current, {
          sitekey: siteKey,
          theme: theme,
          callback: (token: string) => {
            if (isMounted) {
              onVerify(token);
            }
          },
          'error-callback': (err: any) => {
            console.warn('[Turnstile] Widget error:', err);
            if (isMounted && onError) {
              onError(err);
            }
          },
          'expired-callback': () => {
            if (isMounted && onExpire) {
              onExpire();
            }
          },
        });
        widgetIdRef.current = id;
        setIsLoaded(true);
      } catch (err) {
        console.warn('[Turnstile] Render error:', err);
      }
    };

    if (window.turnstile) {
      renderWidget();
    } else {
      const existingScript = document.getElementById('cf-turnstile-script');
      if (!existingScript) {
        const script = document.createElement('script');
        script.id = 'cf-turnstile-script';
        script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';
        script.async = true;
        script.defer = true;
        script.onload = () => {
          renderWidget();
        };
        document.head.appendChild(script);
      } else {
        const checkInterval = setInterval(() => {
          if (window.turnstile) {
            clearInterval(checkInterval);
            renderWidget();
          }
        }, 100);
        return () => clearInterval(checkInterval);
      }
    }

    return () => {
      isMounted = false;
      if (widgetIdRef.current && window.turnstile) {
        try {
          window.turnstile.remove(widgetIdRef.current);
        } catch (_) {}
      }
    };
  }, [siteKey, theme]);

  const handleDevBypass = () => {
    setHasDevBypassed(true);
    onVerify('mock-turnstile-token');
  };

  return (
    <div style={{ margin: '14px 0', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <div ref={containerRef} style={{ minHeight: '65px', display: 'flex', justifyContent: 'center' }} />

      {(!isLoaded || hasDevBypassed) && (
        <div style={{ marginTop: '8px', textAlign: 'center' }}>
          <button
            type="button"
            onClick={handleDevBypass}
            style={{
              padding: '6px 14px',
              fontSize: '0.75rem',
              background: hasDevBypassed ? 'rgba(74, 222, 128, 0.15)' : 'rgba(201, 168, 76, 0.12)',
              border: hasDevBypassed ? '1px solid #4ade80' : '1px dashed var(--gold)',
              borderRadius: '3px',
              color: hasDevBypassed ? '#4ade80' : 'var(--gold)',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            {hasDevBypassed ? <CheckCircle2 size={13} strokeWidth={1.5} /> : <ShieldCheck size={13} strokeWidth={1.5} />}
            <span>{hasDevBypassed ? 'Security Verified (Dev Mode)' : 'Click to Verify Turnstile (Dev Simulation)'}</span>
          </button>
        </div>
      )}
    </div>
  );
}
