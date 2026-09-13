'use client';

import LandingNavbar from '@/components/landing/LandingNavbar';

export default function TermsPage() {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', color: 'var(--text)' }}>
      <LandingNavbar />
      <div style={{ maxWidth: '860px', margin: '0 auto', padding: '140px 24px 80px' }}>
        <div style={{ marginBottom: '40px', borderBottom: '1px solid rgba(179, 137, 56, 0.25)', paddingBottom: '20px' }}>
          <span style={{ fontSize: '0.75rem', letterSpacing: '0.25em', color: 'var(--gold-dark)', textTransform: 'uppercase', fontWeight: 600 }}>
            LEGAL TERMS
          </span>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '2.5rem', color: 'var(--text)', marginTop: '6px' }}>
            Terms of Service
          </h1>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-dim)', marginTop: '4px' }}>
            Last Updated: January 2026 • Governing Digital Purchases & Curatorial Provenance
          </p>
        </div>

        <div style={{ background: '#ffffff', borderRadius: '12px', border: '1px solid rgba(179, 137, 56, 0.22)', padding: '36px', boxShadow: '0 4px 20px rgba(26, 19, 13, 0.04)', display: 'flex', flexDirection: 'column', gap: '32px', fontSize: '0.95rem', color: 'var(--text-dim)', lineHeight: 1.8 }}>
          <section>
            <h2 style={{ color: 'var(--gold-dark)', fontSize: '1.25rem', fontFamily: 'var(--font-display)', marginBottom: '8px', fontWeight: 600 }}>
              1. Nature of Handloom & Artisanal Variations
            </h2>
            <p style={{ color: 'var(--text)' }}>
              Every saree curated by Sutraಧಾರ is genuinely handwoven by master artisans on traditional pit-looms. Minor irregularities in weave density, zari motif spacing, or color graduation are inherent hallmarks of authentic human craftsmanship — not manufacturing defects.
            </p>
          </section>

          <section>
            <h2 style={{ color: 'var(--gold-dark)', fontSize: '1.25rem', fontFamily: 'var(--font-display)', marginBottom: '8px', fontWeight: 600 }}>
              2. 1-of-1 Heirloom Exclusivity
            </h2>
            <p style={{ color: 'var(--text)' }}>
              Sarees designated as &quot;1-of-1 Heirloom&quot; are single-piece creations. Upon successful order placement and payment authorization, the saree is marked permanently out of stock and will not be replicated.
            </p>
          </section>

          <section>
            <h2 style={{ color: 'var(--gold-dark)', fontSize: '1.25rem', fontFamily: 'var(--font-display)', marginBottom: '8px', fontWeight: 600 }}>
              3. Secure Delivery Protocol
            </h2>
            <p style={{ color: 'var(--text)' }}>
              Due to the high valuation of handloom silks, delivery is completed exclusively through our 4-digit Secure Delivery OTP protocol. Delivery is deemed fulfilled once the customer provides the valid OTP to the courier agent.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}

