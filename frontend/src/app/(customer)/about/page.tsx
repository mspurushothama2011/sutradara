'use client';

import Link from 'next/link';
import { Landmark, Award, Video, ArrowRight } from 'lucide-react';
import LandingNavbar from '@/components/landing/LandingNavbar';

export default function AboutPage() {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', color: 'var(--text)' }}>
      <LandingNavbar />
      <div style={{ maxWidth: '960px', margin: '0 auto', padding: '140px 24px 80px' }}>
        <div style={{ textAlign: 'center', marginBottom: '64px' }}>
          <span style={{ fontSize: '0.78rem', letterSpacing: '0.22em', color: 'var(--gold)', textTransform: 'uppercase', fontWeight: 700 }}>
            OUR STORY & MISSION
          </span>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(2.5rem, 5vw, 3.8rem)', color: 'var(--text)', marginTop: '10px' }}>
            Guardians of the Loom
          </h1>
          <p style={{ maxWidth: '640px', margin: '16px auto 0', color: 'var(--text-dim)', fontSize: '1.05rem', lineHeight: 1.7 }}>
            We only curate, never mass-produce. Sutraಧಾರ connects India&apos;s master weavers directly with discerning patrons across the world.
          </p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '48px', fontSize: '1rem', color: 'var(--text-dim)', lineHeight: 1.8 }}>
          <section style={{ background: '#ffffff', padding: '40px', borderRadius: '3px', border: '1px solid rgba(179, 137, 56, 0.22)', boxShadow: '0 4px 20px rgba(26, 19, 13, 0.04)' }}>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.8rem', color: 'var(--gold-dark, #8c6818)', marginBottom: '14px', fontWeight: 600 }}>
              Direct From Master Weavers: Zero Middlemen
            </h2>
            <p style={{ color: 'var(--text)' }}>
              In traditional textile trading, a handloom saree passes through several intermediaries before reaching a retail store, driving prices up while leaving the master weaving family with only a fraction of the value.
            </p>
            <p style={{ marginTop: '14px', color: 'var(--text)' }}>
              Sutraಧಾರ was founded on a simple mission: <strong>Direct Artisan Connection</strong>. We work directly with master craftspeople in Varanasi, Kanchipuram, Yeola, and Chanderi. Every saree is acquired at fair, dignified terms that honor months of intricate handloom labor.
            </p>
          </section>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px' }}>
            <div style={{ background: '#ffffff', border: '1px solid rgba(179, 137, 56, 0.22)', borderRadius: '3px', padding: '28px', boxShadow: '0 4px 16px rgba(26, 19, 13, 0.04)' }}>
              <div style={{ color: 'var(--gold)', marginBottom: '8px' }}>
                <Landmark size={28} strokeWidth={1.25} />
              </div>
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.25rem', color: 'var(--text)', margin: '10px 0 6px', fontWeight: 600 }}>
                Silk Mark Authenticated
              </h3>
              <p style={{ fontSize: '0.88rem', color: 'var(--text-dim)' }}>
                Every single saree is backed by an official Silk Mark Organisation of India certification number guaranteeing 100% natural mulberry silk.
              </p>
            </div>

            <div style={{ background: '#ffffff', border: '1px solid rgba(179, 137, 56, 0.22)', borderRadius: '3px', padding: '28px', boxShadow: '0 4px 16px rgba(26, 19, 13, 0.04)' }}>
              <div style={{ color: 'var(--gold)', marginBottom: '8px' }}>
                <Award size={28} strokeWidth={1.25} />
              </div>
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.25rem', color: 'var(--text)', margin: '10px 0 6px', fontWeight: 600 }}>
                Exclusive 1-of-1 Sarees
              </h3>
              <p style={{ fontSize: '0.88rem', color: 'var(--text-dim)' }}>
                Our exclusive single-piece sarees are woven only once. Once acquired by a patron, the pattern is permanently retired.
              </p>
            </div>

            <div style={{ background: '#ffffff', border: '1px solid rgba(179, 137, 56, 0.22)', borderRadius: '3px', padding: '28px', boxShadow: '0 4px 16px rgba(26, 19, 13, 0.04)' }}>
              <div style={{ color: 'var(--gold)', marginBottom: '8px' }}>
                <Video size={28} strokeWidth={1.25} />
              </div>
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.25rem', color: 'var(--text)', margin: '10px 0 6px', fontWeight: 600 }}>
                Inspection Video Verification
              </h3>
              <p style={{ fontSize: '0.88rem', color: 'var(--text-dim)' }}>
                Our quality curators record a pre-dispatch video of your exact saree, verifying zari purity, selvage edges, and pallu tassels before shipping.
              </p>
            </div>
          </div>

          <div style={{ textAlign: 'center', marginTop: '32px' }}>
            <Link
              href="/catalog"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '16px 40px',
                background: 'var(--gold)',
                color: '#ffffff',
                borderRadius: '3px',
                fontWeight: 700,
                fontSize: '0.82rem',
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                textDecoration: 'none',
                boxShadow: '0 4px 16px rgba(179, 137, 56, 0.3)',
              }}
            >
              <span>Explore The Curated Treasury</span>
              <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
