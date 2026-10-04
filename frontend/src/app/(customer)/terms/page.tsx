'use client';

import LandingNavbar from '@/components/landing/LandingNavbar';
import Footer from '@/components/shared/ui/Footer';
import { Award, ShieldCheck, Truck, RotateCcw, Scale } from 'lucide-react';

export default function TermsPage() {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', color: 'var(--text)' }}>
      <LandingNavbar />
      <div style={{ maxWidth: '860px', margin: '0 auto', padding: '140px 24px 80px' }}>
        <div style={{ marginBottom: '40px', borderBottom: '1px solid rgba(179, 137, 56, 0.25)', paddingBottom: '24px' }}>
          <span style={{ fontSize: '0.75rem', letterSpacing: '0.25em', color: 'var(--gold-dark)', textTransform: 'uppercase', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
            <Scale size={14} strokeWidth={1.5} /> TERMS OF CURATION AND COMMERCE
          </span>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '2.5rem', color: 'var(--text)', marginTop: '8px' }}>
            Terms of Service
          </h1>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-dim)', marginTop: '6px' }}>
            Last Updated: January 2026 | Governing Digital Acquisitions, Handloom Provenance, and Insured Logistics
          </p>
        </div>

        <div style={{ background: '#ffffff', borderRadius: '3px', border: '1px solid rgba(179, 137, 56, 0.22)', padding: '36px', boxShadow: '0 4px 20px rgba(26, 19, 13, 0.04)', display: 'flex', flexDirection: 'column', gap: '32px', fontSize: '0.95rem', color: 'var(--text-dim)', lineHeight: 1.8 }}>
          <section>
            <h2 style={{ color: 'var(--gold-dark)', fontSize: '1.25rem', fontFamily: 'var(--font-display)', marginBottom: '8px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Award size={18} strokeWidth={1.5} /> 1. Nature of Handloom and Artisanal Tolerances
            </h2>
            <p style={{ color: 'var(--text)' }}>
              Every saree curated by Sutraಧಾರ is individually crafted by master weavers on traditional pit-looms. Minor variations in weave density, zari motif spacing, yarn texture, or natural dye graduation are the authentic hallmarks of human handcraft, and are not considered manufacturing defects.
            </p>
          </section>

          <section>
            <h2 style={{ color: 'var(--gold-dark)', fontSize: '1.25rem', fontFamily: 'var(--font-display)', marginBottom: '8px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <ShieldCheck size={18} strokeWidth={1.5} /> 2. 1-of-1 Heirloom Exclusivity
            </h2>
            <p style={{ color: 'var(--text)' }}>
              Creations designated as &quot;1-of-1 Heirloom&quot; represent singular textile works. Upon successful order placement and payment authorization, the piece is marked permanently archived from production and cannot be replicated.
            </p>
          </section>

          <section>
            <h2 style={{ color: 'var(--gold-dark)', fontSize: '1.25rem', fontFamily: 'var(--font-display)', marginBottom: '8px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Truck size={18} strokeWidth={1.5} /> 3. Secure Insured Logistics and Delivery Verification
            </h2>
            <p style={{ color: 'var(--text)' }}>
              Due to the high valuation of pure silk handlooms, all shipments travel under full transit insurance. Delivery is fulfilled exclusively through our 4-digit Secure Delivery OTP protocol. Fulfillment is deemed complete once the valid OTP is verified with the authorized courier partner.
            </p>
          </section>

          <section>
            <h2 style={{ color: 'var(--gold-dark)', fontSize: '1.25rem', fontFamily: 'var(--font-display)', marginBottom: '8px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <RotateCcw size={18} strokeWidth={1.5} /> 4. Curatorial Inspection and Return Policy
            </h2>
            <p style={{ color: 'var(--text)' }}>
              Patrons may initiate a return within 7 calendar days of receipt, provided the saree remains unworn, unwashed, in its original presentation box, and with the tamper-evident Silk Mark certification seal intact.
            </p>
          </section>
        </div>
      </div>
      <Footer />
    </div>
  );
}
