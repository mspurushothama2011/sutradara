'use client';

import Link from 'next/link';
import LandingNavbar from '@/components/landing/LandingNavbar';

export default function RefundsPage() {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', color: 'var(--text)' }}>
      <LandingNavbar />
      <div style={{ maxWidth: '860px', margin: '0 auto', padding: '140px 24px 80px' }}>
        <div style={{ marginBottom: '40px', borderBottom: '1px solid rgba(179, 137, 56, 0.25)', paddingBottom: '20px' }}>
          <span style={{ fontSize: '0.75rem', letterSpacing: '0.25em', color: 'var(--gold-dark)', textTransform: 'uppercase', fontWeight: 600 }}>
            PATRON ASSURANCE
          </span>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '2.5rem', color: 'var(--text)', marginTop: '6px' }}>
            Refunds & Returns Policy
          </h1>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-dim)', marginTop: '4px' }}>
            7-Day White-Glove Inspection Guarantee • Zero Deductions for Verified Flaws
          </p>
        </div>

        <div style={{ background: '#ffffff', borderRadius: '12px', border: '1px solid rgba(179, 137, 56, 0.22)', padding: '36px', boxShadow: '0 4px 20px rgba(26, 19, 13, 0.04)', display: 'flex', flexDirection: 'column', gap: '32px', fontSize: '0.95rem', color: 'var(--text-dim)', lineHeight: 1.8 }}>
          <section style={{ background: 'var(--bg-deep)', padding: '24px', borderRadius: '10px', border: '1px solid rgba(179, 137, 56, 0.2)' }}>
            <h2 style={{ color: 'var(--gold-dark)', fontSize: '1.25rem', fontFamily: 'var(--font-display)', marginBottom: '8px', fontWeight: 600 }}>
              7-Day Inspection Privilege
            </h2>
            <p style={{ color: 'var(--text)' }}>
              We want you to experience the texture, drape, and radiance of your saree in person. If you are not completely enchanted by your curation, you may initiate a return within <strong>7 calendar days</strong> of receiving the package.
            </p>
          </section>

          <section>
            <h2 style={{ color: 'var(--text)', fontSize: '1.15rem', fontFamily: 'var(--font-display)', marginBottom: '8px', fontWeight: 600 }}>
              Return Eligibility Requirements
            </h2>
            <ul style={{ paddingLeft: '20px', display: 'flex', flexDirection: 'column', gap: '8px', color: 'var(--text)' }}>
              <li>The official <strong>Silk Mark hologram tag</strong> must remain intact and untampered.</li>
              <li>The saree must be unworn, unwashed, and in its original silk dust bag with wooden folding board.</li>
              <li>Fall and pico / custom blouse tailoring services render a saree non-returnable.</li>
            </ul>
          </section>

          <section>
            <h2 style={{ color: 'var(--text)', fontSize: '1.15rem', fontFamily: 'var(--font-display)', marginBottom: '8px', fontWeight: 600 }}>
              Refund Timelines & Mode
            </h2>
            <p style={{ color: 'var(--text)' }}>
              Upon receipt and vault verification, refunds are credited back to your original payment method (Bank account / UPI / Credit card) within <strong>3 to 5 business days</strong>.
            </p>
          </section>

          <div style={{ marginTop: '16px', paddingTop: '20px', borderTop: '1px solid rgba(179, 137, 56, 0.15)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-dim)' }}>
              Need to initiate a return? Contact our Concierge:
            </p>
            <Link
              href="/contact"
              style={{
                padding: '10px 22px',
                background: 'var(--gold)',
                color: '#ffffff',
                borderRadius: '6px',
                textDecoration: 'none',
                fontWeight: 700,
                fontSize: '0.82rem',
                textTransform: 'uppercase',
              }}
            >
              Contact Concierge →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

