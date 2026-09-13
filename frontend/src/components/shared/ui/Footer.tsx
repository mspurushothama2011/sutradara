'use client';

import Link from 'next/link';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer
      style={{
        background: 'var(--bg-deep, #F4EFEA)',
        borderTop: '1px solid rgba(179, 137, 56, 0.25)',
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
            borderBottom: '1px solid rgba(179, 137, 56, 0.15)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <span style={{ fontSize: '1.8rem' }}>👑</span>
            <div>
              <h4 style={{ color: 'var(--text)', fontSize: '0.88rem', fontWeight: 700, margin: 0 }}>
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
              <h4 style={{ color: 'var(--text)', fontSize: '0.88rem', fontWeight: 700, margin: 0 }}>
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
              <h4 style={{ color: 'var(--text)', fontSize: '0.88rem', fontWeight: 700, margin: 0 }}>
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
              <h4 style={{ color: 'var(--text)', fontSize: '0.88rem', fontWeight: 700, margin: 0 }}>
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
            <p style={{ fontFamily: 'var(--font-display)', fontSize: '1.35rem', color: 'var(--text)', margin: '4px 0 10px', fontWeight: 600 }}>
              Authentic Handloom Silk
            </p>
            <p style={{ fontSize: '0.82rem', lineHeight: 1.6, color: 'var(--text-dim)', marginBottom: '16px' }}>
              Certified pure silk sarees handwoven by traditional master artisans across India.
            </p>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'rgba(179, 137, 56, 0.1)', border: '1px solid rgba(179, 137, 56, 0.3)', padding: '6px 12px', borderRadius: '20px' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#16a34a' }} />
              <span style={{ fontSize: '0.72rem', color: 'var(--gold-dark, #8c6818)', fontWeight: 700 }}>100% Verified Handlooms</span>
            </div>
          </div>

          {/* Column 2: Craft Clusters */}
          <div>
            <h3 style={{ color: 'var(--gold)', fontSize: '0.8rem', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: '16px', fontWeight: 700 }}>
              Weaving Regions
            </h3>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <li>
                <Link href="/catalog?region=Varanasi" style={{ color: '#382C20', textDecoration: 'none', transition: 'color 0.2s ease', fontWeight: 500 }} onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--gold)')} onMouseLeave={(e) => (e.currentTarget.style.color = '#382C20')}>
                  Varanasi (Banarasi Silk)
                </Link>
              </li>
              <li>
                <Link href="/catalog?region=Kanchipuram" style={{ color: '#382C20', textDecoration: 'none', transition: 'color 0.2s ease', fontWeight: 500 }} onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--gold)')} onMouseLeave={(e) => (e.currentTarget.style.color = '#382C20')}>
                  Kanchipuram (Silk Sarees)
                </Link>
              </li>
              <li>
                <Link href="/catalog?region=Yeola" style={{ color: '#382C20', textDecoration: 'none', transition: 'color 0.2s ease', fontWeight: 500 }} onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--gold)')} onMouseLeave={(e) => (e.currentTarget.style.color = '#382C20')}>
                  Yeola (Paithani Silk)
                </Link>
              </li>
              <li>
                <Link href="/catalog?region=Chanderi" style={{ color: '#382C20', textDecoration: 'none', transition: 'color 0.2s ease', fontWeight: 500 }} onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--gold)')} onMouseLeave={(e) => (e.currentTarget.style.color = '#382C20')}>
                  Chanderi (Zari &amp; Cotton Silk)
                </Link>
              </li>
              <li>
                <Link href="/categories" style={{ color: 'var(--gold)', textDecoration: 'none', fontWeight: 700, fontSize: '0.82rem', marginTop: '4px', display: 'inline-block' }}>
                  View All Categories →
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Curated Collections */}
          <div>
            <h3 style={{ color: 'var(--gold)', fontSize: '0.8rem', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: '16px', fontWeight: 700 }}>
              Collections
            </h3>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <li>
                <Link href="/collections/1-of-1-heirlooms" style={{ color: '#382C20', textDecoration: 'none', transition: 'color 0.2s ease', fontWeight: 500 }} onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--gold)')} onMouseLeave={(e) => (e.currentTarget.style.color = '#382C20')}>
                  👑 Exclusive 1-of-1 Sarees
                </Link>
              </li>
              <li>
                <Link href="/collections/bridal-sanctuary" style={{ color: '#382C20', textDecoration: 'none', transition: 'color 0.2s ease', fontWeight: 500 }} onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--gold)')} onMouseLeave={(e) => (e.currentTarget.style.color = '#382C20')}>
                  🪔 Bridal Collection
                </Link>
              </li>
              <li>
                <Link href="/catalog" style={{ color: '#382C20', textDecoration: 'none', transition: 'color 0.2s ease', fontWeight: 500 }} onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--gold)')} onMouseLeave={(e) => (e.currentTarget.style.color = '#382C20')}>
                  ✨ All Sarees
                </Link>
              </li>
              <li>
                <Link href="/about" style={{ color: '#382C20', textDecoration: 'none', transition: 'color 0.2s ease', fontWeight: 500 }} onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--gold)')} onMouseLeave={(e) => (e.currentTarget.style.color = '#382C20')}>
                  Our Story &amp; Artisans
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4: Customer Care & Legal */}
          <div>
            <h3 style={{ color: 'var(--gold)', fontSize: '0.8rem', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: '16px', fontWeight: 700 }}>
              Customer Care &amp; Help
            </h3>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <li>
                <Link href="/bag" style={{ color: '#382C20', textDecoration: 'none', transition: 'color 0.2s ease', fontWeight: 500 }} onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--gold)')} onMouseLeave={(e) => (e.currentTarget.style.color = '#382C20')}>
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
            borderTop: '1px solid rgba(179, 137, 56, 0.15)',
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
            <Link href="/portal/login" style={{ color: 'var(--text-dim)', textDecoration: 'none', fontSize: '0.72rem', opacity: 0.7 }}>
              Guild Staff Access
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
