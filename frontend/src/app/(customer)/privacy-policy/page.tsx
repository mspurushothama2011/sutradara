'use client';

import LandingNavbar from '@/components/landing/LandingNavbar';
import Footer from '@/components/shared/ui/Footer';
import { ShieldCheck, Lock, Eye, FileText, CheckCircle2 } from 'lucide-react';

export default function PrivacyPolicyPage() {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', color: 'var(--text)' }}>
      <LandingNavbar />
      <div style={{ maxWidth: '860px', margin: '0 auto', padding: '140px 24px 80px' }}>
        <div style={{ marginBottom: '40px', borderBottom: '1px solid rgba(179, 137, 56, 0.25)', paddingBottom: '24px' }}>
          <span style={{ fontSize: '0.75rem', letterSpacing: '0.25em', color: 'var(--gold-dark)', textTransform: 'uppercase', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
            <ShieldCheck size={14} strokeWidth={1.5} /> LEGAL AND DATA COMPLIANCE
          </span>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '2.5rem', color: 'var(--text)', marginTop: '8px' }}>
            Privacy Policy
          </h1>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-dim)', marginTop: '6px' }}>
            Effective Date: January 1, 2026 | Compliant with Indian Digital Personal Data Protection (DPDP) Act 2023
          </p>
        </div>

        <div style={{ background: '#ffffff', borderRadius: '3px', border: '1px solid rgba(179, 137, 56, 0.22)', padding: '36px', boxShadow: '0 4px 20px rgba(26, 19, 13, 0.04)', display: 'flex', flexDirection: 'column', gap: '32px', fontSize: '0.95rem', color: 'var(--text-dim)', lineHeight: 1.8 }}>
          <section>
            <h2 style={{ color: 'var(--gold-dark)', fontSize: '1.25rem', fontFamily: 'var(--font-display)', marginBottom: '8px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Eye size={18} strokeWidth={1.5} /> 1. Data Collection and Purpose
            </h2>
            <p style={{ color: 'var(--text)' }}>
              When you browse Sutraಧಾರ or acquire an artisanal handloom piece, we collect your name, email address, contact phone number, shipping address, and essential device telemetry (<code style={{ background: 'var(--bg-deep)', padding: '2px 6px', borderRadius: '3px', color: 'var(--gold-dark)' }}>_sutradara_did</code>). This information is utilized strictly to fulfill orders, verify loom provenance, authenticate deliveries via secure OTP, and protect against bot manipulation.
            </p>
          </section>

          <section>
            <h2 style={{ color: 'var(--gold-dark)', fontSize: '1.25rem', fontFamily: 'var(--font-display)', marginBottom: '8px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <ShieldCheck size={18} strokeWidth={1.5} /> 2. Zero Data Brokering Standard
            </h2>
            <p style={{ color: 'var(--text)' }}>
              Sutraಧಾರ operates on a strict zero data-brokering standard. We never monetize, lease, or distribute patron profiles, contact details, or acquisition histories to third-party ad networks or brokers.
            </p>
          </section>

          <section>
            <h2 style={{ color: 'var(--gold-dark)', fontSize: '1.25rem', fontFamily: 'var(--font-display)', marginBottom: '8px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Lock size={18} strokeWidth={1.5} /> 3. Payment Processing and Encryption
            </h2>
            <p style={{ color: 'var(--text)' }}>
              All monetary transactions are encrypted via TLS 1.3 and handled through PCI-DSS Level 1 certified banking partners (Razorpay). Sutraಧಾರ does not capture or store debit/credit card CVVs, full card numbers, or net-banking credentials on our application infrastructure.
            </p>
          </section>

          <section>
            <h2 style={{ color: 'var(--gold-dark)', fontSize: '1.25rem', fontFamily: 'var(--font-display)', marginBottom: '8px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <CheckCircle2 size={18} strokeWidth={1.5} /> 4. Patron Rights Under DPDP Act 2023
            </h2>
            <p style={{ color: 'var(--text)' }}>
              Under the Digital Personal Data Protection Act 2023, you retain full rights to request access to your personal information, request data correction or deletion, withdraw consent for marketing notices, and nominate an authorized representative.
            </p>
          </section>

          <section>
            <h2 style={{ color: 'var(--gold-dark)', fontSize: '1.25rem', fontFamily: 'var(--font-display)', marginBottom: '8px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <FileText size={18} strokeWidth={1.5} /> 5. Data Protection Officer and Grievance Redressal
            </h2>
            <p style={{ color: 'var(--text)' }}>
              For data access requests, deletion directives, or grievance queries, contact our Data Protection Officer at <code style={{ background: 'var(--bg-deep)', padding: '2px 6px', borderRadius: '3px', color: 'var(--gold-dark)' }}>privacy@sutradara.in</code>. All formal grievances are resolved within 72 business hours.
            </p>
          </section>
        </div>
      </div>
      <Footer />
    </div>
  );
}
