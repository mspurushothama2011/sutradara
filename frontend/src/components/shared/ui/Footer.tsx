'use client';

import Link from 'next/link';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer
      style={{
        background: 'linear-gradient(180deg, #090503 0%, #050302 100%)',
        borderTop: '1px solid rgba(201, 168, 76, 0.25)',
        color: 'var(--text-dim)',
        paddingTop: '64px',
        paddingBottom: '36px',
        fontSize: '0.88rem',
        position: 'relative',
        zIndex: 10,
      }}
    >
      <div style={{ maxWidth: '1280px', margin: '0 auto', paddingLeft: '24px', paddingRight: '24px' }}>
        
        {/* Trust Badges Strip */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '20px',
            paddingBottom: '48px',
            marginBottom: '48px',
            borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <span style={{ fontSize: '1.8rem' }}>👑</span>
            <div>
              <h4 style={{ color: '#fff', fontSize: '0.88rem', fontWeight: 600, margin: 0 }}>
                100% Certified Silk Mark
              </h4>
              <p style={{ fontSize: '0.76rem', color: 'var(--text-dim)', margin: '2px 0 0' }}>
                Pure zari &amp; natural mulberry silk handlooms
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <span style={{ fontSize: '1.8rem' }}>✈️</span>
            <div>
              <h4 style={{ color: '#fff', fontSize: '0.88rem', fontWeight: 600, margin: 0 }}>
                Insured Express Shipping
              </h4>
              <p style={{ fontSize: '0.76rem', color: 'var(--text-dim)', margin: '2px 0 0' }}>
                Complimentary nationwide air dispatch
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <span style={{ fontSize: '1.8rem' }}>🛡️</span>
            <div>
              <h4 style={{ color: '#fff', fontSize: '0.88rem', fontWeight: 600, margin: 0 }}>
                7-Day Doorstep Inspection
              </h4>
              <p style={{ fontSize: '0.76rem', color: 'var(--text-dim)', margin: '2px 0 0' }}>
                Hassle-free heritage appraisal &amp; returns
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <span style={{ fontSize: '1.8rem' }}>🏛️</span>
            <div>
              <h4 style={{ color: '#fff', fontSize: '0.88rem', fontWeight: 600, margin: 0 }}>
                Weaver Guild Direct
              </h4>
              <p style={{ fontSize: '0.76rem', color: 'var(--text-dim)', margin: '2px 0 0' }}>
                Fair remuneration to master artisans
              </p>
            </div>
          </div>
        </div>

        {/* Main Footer Navigation Columns */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '40px',
            marginBottom: '48px',
          }}
        >
          {/* Column 1: Brand & Philosophy */}
          <div style={{ minWidth: '240px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <span style={{ fontSize: '0.75rem', letterSpacing: '0.25em', color: 'var(--gold)', fontWeight: 700, textTransform: 'uppercase' }}>
                SUTRAಧಾರ
              </span>
            </div>
            <p style={{ fontFamily: 'var(--font-display)', fontSize: '1.35rem', color: '#fff', margin: '4px 0 10px' }}>
              The Handloom Sanctuary
            </p>
            <p style={{ fontSize: '0.82rem', lineHeight: 1.6, color: 'var(--text-dim)', marginBottom: '16px' }}>
              Preserving India’s living textile traditions by directly connecting connoisseurs with master handloom weavers across ancient craft clusters.
            </p>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'rgba(201, 168, 76, 0.1)', border: '1px solid rgba(201, 168, 76, 0.3)', padding: '6px 12px', borderRadius: '20px' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#4ade80' }} />
              <span style={{ fontSize: '0.72rem', color: 'var(--gold)', fontWeight: 600 }}>Weaver Clusters Live Active</span>
            </div>
          </div>

          {/* Column 2: Craft Clusters */}
          <div>
            <h3 style={{ color: 'var(--gold)', fontSize: '0.8rem', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: '16px', fontWeight: 700 }}>
              Craft Provenance
            </h3>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <li>
                <Link href="/catalog?region=Varanasi" style={{ color: '#e5dec9', textDecoration: 'none', transition: 'color 0.2s ease' }} onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--gold)')} onMouseLeave={(e) => (e.currentTarget.style.color = '#e5dec9')}>
                  Varanasi (Banarasi Katan)
                </Link>
              </li>
              <li>
                <Link href="/catalog?region=Kanchipuram" style={{ color: '#e5dec9', textDecoration: 'none', transition: 'color 0.2s ease' }} onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--gold)')} onMouseLeave={(e) => (e.currentTarget.style.color = '#e5dec9')}>
                  Kanchipuram (Korvai Silks)
                </Link>
              </li>
              <li>
                <Link href="/catalog?region=Yeola" style={{ color: '#e5dec9', textDecoration: 'none', transition: 'color 0.2s ease' }} onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--gold)')} onMouseLeave={(e) => (e.currentTarget.style.color = '#e5dec9')}>
                  Yeola (Paithani Silks)
                </Link>
              </li>
              <li>
                <Link href="/catalog?region=Chanderi" style={{ color: '#e5dec9', textDecoration: 'none', transition: 'color 0.2s ease' }} onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--gold)')} onMouseLeave={(e) => (e.currentTarget.style.color = '#e5dec9')}>
                  Chanderi (Zari &amp; Cotton Silks)
                </Link>
              </li>
              <li>
                <Link href="/categories" style={{ color: 'var(--gold)', textDecoration: 'none', fontWeight: 600, fontSize: '0.82rem', marginTop: '4px', display: 'inline-block' }}>
                  Explore All 12 Clusters →
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Curated Collections */}
          <div>
            <h3 style={{ color: 'var(--gold)', fontSize: '0.8rem', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: '16px', fontWeight: 700 }}>
              Curated Collections
            </h3>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <li>
                <Link href="/collections/1-of-1-heirlooms" style={{ color: '#e5dec9', textDecoration: 'none', transition: 'color 0.2s ease' }} onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--gold)')} onMouseLeave={(e) => (e.currentTarget.style.color = '#e5dec9')}>
                  👑 1-of-1 Heirloom Vault
                </Link>
              </li>
              <li>
                <Link href="/collections/bridal-sanctuary" style={{ color: '#e5dec9', textDecoration: 'none', transition: 'color 0.2s ease' }} onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--gold)')} onMouseLeave={(e) => (e.currentTarget.style.color = '#e5dec9')}>
                  🪔 Royal Bridal Sanctuary
                </Link>
              </li>
              <li>
                <Link href="/catalog" style={{ color: '#e5dec9', textDecoration: 'none', transition: 'color 0.2s ease' }} onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--gold)')} onMouseLeave={(e) => (e.currentTarget.style.color = '#e5dec9')}>
                  ✨ All Master Weaves
                </Link>
              </li>
              <li>
                <Link href="/about" style={{ color: '#e5dec9', textDecoration: 'none', transition: 'color 0.2s ease' }} onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--gold)')} onMouseLeave={(e) => (e.currentTarget.style.color = '#e5dec9')}>
                  Our Provenance Story
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4: Patron Sanctuary & Legal */}
          <div>
            <h3 style={{ color: 'var(--gold)', fontSize: '0.8rem', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: '16px', fontWeight: 700 }}>
              Patron Care &amp; Trust
            </h3>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <li>
                <Link href="/bag" style={{ color: '#e5dec9', textDecoration: 'none', transition: 'color 0.2s ease' }} onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--gold)')} onMouseLeave={(e) => (e.currentTarget.style.color = '#e5dec9')}>
                  Shopping Bag &amp; Checkout
                </Link>
              </li>
              <li>
                <Link href="/privacy-policy" style={{ color: 'var(--text-dim)', textDecoration: 'none', transition: 'color 0.2s ease' }} onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--gold)')} onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-dim)')}>
                  Privacy &amp; Data Protection
                </Link>
              </li>
              <li>
                <Link href="/shipping" style={{ color: 'var(--text-dim)', textDecoration: 'none', transition: 'color 0.2s ease' }} onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--gold)')} onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-dim)')}>
                  Express Shipping Policy
                </Link>
              </li>
              <li>
                <Link href="/refunds" style={{ color: 'var(--text-dim)', textDecoration: 'none', transition: 'color 0.2s ease' }} onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--gold)')} onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-dim)')}>
                  Inspection &amp; Returns
                </Link>
              </li>
              <li>
                <Link href="/terms" style={{ color: 'var(--text-dim)', textDecoration: 'none', transition: 'color 0.2s ease' }} onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--gold)')} onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-dim)')}>
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div
          style={{
            paddingTop: '24px',
            borderTop: '1px solid rgba(255, 255, 255, 0.08)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '16px',
            fontSize: '0.78rem',
          }}
        >
          <p style={{ margin: 0, color: 'var(--text-dim)' }}>
            &copy; {currentYear} Sutraಧಾರ Curators Pvt. Ltd. Handcrafted in India. All rights reserved.
          </p>
          <div style={{ display: 'flex', gap: '24px', alignItems: 'center', flexWrap: 'wrap' }}>
            <span style={{ color: 'var(--text-dim)' }}>
              🔒 256-Bit SSL Encrypted High-Assurance Gateway
            </span>
            <Link href="/portal/login" style={{ color: 'rgba(255,255,255,0.3)', textDecoration: 'none', fontSize: '0.72rem' }}>
              Guild Staff Access
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
