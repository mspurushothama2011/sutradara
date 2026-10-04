'use client';

import { useState } from 'react';
import { CheckCircle2, MessageCircle, Mail, MapPin, ArrowRight } from 'lucide-react';
import LandingNavbar from '@/components/landing/LandingNavbar';

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', color: 'var(--text)' }}>
      <LandingNavbar />
      <div style={{ maxWidth: '1040px', margin: '0 auto', padding: '140px 24px 80px' }}>
        <div style={{ textAlign: 'center', marginBottom: '56px' }}>
          <span style={{ fontSize: '0.78rem', letterSpacing: '0.3em', color: 'var(--gold)', textTransform: 'uppercase', fontWeight: 700 }}>
            MASTER CURATOR ASSISTANCE
          </span>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(2.4rem, 4.5vw, 3.6rem)', color: 'var(--text)', marginTop: '10px' }}>
            Connect with Our Concierge
          </h1>
          <p style={{ maxWidth: '600px', margin: '14px auto 0', color: 'var(--text-dim)', fontSize: '0.95rem', lineHeight: 1.6 }}>
            Whether you seek bridal consultation, bespoke 1-of-1 weave inquiries, or delivery assistance, our concierge team is at your service.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '32px' }}>
          {/* Contact Details */}
          <div style={{ background: '#ffffff', padding: '36px', borderRadius: '3px', border: '1px solid rgba(179, 137, 56, 0.22)', boxShadow: '0 4px 16px rgba(26, 19, 13, 0.04)' }}>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', color: 'var(--gold-dark, #8c6818)', marginBottom: '24px', fontWeight: 600 }}>
              Direct Channels
            </h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', fontSize: '0.9rem' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-dim)', fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 600 }}>
                  <MessageCircle size={15} color="#15803d" />
                  <span>WhatsApp Concierge</span>
                </div>
                <p style={{ fontSize: '1.05rem', color: '#15803d', fontWeight: 700, marginTop: '4px' }}>
                  +91 98200 12345
                </p>
                <p style={{ fontSize: '0.78rem', color: 'var(--text-dim)', marginTop: '2px' }}>
                  Available 10:00 AM to 8:00 PM IST (Mon to Sat)
                </p>
              </div>

              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-dim)', fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 600 }}>
                  <Mail size={15} color="var(--gold)" />
                  <span>Patron Care Email</span>
                </div>
                <p style={{ fontSize: '1.05rem', color: 'var(--text)', fontWeight: 600, marginTop: '4px' }}>
                  concierge@sutradara.in
                </p>
              </div>

              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-dim)', fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 600 }}>
                  <MapPin size={15} color="var(--gold)" />
                  <span>Private Showroom and Vault</span>
                </div>
                <p style={{ fontSize: '0.95rem', color: 'var(--text)', marginTop: '4px', lineHeight: 1.5, fontWeight: 500 }}>
                  Sutraಧಾರ Heritage Pavilions<br />
                  Dr. E. Moses Road, Worli<br />
                  Mumbai, Maharashtra 400018
                </p>
                <p style={{ fontSize: '0.78rem', color: 'var(--gold-dark, #8c6818)', marginTop: '4px', fontWeight: 600 }}>
                  *By prior curator appointment only
                </p>
              </div>
            </div>
          </div>

          {/* Inquiry Form */}
          <div style={{ background: '#ffffff', padding: '36px', borderRadius: '3px', border: '1px solid rgba(179, 137, 56, 0.22)', boxShadow: '0 4px 16px rgba(26, 19, 13, 0.04)' }}>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', color: 'var(--text)', marginBottom: '20px', fontWeight: 600 }}>
              Send an Inquiry
            </h2>

            {submitted ? (
              <div style={{ textAlign: 'center', padding: '40px 20px' }}>
                <div style={{ color: 'var(--gold)', marginBottom: '12px', display: 'flex', justifyContent: 'center' }}>
                  <CheckCircle2 size={36} />
                </div>
                <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.3rem', color: 'var(--gold-dark, #8c6818)', marginTop: '12px', fontWeight: 600 }}>
                  Inquiry Received
                </h3>
                <p style={{ color: 'var(--text-dim)', fontSize: '0.85rem', marginTop: '8px' }}>
                  Our Master Curator will connect with you via WhatsApp or Email within 4 business hours.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-dim)', marginBottom: '6px', fontWeight: 600 }}>
                    Full Name
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Radhika Singhania"
                    style={{ width: '100%', padding: '12px', background: '#FAF8F5', border: '1px solid rgba(179, 137, 56, 0.3)', borderRadius: '2px', color: 'var(--text)', outline: 'none' }}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-dim)', marginBottom: '6px', fontWeight: 600 }}>
                      Email
                    </label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="radhika@example.com"
                      style={{ width: '100%', padding: '12px', background: '#FAF8F5', border: '1px solid rgba(179, 137, 56, 0.3)', borderRadius: '2px', color: 'var(--text)', outline: 'none' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-dim)', marginBottom: '6px', fontWeight: 600 }}>
                      Phone / WhatsApp
                    </label>
                    <input
                      type="text"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+91 98200..."
                      style={{ width: '100%', padding: '12px', background: '#FAF8F5', border: '1px solid rgba(179, 137, 56, 0.3)', borderRadius: '2px', color: 'var(--text)', outline: 'none' }}
                    />
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-dim)', marginBottom: '6px', fontWeight: 600 }}>
                    Message / Saree Request
                  </label>
                  <textarea
                    rows={4}
                    required
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Tell us about the occasion, color palette, or specific weave technique you are searching for..."
                    style={{ width: '100%', padding: '12px', background: '#FAF8F5', border: '1px solid rgba(179, 137, 56, 0.3)', borderRadius: '2px', color: 'var(--text)', resize: 'none', outline: 'none' }}
                  />
                </div>

                <button
                  type="submit"
                  style={{
                    marginTop: '8px',
                    padding: '14px',
                    background: 'var(--gold)',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '2px',
                    fontWeight: 700,
                    fontSize: '0.82rem',
                    cursor: 'pointer',
                    letterSpacing: '0.08em',
                    textTransform: 'uppercase',
                    boxShadow: '0 4px 14px rgba(179, 137, 56, 0.25)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                  }}
                >
                  <span>Send to Curator</span>
                  <ArrowRight size={14} />
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
