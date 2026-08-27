'use client';

import Link from 'next/link';

export default function RefundsPage() {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', color: '#fff', padding: '80px 24px' }}>
      <div style={{ maxWidth: '860px', margin: '0 auto' }}>
        <div style={{ marginBottom: '40px', borderBottom: '1px solid rgba(201, 168, 76, 0.2)', paddingBottom: '20px' }}>
          <span style={{ fontSize: '0.75rem', letterSpacing: '0.25em', color: 'var(--gold)', textTransform: 'uppercase' }}>
            PATRON ASSURANCE
          </span>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '2.5rem', color: '#fff', marginTop: '6px' }}>
            Refunds &amp; Returns Policy
          </h1>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-dim)', marginTop: '4px' }}>
            7-Day White-Glove Inspection Guarantee • Zero Deductions for Verified Flaws
          </p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '28px', fontSize: '0.92rem', color: 'var(--text-dim)', lineHeight: 1.8 }}>
          <section style={{ background: 'var(--bg-deep)', padding: '28px', borderRadius: '12px', border: '1px solid rgba(201, 168, 76, 0.2)' }}>
            <h2 style={{ color: 'var(--gold)', fontSize: '1.25rem', fontFamily: 'var(--font-display)', marginBottom: '8px' }}>
              7-Day Inspection Privilege
            </h2>
            <p>
              We want you to experience the texture, drape, and radiance of your saree in person. If you are not completely enchanted by your curation, you may initiate a return within <strong>7 calendar days</strong> of receiving the package.
            </p>
          </section>

          <section>
            <h2 style={{ color: '#fff', fontSize: '1.15rem', fontFamily: 'var(--font-display)', marginBottom: '8px' }}>
              Return Eligibility Requirements
            </h2>
            <ul style={{ paddingLeft: '20px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <li>The official <strong>Silk Mark hologram tag</strong> must remain intact and untampered.</li>
              <li>The saree must be unworn, unwashed, and in its original silk dust bag with wooden folding board.</li>
              <li>Fall and pico / custom blouse tailoring services render a saree non-returnable.</li>
            </ul>
          </section>

          <section>
            <h2 style={{ color: '#fff', fontSize: '1.15rem', fontFamily: 'var(--font-display)', marginBottom: '8px' }}>
              Refund Timelines &amp; Mode
            </h2>
            <p>
              Upon receipt and vault verification, refunds are credited back to your original payment method (Bank account / UPI / Credit card) within <strong>3 to 5 business days</strong>.
            </p>
          </section>

          <div style={{ marginTop: '16px', paddingTop: '20px', borderTop: '1px solid rgba(255,255,255,0.08)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-dim)' }}>
              Need to initiate a return? Contact our Concierge:
            </p>
            <Link
              href="/contact"
              style={{
                padding: '10px 22px',
                background: 'var(--gold)',
                color: '#110c08',
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
