import Link from 'next/link';

export default function Footer() {
  return (
    <footer
      style={{
        background: '#0a0604',
        borderTop: '1px solid rgba(201, 168, 76, 0.25)',
        color: 'var(--text-dim)',
        padding: '72px 24px 36px',
        fontSize: '0.88rem',
      }}
    >
      <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
        {/* Main Footer Columns */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '48px',
            marginBottom: '56px',
          }}
        >
          {/* Column 1: Brand & Philosophy */}
          <div>
            <span style={{ fontSize: '0.75rem', letterSpacing: '0.3em', color: 'var(--gold)', fontWeight: 600 }}>
              SUTRAಧಾರ
            </span>
            <p style={{ fontFamily: 'var(--font-display)', fontSize: '1.4rem', color: '#fff', margin: '6px 0 12px' }}>
              The Handloom Sanctuary
            </p>
            <p style={{ fontSize: '0.82rem', lineHeight: 1.6, color: 'var(--text-dim)' }}>
              Curators of authentic Indian handloom heritage directly from the master weaving guilds of Varanasi, Kanchipuram, Yeola, and Chanderi.
            </p>
          </div>

          {/* Column 2: Craft Clusters */}
          <div>
            <h3 style={{ color: 'var(--gold)', fontSize: '0.82rem', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: '16px' }}>
              Craft Provenance
            </h3>
            <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <li>
                <Link href="/catalog?region=Varanasi" style={{ color: 'var(--text-cream)', textDecoration: 'none' }}>
                  Varanasi (Banarasi Silks)
                </Link>
              </li>
              <li>
                <Link href="/catalog?region=Kanchipuram" style={{ color: 'var(--text-cream)', textDecoration: 'none' }}>
                  Kanchipuram (Korvai Silks)
                </Link>
              </li>
              <li>
                <Link href="/catalog?region=Yeola" style={{ color: 'var(--text-cream)', textDecoration: 'none' }}>
                  Yeola (Paithani Silks)
                </Link>
              </li>
              <li>
                <Link href="/categories" style={{ color: 'var(--gold)', textDecoration: 'none', fontWeight: 600 }}>
                  View All Craft Clusters →
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Curated Edits & Trust */}
          <div>
            <h3 style={{ color: 'var(--gold)', fontSize: '0.82rem', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: '16px' }}>
              Collections &amp; Trust
            </h3>
            <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <li>
                <Link href="/collections/1-of-1-heirlooms" style={{ color: 'var(--text-cream)', textDecoration: 'none' }}>
                  👑 1-of-1 Heirloom Vault
                </Link>
              </li>
              <li>
                <Link href="/collections/bridal-sanctuary" style={{ color: 'var(--text-cream)', textDecoration: 'none' }}>
                  🪔 Bridal Sanctuary
                </Link>
              </li>
              <li>
                <Link href="/authenticity" style={{ color: 'var(--text-cream)', textDecoration: 'none' }}>
                  ✓ Silk Mark Guarantee
                </Link>
              </li>
              <li>
                <Link href="/about" style={{ color: 'var(--text-cream)', textDecoration: 'none' }}>
                  Our Provenance Story
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4: Patron Care & Policies */}
          <div>
            <h3 style={{ color: 'var(--gold)', fontSize: '0.82rem', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: '16px' }}>
              Patron Care &amp; Legal
            </h3>
            <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <li>
                <Link href="/account/orders" style={{ color: 'var(--text-cream)', textDecoration: 'none' }}>
                  Track Order &amp; Live OTP
                </Link>
              </li>
              <li>
                <Link href="/refunds" style={{ color: 'var(--text-cream)', textDecoration: 'none' }}>
                  7-Day Inspection Policy
                </Link>
              </li>
              <li>
                <Link href="/shipping" style={{ color: 'var(--text-cream)', textDecoration: 'none' }}>
                  Insured Delivery Policy
                </Link>
              </li>
              <li>
                <Link href="/privacy-policy" style={{ color: 'var(--text-dim)', textDecoration: 'none' }}>
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" style={{ color: 'var(--text-dim)', textDecoration: 'none' }}>
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link href="/contact" style={{ color: 'var(--gold)', textDecoration: 'none', fontWeight: 600 }}>
                  Contact Concierge →
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Strip */}
        <div
          style={{
            paddingTop: '28px',
            borderTop: '1px solid rgba(255, 255, 255, 0.08)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '16px',
            fontSize: '0.78rem',
          }}
        >
          <p>&copy; {new Date().getFullYear()} Sutraಧಾರ Silks Pvt. Ltd. All rights reserved.</p>
          <div style={{ display: 'flex', gap: '20px' }}>
            <Link href="/portal/login" style={{ color: 'var(--text-dim)', textDecoration: 'none' }}>
              Staff &amp; Admin Workspace ↗
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
