'use client';

import Link from 'next/link';

export default function AboutPage() {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', color: '#fff', padding: '80px 24px' }}>
      <div style={{ maxWidth: '960px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '64px' }}>
          <span style={{ fontSize: '0.8rem', letterSpacing: '0.3em', color: 'var(--gold)', textTransform: 'uppercase' }}>
            OUR PROVENANCE & PHILOSOPHY
          </span>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(2.5rem, 5vw, 3.8rem)', color: '#fff', marginTop: '10px' }}>
            Guardians of the Loom
          </h1>
          <p style={{ maxWidth: '640px', margin: '16px auto 0', color: 'var(--text-cream)', fontSize: '1.05rem', lineHeight: 1.7 }}>
            We only curate — never mass-produce. Sutradara bridges India&apos;s generational master weavers directly with discerning patrons across the world.
          </p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '48px', fontSize: '1rem', color: 'var(--text-dim)', lineHeight: 1.8 }}>
          <section style={{ background: 'var(--bg-deep)', padding: '40px', borderRadius: '16px', border: '1px solid rgba(201, 168, 76, 0.2)' }}>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.8rem', color: 'var(--gold)', marginBottom: '14px' }}>
              The Genesis: Zero Middlemen, Pure Direct Curation
            </h2>
            <p>
              In traditional textile trading, a handloom saree passes through four to six intermediaries before reaching a luxury boutique — driving retail prices up by 300% while leaving the master weaving family with a fraction of the value.
            </p>
            <p style={{ marginTop: '14px' }}>
              Sutradara was founded on a singular conviction: <strong>Direct Curatorial Provenance</strong>. We work directly with master craftspeople in Varanasi, Kanchipuram, Yeola, and Chanderi. Every saree is acquired at fair, dignified prices that honor months of intricate handloom labor.
            </p>
          </section>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px' }}>
            <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', padding: '28px' }}>
              <span style={{ fontSize: '1.8rem' }}>🏛️</span>
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.25rem', color: '#fff', margin: '10px 0 6px' }}>
                Silk Mark Authenticated
              </h3>
              <p style={{ fontSize: '0.88rem' }}>
                Every single saree is backed by an official Silk Mark Organisation of India certification number guaranteeing 100% natural mulberry silk.
              </p>
            </div>

            <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', padding: '28px' }}>
              <span style={{ fontSize: '1.8rem' }}>👑</span>
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.25rem', color: '#fff', margin: '10px 0 6px' }}>
                1-of-1 Heirloom Vault
              </h3>
              <p style={{ fontSize: '0.88rem' }}>
                Our heirloom pieces are woven only once. Once acquired by a patron, the graph and weave card are permanently archived.
              </p>
            </div>

            <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', padding: '28px' }}>
              <span style={{ fontSize: '1.8rem' }}>📹</span>
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.25rem', color: '#fff', margin: '10px 0 6px' }}>
                20s Pre-Shipment Video
              </h3>
              <p style={{ fontSize: '0.88rem' }}>
                Our Master Curator records a 20-second high-definition inspection video before handover to express air courier.
              </p>
            </div>
          </div>

          <div style={{ textAlign: 'center', marginTop: '24px' }}>
            <Link
              href="/catalog"
              style={{
                display: 'inline-block',
                padding: '16px 40px',
                background: 'var(--gold)',
                color: '#110c08',
                borderRadius: '8px',
                textDecoration: 'none',
                fontWeight: 700,
                fontSize: '0.95rem',
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
              }}
            >
              Explore Our Curations →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
