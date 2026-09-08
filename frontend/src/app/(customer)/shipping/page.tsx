'use client';

import Link from 'next/link';

export default function ShippingPolicyPage() {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', color: '#fff', padding: '80px 24px' }}>
      <div style={{ maxWidth: '860px', margin: '0 auto' }}>
        <div style={{ marginBottom: '40px', borderBottom: '1px solid rgba(201, 168, 76, 0.2)', paddingBottom: '20px' }}>
          <span style={{ fontSize: '0.75rem', letterSpacing: '0.25em', color: 'var(--gold)', textTransform: 'uppercase' }}>
            LOGISTICS &amp; TRANSIT
          </span>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '2.5rem', color: '#fff', marginTop: '6px' }}>
            Shipping &amp; Delivery Policy
          </h1>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-dim)', marginTop: '4px' }}>
            100% Insured Express Delivery • Sealed Heritage Box Packaging
          </p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '28px', fontSize: '0.92rem', color: 'var(--text-dim)', lineHeight: 1.8 }}>
          <section style={{ background: 'var(--bg-deep)', padding: '28px', borderRadius: '12px', border: '1px solid rgba(201, 168, 76, 0.2)' }}>
            <h2 style={{ color: 'var(--gold)', fontSize: '1.25rem', fontFamily: 'var(--font-display)', marginBottom: '8px' }}>
              Complimentary Insured Domestic Shipping
            </h2>
            <p>
              All domestic orders receive complimentary express air courier delivery with 100% transit insurance coverage.
            </p>
          </section>

          <section>
            <h2 style={{ color: '#fff', fontSize: '1.15rem', fontFamily: 'var(--font-display)', marginBottom: '8px' }}>
              Delivery Timelines
            </h2>
            <ul style={{ paddingLeft: '20px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <li><strong>Metros (Mumbai, Delhi NCR, Bangalore, Chennai, Hyderabad, Kolkata):</strong> 2 to 3 business days.</li>
              <li><strong>Tier 2 &amp; Tier 3 Cities:</strong> 3 to 5 business days.</li>
              <li><strong>International Destinations (USA, UK, UAE, Singapore):</strong> 5 to 7 business days via DHL Express.</li>
            </ul>
          </section>

          <section>
            <h2 style={{ color: '#fff', fontSize: '1.15rem', fontFamily: 'var(--font-display)', marginBottom: '8px' }}>
              High-Assurance Doorstep Handover
            </h2>
            <p>
              To protect high-value heirlooms, each parcel is sealed in tamper-evident packaging and delivered directly to the recipient with live satellite tracking updates.
            </p>
          </section>

          <div style={{ marginTop: '16px', paddingTop: '20px', borderTop: '1px solid rgba(255,255,255,0.08)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-dim)' }}>
              Already have an active order? Track status in real time:
            </p>
            <Link
              href="/account/orders"
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
              Track My Order →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
