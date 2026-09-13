'use client';

import Link from 'next/link';
import LandingNavbar from '@/components/landing/LandingNavbar';

export default function AuthenticityPage() {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', color: 'var(--text)' }}>
      <LandingNavbar />
      <div style={{ maxWidth: '960px', margin: '0 auto', padding: '140px 24px 80px' }}>
        <div style={{ textAlign: 'center', marginBottom: '56px' }}>
          <span style={{ fontSize: '0.8rem', letterSpacing: '0.3em', color: 'var(--gold-dark)', textTransform: 'uppercase', fontWeight: 600 }}>
            UNCOMPROMISING STANDARDS
          </span>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(2.4rem, 4.5vw, 3.6rem)', color: 'var(--text)', marginTop: '10px' }}>
            The Authenticity Guarantee
          </h1>
          <p style={{ maxWidth: '640px', margin: '14px auto 0', color: 'var(--text-dim)', fontSize: '1rem', lineHeight: 1.7 }}>
            Every saree curated under the Sutraಧಾರ insignia undergoes laboratory and physical verification before entering our vault.
          </p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px', fontSize: '0.95rem', color: 'var(--text-dim)', lineHeight: 1.8 }}>
          {/* Pillar 1 */}
          <div style={{ background: '#ffffff', padding: '36px', borderRadius: '16px', border: '1px solid rgba(179, 137, 56, 0.22)', boxShadow: '0 4px 16px rgba(26, 19, 13, 0.04)' }}>
            <span style={{ color: 'var(--gold-dark)', fontSize: '0.8rem', letterSpacing: '0.2em', textTransform: 'uppercase', fontWeight: 600 }}>
              PILLAR I
            </span>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.6rem', color: 'var(--text)', margin: '6px 0 14px', fontWeight: 600 }}>
              Silk Mark Organisation of India (SMOI)
            </h2>
            <p style={{ color: 'var(--text)' }}>
              The Silk Mark is an apex quality assurance label issued by the Central Silk Board, Ministry of Textiles, Government of India. It certifies that the fabric is 100% natural pure silk without synthetic adulteration (polyester or viscose).
            </p>
            <p style={{ marginTop: '12px', color: 'var(--text-dim)' }}>
              Every Sutraಧಾರ saree arrives with an affixed tamper-evident Silk Mark hologram containing a verifiable registration tag matching our Master Vault registry.
            </p>
          </div>

          {/* Pillar 2 */}
          <div style={{ background: '#ffffff', padding: '36px', borderRadius: '16px', border: '1px solid rgba(179, 137, 56, 0.22)', boxShadow: '0 4px 16px rgba(26, 19, 13, 0.04)' }}>
            <span style={{ color: 'var(--gold-dark)', fontSize: '0.8rem', letterSpacing: '0.2em', textTransform: 'uppercase', fontWeight: 600 }}>
              PILLAR II
            </span>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.6rem', color: 'var(--text)', margin: '6px 0 14px', fontWeight: 600 }}>
              Pure vs Tested Gold Zari Standards
            </h2>
            <p style={{ color: 'var(--text)' }}>
              We maintain absolute transparency regarding metallic thread composition:
            </p>
            <ul style={{ paddingLeft: '20px', marginTop: '10px', display: 'flex', flexDirection: 'column', gap: '8px', color: 'var(--text)' }}>
              <li><strong>Pure Gold Zari (Real Zari):</strong> Pure silver core electroplated with 24-karat pure gold, woven over a natural red silk core thread.</li>
              <li><strong>Tested Gold Zari:</strong> High-grade copper-silver alloy wire gilded with gold luster, engineered for lifelong radiance.</li>
            </ul>
          </div>

          {/* Pillar 3 */}
          <div style={{ background: '#ffffff', padding: '36px', borderRadius: '16px', border: '1px solid rgba(179, 137, 56, 0.22)', boxShadow: '0 4px 16px rgba(26, 19, 13, 0.04)' }}>
            <span style={{ color: 'var(--gold-dark)', fontSize: '0.8rem', letterSpacing: '0.2em', textTransform: 'uppercase', fontWeight: 600 }}>
              PILLAR III
            </span>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.6rem', color: 'var(--text)', margin: '6px 0 14px', fontWeight: 600 }}>
              Pre-Dispatch Inspection Video &amp; 4-Digit OTP
            </h2>
            <p style={{ color: 'var(--text)' }}>
              Prior to dispatch, our Master Curator performs a 12-point quality check (selvedge integrity, pallu tassel finishing, zari alignment) and records an HD 20-second inspection video uploaded directly to your tracking dashboard.
            </p>
          </div>

          <div style={{ textAlign: 'center', marginTop: '16px' }}>
            <Link
              href="/catalog"
              style={{
                display: 'inline-block',
                padding: '16px 36px',
                background: 'var(--gold)',
                color: '#ffffff',
                borderRadius: '8px',
                textDecoration: 'none',
                fontWeight: 700,
                fontSize: '0.9rem',
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                boxShadow: '0 4px 16px rgba(179, 137, 56, 0.25)',
              }}
            >
              Browse Certified Sarees →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

