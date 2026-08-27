'use client';

export default function PrivacyPolicyPage() {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', color: '#fff', padding: '80px 24px' }}>
      <div style={{ maxWidth: '860px', margin: '0 auto' }}>
        <div style={{ marginBottom: '40px', borderBottom: '1px solid rgba(201, 168, 76, 0.2)', paddingBottom: '20px' }}>
          <span style={{ fontSize: '0.75rem', letterSpacing: '0.25em', color: 'var(--gold)', textTransform: 'uppercase' }}>
            LEGAL & COMPLIANCE
          </span>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '2.5rem', color: '#fff', marginTop: '6px' }}>
            Privacy Policy
          </h1>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-dim)', marginTop: '4px' }}>
            Effective Date: January 1, 2026 • Compliant with Indian DPDP Act & Global Privacy Standards
          </p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '28px', fontSize: '0.92rem', color: 'var(--text-dim)', lineHeight: 1.8 }}>
          <section>
            <h2 style={{ color: 'var(--gold)', fontSize: '1.2rem', fontFamily: 'var(--font-display)', marginBottom: '8px' }}>
              1. Information We Collect
            </h2>
            <p>
              When you browse Sutradara or acquire a handloom saree, we collect your name, email address, contact phone number, delivery address, and device identification cookies (<code>_sutradara_did</code>) to secure transactions and prevent malicious bot interference.
            </p>
          </section>

          <section>
            <h2 style={{ color: 'var(--gold)', fontSize: '1.2rem', fontFamily: 'var(--font-display)', marginBottom: '8px' }}>
              2. Zero Data Brokering Guarantee
            </h2>
            <p>
              Sutradara does not sell, rent, or lease patron contact records, order histories, or shopping behavior to any third-party marketing networks or data brokers.
            </p>
          </section>

          <section>
            <h2 style={{ color: 'var(--gold)', fontSize: '1.2rem', fontFamily: 'var(--font-display)', marginBottom: '8px' }}>
              3. Payment Security & Encryption
            </h2>
            <p>
              All payment transactions are encrypted using TLS 1.3 and processed directly via PCI-DSS Level 1 compliant gateway partners (Razorpay). Sutradara does not store your credit card numbers, CVVs, or netbanking passwords on our servers.
            </p>
          </section>

          <section>
            <h2 style={{ color: 'var(--gold)', fontSize: '1.2rem', fontFamily: 'var(--font-display)', marginBottom: '8px' }}>
              4. Contact for Data Protection Inquiries
            </h2>
            <p>
              For data access, deletion, or privacy inquiries, contact our Data Protection Officer at <code>privacy@sutradara.in</code>.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
