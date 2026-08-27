'use client';

import { useState } from 'react';

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
    <div style={{ minHeight: '100vh', background: 'var(--bg)', color: '#fff', padding: '80px 24px' }}>
      <div style={{ maxWidth: '1040px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '56px' }}>
          <span style={{ fontSize: '0.8rem', letterSpacing: '0.3em', color: 'var(--gold)', textTransform: 'uppercase' }}>
            MASTER CURATOR ASSISTANCE
          </span>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(2.4rem, 4.5vw, 3.6rem)', color: '#fff', marginTop: '10px' }}>
            Connect with Our Concierge
          </h1>
          <p style={{ maxWidth: '600px', margin: '14px auto 0', color: 'var(--text-cream)', fontSize: '0.95rem', lineHeight: 1.6 }}>
            Whether you seek bridal consultation, bespoke 1-of-1 weave inquiries, or delivery assistance, our team is at your service.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '48px' }}>
          {/* Contact Details */}
          <div style={{ background: 'var(--bg-deep)', padding: '36px', borderRadius: '16px', border: '1px solid rgba(201, 168, 76, 0.2)' }}>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', color: 'var(--gold)', marginBottom: '24px' }}>
              Direct Channels
            </h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', fontSize: '0.9rem' }}>
              <div>
                <span style={{ color: 'var(--text-dim)', fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                  WhatsApp Concierge
                </span>
                <p style={{ fontSize: '1.05rem', color: '#4ade80', fontWeight: 600, marginTop: '2px' }}>
                  +91 98200 12345
                </p>
                <p style={{ fontSize: '0.78rem', color: 'var(--text-dim)', marginTop: '2px' }}>
                  Available 10:00 AM – 8:00 PM IST (Mon – Sat)
                </p>
              </div>

              <div>
                <span style={{ color: 'var(--text-dim)', fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                  Patron Care Email
                </span>
                <p style={{ fontSize: '1.05rem', color: '#fff', fontWeight: 500, marginTop: '2px' }}>
                  concierge@sutradara.in
                </p>
              </div>

              <div>
                <span style={{ color: 'var(--text-dim)', fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                  Private Showroom & Vault
                </span>
                <p style={{ fontSize: '0.95rem', color: '#fff', marginTop: '2px', lineHeight: 1.5 }}>
                  Sutradara Heritage Pavilions<br />
                  Dr. E. Moses Road, Worli<br />
                  Mumbai, Maharashtra 400018
                </p>
                <p style={{ fontSize: '0.78rem', color: 'var(--gold)', marginTop: '4px' }}>
                  *By prior curator appointment only
                </p>
              </div>
            </div>
          </div>

          {/* Inquiry Form */}
          <div style={{ background: 'var(--bg-deep)', padding: '36px', borderRadius: '16px', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', color: '#fff', marginBottom: '20px' }}>
              Send an Inquiry
            </h2>

            {submitted ? (
              <div style={{ textAlign: 'center', padding: '40px 20px' }}>
                <span style={{ fontSize: '2rem' }}>✨</span>
                <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.3rem', color: 'var(--gold)', marginTop: '12px' }}>
                  Inquiry Received
                </h3>
                <p style={{ color: 'var(--text-dim)', fontSize: '0.85rem', marginTop: '8px' }}>
                  Our Master Curator will connect with you via WhatsApp/Email within 4 business hours.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-dim)', marginBottom: '6px' }}>
                    Full Name
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Radhika Singhania"
                    style={{ width: '100%', padding: '12px', background: 'rgba(0,0,0,0.5)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '6px', color: '#fff' }}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-dim)', marginBottom: '6px' }}>
                      Email
                    </label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="radhika@example.com"
                      style={{ width: '100%', padding: '12px', background: 'rgba(0,0,0,0.5)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '6px', color: '#fff' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-dim)', marginBottom: '6px' }}>
                      Phone / WhatsApp
                    </label>
                    <input
                      type="text"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+91 98200..."
                      style={{ width: '100%', padding: '12px', background: 'rgba(0,0,0,0.5)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '6px', color: '#fff' }}
                    />
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-dim)', marginBottom: '6px' }}>
                    Message / Saree Request
                  </label>
                  <textarea
                    rows={4}
                    required
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Tell us about the occasion, color palette, or specific weave technique you are searching for..."
                    style={{ width: '100%', padding: '12px', background: 'rgba(0,0,0,0.5)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '6px', color: '#fff', resize: 'none' }}
                  />
                </div>

                <button
                  type="submit"
                  style={{
                    marginTop: '8px',
                    padding: '14px',
                    background: 'var(--gold)',
                    color: '#110c08',
                    border: 'none',
                    borderRadius: '6px',
                    fontWeight: 700,
                    fontSize: '0.9rem',
                    cursor: 'pointer',
                    letterSpacing: '0.08em',
                    textTransform: 'uppercase',
                  }}
                >
                  Send to Curator →
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
