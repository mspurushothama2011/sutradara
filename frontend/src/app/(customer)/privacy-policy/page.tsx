'use client';

import LandingNavbar from '@/components/landing/LandingNavbar';

export default function PrivacyPolicyPage() {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', color: 'var(--text)' }}>
      <LandingNavbar />
      <div style={{ maxWidth: '860px', margin: '0 auto', padding: '140px 24px 80px' }}>
        <div style={{ marginBottom: '40px', borderBottom: '1px solid rgba(179, 137, 56, 0.25)', paddingBottom: '20px' }}>
          <span style={{ fontSize: '0.75rem', letterSpacing: '0.25em', color: 'var(--gold-dark)', textTransform: 'uppercase', fontWeight: 600 }}>
            LEGAL &amp; COMPLIANCE
          </span>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '2.5rem', color: 'var(--text)', marginTop: '6px' }}>
            Privacy Policy
          </h1>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-dim)', marginTop: '4px' }}>
            Effective Date: January 1, 2026 • Compliant with Indian DPDP Act &amp; Global Privacy Standards
          </p>
        </div>

        <div style={{ background: '#ffffff', borderRadius: '12px', border: '1px solid rgba(179, 137, 56, 0.22)', padding: '36px', boxShadow: '0 4px 20px rgba(26, 19, 13, 0.04)', display: 'flex', flexDirection: 'column', gap: '32px', fontSize: '0.95rem', color: 'var(--text-dim)', lineHeight: 1.8 }}>
          <section>
            <h2 style={{ color: 'var(--gold-dark)', fontSize: '1.25rem', fontFamily: 'var(--font-display)', marginBottom: '8px', fontWeight: 600 }}>
              1. Information We Collect
            </h2>
            <p style={{ color: 'var(--text)' }}>
              When you browse Sutraಧಾರ or acquire a handloom saree, we collect your name, email address, contact phone number, delivery address, and device identification cookies (<code style={{ background: 'var(--bg-deep)', padding: '2px 6px', borderRadius: '4px', color: 'var(--gold-dark)' }}>_sutradara_did</code>) to secure transactions and prevent malicious bot interference.
            </p>
          </section>

          <section>
            <h2 style={{ color: 'var(--gold-dark)', fontSize: '1.25rem', fontFamily: 'var(--font-display)', marginBottom: '8px', fontWeight: 600 }}>
              2. Zero Data Brokering Guarantee
            </h2>
            <p style={{ color: 'var(--text)' }}>
              Sutraಧಾರ does not sell, rent, or lease patron contact records, order histories, or shopping behavior to any third-party marketing networks or data brokers.
            </p>
          </section>

          <section>
            <h2 style={{ color: 'var(--gold-dark)', fontSize: '1.25rem', fontFamily: 'var(--font-display)', marginBottom: '8px', fontWeight: 600 }}>
              3. Payment Security &amp; Encryption
            </h2>
            <p style={{ color: 'var(--text)' }}>
              All payment transactions are encrypted using TLS 1.3 and processed directly via PCI-DSS Level 1 compliant gateway partners (Razorpay). Sutraಧಾರ does not store your credit card numbers, CVVs, or netbanking passwords on our servers.
            </p>
          </section>

          <section>
            <h2 style={{ color: 'var(--gold-dark)', fontSize: '1.25rem', fontFamily: 'var(--font-display)', marginBottom: '8px', fontWeight: 600 }}>
              4. Contact for Data Protection Inquiries
            </h2>
            <p style={{ color: 'var(--text)' }}>
              For data access, deletion, or privacy inquiries, contact our Data Protection Officer at <code style={{ background: 'var(--bg-deep)', padding: '2px 6px', borderRadius: '4px', color: 'var(--gold-dark)' }}>privacy@sutradara.in</code>.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}

