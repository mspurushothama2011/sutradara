'use client';

export default function TermsPage() {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', color: '#fff', padding: '80px 24px' }}>
      <div style={{ maxWidth: '860px', margin: '0 auto' }}>
        <div style={{ marginBottom: '40px', borderBottom: '1px solid rgba(201, 168, 76, 0.2)', paddingBottom: '20px' }}>
          <span style={{ fontSize: '0.75rem', letterSpacing: '0.25em', color: 'var(--gold)', textTransform: 'uppercase' }}>
            LEGAL TERMS
          </span>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '2.5rem', color: '#fff', marginTop: '6px' }}>
            Terms of Service
          </h1>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-dim)', marginTop: '4px' }}>
            Last Updated: January 2026 • Governing Digital Purchases & Curatorial Provenance
          </p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '28px', fontSize: '0.92rem', color: 'var(--text-dim)', lineHeight: 1.8 }}>
          <section>
            <h2 style={{ color: 'var(--gold)', fontSize: '1.2rem', fontFamily: 'var(--font-display)', marginBottom: '8px' }}>
              1. Nature of Handloom & Artisanal Variations
            </h2>
            <p>
              Every saree curated by Sutradara is genuinely handwoven by master artisans on traditional pit-looms. Minor irregularities in weave density, zari motif spacing, or color graduation are inherent hallmarks of authentic human craftsmanship — not manufacturing defects.
            </p>
          </section>

          <section>
            <h2 style={{ color: 'var(--gold)', fontSize: '1.2rem', fontFamily: 'var(--font-display)', marginBottom: '8px' }}>
              2. 1-of-1 Heirloom Exclusivity
            </h2>
            <p>
              Sarees designated as &quot;1-of-1 Heirloom&quot; are single-piece creations. Upon successful order placement and payment authorization, the saree is marked permanently out of stock and will not be replicated.
            </p>
          </section>

          <section>
            <h2 style={{ color: 'var(--gold)', fontSize: '1.2rem', fontFamily: 'var(--font-display)', marginBottom: '8px' }}>
              3. Secure Delivery Protocol
            </h2>
            <p>
              Due to the high valuation of handloom silks, delivery is completed exclusively through our 4-digit Secure Delivery OTP protocol. Delivery is deemed fulfilled once the customer provides the valid OTP to the courier agent.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
