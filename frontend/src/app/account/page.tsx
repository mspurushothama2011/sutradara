'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { apiRequest } from '@/lib/api';
import { User, ShippingAddress } from '../../../../shared/types/index';
import LandingNavbar from '@/components/landing/LandingNavbar';

export default function CustomerAccountPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [addresses, setAddresses] = useState<ShippingAddress[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Address form modal
  const [isAddingAddress, setIsAddingAddress] = useState(false);
  const [street, setStreet] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [pincode, setPincode] = useState('');
  const [phone, setPhone] = useState('');

  const loadProfile = async () => {
    try {
      setIsLoading(true);
      const res = await apiRequest('/customer/auth/me');
      setUser(res.user);
      setAddresses(res.addresses || []);
    } catch (e) {
      // Fallback to local storage
      const cached = localStorage.getItem('customerUser');
      if (cached) {
        setUser(JSON.parse(cached));
      } else {
        router.push('/login');
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadProfile();
  }, []);

  const handleSaveAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await apiRequest('/customer/auth/address', {
        method: 'POST',
        data: { street, city, state, pincode, phone },
      });
      setAddresses(res.addresses || []);
      setIsAddingAddress(false);
      setStreet('');
      setCity('');
      setState('');
      setPincode('');
      setPhone('');
    } catch (e: any) {
      alert(e.message || 'Failed to save address. Please check 6-digit PIN code.');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('customerUser');
    router.push('/login');
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', color: '#fff' }}>
      {/* Universal Storefront Navigation */}
      <LandingNavbar />

      <div style={{ paddingTop: '120px', paddingBottom: '80px', paddingLeft: '24px', paddingRight: '24px', maxWidth: '1080px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', borderBottom: '1px solid rgba(201, 168, 76, 0.2)', paddingBottom: '24px', marginBottom: '40px' }}>
          <div>
            <span style={{ fontSize: '0.75rem', letterSpacing: '0.25em', color: 'var(--gold)', textTransform: 'uppercase' }}>
              CUSTOMER SANCTUARY
            </span>
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '2.4rem', color: '#fff', marginTop: '4px' }}>
              Namaste, {user?.name || user?.email?.split('@')[0] || 'Patron'}
            </h1>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-dim)', marginTop: '4px' }}>
              {user?.email} • Verified Sutraಧಾರ Patron
            </p>
          </div>

          <div style={{ display: 'flex', gap: '16px' }}>
            <Link
              href="/account/orders"
              style={{
                padding: '10px 20px',
                background: 'rgba(201, 168, 76, 0.15)',
                border: '1px solid var(--gold)',
                color: 'var(--gold)',
                borderRadius: '6px',
                textDecoration: 'none',
                fontSize: '0.85rem',
                fontWeight: 600,
              }}
            >
              View Order History 📦
            </Link>
            <button
              onClick={handleLogout}
              style={{
                padding: '10px 18px',
                background: 'transparent',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                color: 'var(--text-dim)',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '0.85rem',
              }}
            >
              Sign Out
            </button>
          </div>
        </div>

        {/* Addresses Section */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '32px' }}>
          <div style={{ background: 'var(--bg-deep)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '12px', padding: '32px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.3rem', color: 'var(--gold)' }}>
                Saved Delivery Addresses
              </h2>
              <button
                onClick={() => setIsAddingAddress(!isAddingAddress)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--gold)',
                  fontSize: '0.82rem',
                  cursor: 'pointer',
                  fontWeight: 600,
                }}
              >
                {isAddingAddress ? 'Cancel' : '+ Add Address'}
              </button>
            </div>

            {isAddingAddress ? (
              <form onSubmit={handleSaveAddress} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <input
                  type="text"
                  placeholder="Street / House / Building"
                  required
                  value={street}
                  onChange={(e) => setStreet(e.target.value)}
                  style={{ padding: '10px', background: 'rgba(0,0,0,0.5)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '6px', color: '#fff' }}
                />
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <input
                    type="text"
                    placeholder="City"
                    required
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    style={{ padding: '10px', background: 'rgba(0,0,0,0.5)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '6px', color: '#fff' }}
                  />
                  <input
                    type="text"
                    placeholder="State"
                    required
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    style={{ padding: '10px', background: 'rgba(0,0,0,0.5)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '6px', color: '#fff' }}
                  />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <input
                    type="text"
                    placeholder="6-Digit PIN Code"
                    maxLength={6}
                    required
                    value={pincode}
                    onChange={(e) => setPincode(e.target.value)}
                    style={{ padding: '10px', background: 'rgba(0,0,0,0.5)', border: '1px solid var(--gold)', borderRadius: '6px', color: '#fff', fontFamily: 'monospace' }}
                  />
                  <input
                    type="text"
                    placeholder="Phone"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    style={{ padding: '10px', background: 'rgba(0,0,0,0.5)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '6px', color: '#fff' }}
                  />
                </div>
                <button
                  type="submit"
                  style={{ marginTop: '8px', padding: '12px', background: 'var(--gold)', color: '#110c08', border: 'none', borderRadius: '6px', fontWeight: 700, cursor: 'pointer' }}
                >
                  Save Address
                </button>
              </form>
            ) : addresses.length === 0 ? (
              <p style={{ fontSize: '0.85rem', color: 'var(--text-dim)' }}>No delivery addresses saved yet.</p>
            ) : (
              addresses.map((addr, idx) => (
                <div key={idx} style={{ padding: '16px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '8px', marginBottom: '12px' }}>
                  <p style={{ fontWeight: 600, color: '#fff', fontSize: '0.9rem' }}>{addr.fullName || user?.name}</p>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-dim)', marginTop: '4px' }}>{addr.street}, {addr.city}, {addr.state} - <strong>{addr.pincode}</strong></p>
                  <p style={{ fontSize: '0.78rem', color: 'var(--gold)', marginTop: '4px' }}>📱 {addr.phone || 'Phone linked to account'}</p>
                </div>
              ))
            )}
          </div>

          <div style={{ background: 'var(--bg-deep)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '12px', padding: '32px' }}>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.3rem', color: 'var(--gold)', marginBottom: '16px' }}>
              Sutraಧಾರ Patron Privileges
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', fontSize: '0.85rem', color: 'var(--text-dim)' }}>
              <div style={{ display: 'flex', gap: '12px' }}>
                <span style={{ color: 'var(--gold)', fontSize: '1.1rem' }}>✓</span>
                <div>
                  <strong style={{ color: '#fff' }}>1-of-1 Heirloom Reservation:</strong>
                  <p>10-minute uninterrupted checkout hold on single-piece unrepeatable weaves.</p>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '12px' }}>
                <span style={{ color: 'var(--gold)', fontSize: '1.1rem' }}>✓</span>
                <div>
                  <strong style={{ color: '#fff' }}>Pre-Shipment 20s Inspection Log:</strong>
                  <p>Watch your saree's Silk Mark and gold zari purity test before handover to Bluedart Air.</p>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '12px' }}>
                <span style={{ color: 'var(--gold)', fontSize: '1.1rem' }}>✓</span>
                <div>
                  <strong style={{ color: '#fff' }}>Secure 4-Digit Drop OTP:</strong>
                  <p>Zero contactless loss. Your package is only released upon physical inspection.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
