'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { apiRequest } from '@/lib/api';
import { User, ShippingAddress } from '@/shared/types/index';
import LandingNavbar from '@/components/customer/landing/LandingNavbar';

export default function CustomerAccountPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [addresses, setAddresses] = useState<ShippingAddress[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Address form state
  const [isAddingAddress, setIsAddingAddress] = useState(false);
  const [street, setStreet] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [pincode, setPincode] = useState('');
  const [phone, setPhone] = useState('');

  // 2-Step Account Deletion State
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteConfirmationText, setDeleteConfirmationText] = useState('');
  const [deleteOtp, setDeleteOtp] = useState('');
  const [deleteStep, setDeleteStep] = useState<'TYPE_DELETE' | 'ENTER_OTP'>('TYPE_DELETE');
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [devDeletionOtp, setDevDeletionOtp] = useState<string | null>(null);

  const loadProfile = async () => {
    try {
      setIsLoading(true);
      const res = await apiRequest('/customer/auth/me');
      setUser(res.user);
      setAddresses(res.addresses || []);
    } catch (e: any) {
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

  // Step 1: Request Deletion OTP after typing "DELETE"
  const handleRequestDeletionOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setDeleteError(null);

    if (deleteConfirmationText.trim() !== 'DELETE') {
      setDeleteError('Please type "DELETE" in capital letters to proceed.');
      return;
    }

    setIsDeleting(true);

    try {
      const res = await apiRequest('/customer/account/delete-request-otp', {
        method: 'POST',
      });

      if (res.devOtp) {
        setDevDeletionOtp(res.devOtp);
      }
      setDeleteStep('ENTER_OTP');
    } catch (err: any) {
      setDeleteError(err.message || 'Failed to send account deletion OTP.');
    } finally {
      setIsDeleting(false);
    }
  };

  // Step 2: Confirm Account Deletion with OTP
  const handleConfirmAccountDeletion = async (e: React.FormEvent) => {
    e.preventDefault();
    setDeleteError(null);

    if (!deleteOtp || deleteOtp.trim().length < 6) {
      setDeleteError('Please enter the 6-digit confirmation code.');
      return;
    }

    setIsDeleting(true);

    try {
      await apiRequest('/customer/account', {
        method: 'DELETE',
        data: {
          confirmationText: 'DELETE',
          otp: deleteOtp.trim(),
        },
      });

      localStorage.removeItem('accessToken');
      localStorage.removeItem('customerUser');
      alert('Your account has been successfully deactivated and all personal identifiable data has been erased. Historical orders remain intact for GST and accounting compliance.');
      router.push('/');
    } catch (err: any) {
      setDeleteError(err.message || 'Failed to delete account. Please verify the code.');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', color: 'var(--text)' }}>
      {/* Universal Storefront Navigation */}
      <LandingNavbar />

      <div style={{ paddingTop: '120px', paddingBottom: '80px', paddingLeft: '24px', paddingRight: '24px', maxWidth: '1080px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', borderBottom: '1px solid rgba(179, 137, 56, 0.2)', paddingBottom: '24px', marginBottom: '40px', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <span style={{ fontSize: '0.75rem', letterSpacing: '0.2em', color: 'var(--gold)', textTransform: 'uppercase', fontWeight: 700 }}>
              MY ACCOUNT
            </span>
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '2.4rem', color: 'var(--text)', marginTop: '4px' }}>
              Namaste, {user?.name || user?.email?.split('@')[0] || 'Customer'}
            </h1>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-dim)', marginTop: '4px' }}>
              {user?.email} • Verified Customer
            </p>
          </div>

          <div style={{ display: 'flex', gap: '16px' }}>
            <Link
              href="/account/orders"
              style={{
                padding: '10px 20px',
                background: 'rgba(179, 137, 56, 0.12)',
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
                background: '#ffffff',
                border: '1px solid rgba(179, 137, 56, 0.3)',
                color: 'var(--text-dim)',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '0.85rem',
                fontWeight: 600,
              }}
            >
              Sign Out
            </button>
          </div>
        </div>

        {/* Addresses & Privileges Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '32px' }}>
          {/* Saved Addresses */}
          <div style={{ background: '#ffffff', border: '1px solid rgba(179, 137, 56, 0.22)', borderRadius: '12px', padding: '32px', boxShadow: '0 4px 16px rgba(26, 19, 13, 0.05)' }}>
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
                  style={{ padding: '10px', background: '#FAF8F5', border: '1px solid rgba(179, 137, 56, 0.3)', borderRadius: '6px', color: 'var(--text)' }}
                />
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <input
                    type="text"
                    placeholder="City"
                    required
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    style={{ padding: '10px', background: '#FAF8F5', border: '1px solid rgba(179, 137, 56, 0.3)', borderRadius: '6px', color: 'var(--text)' }}
                  />
                  <input
                    type="text"
                    placeholder="State"
                    required
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    style={{ padding: '10px', background: '#FAF8F5', border: '1px solid rgba(179, 137, 56, 0.3)', borderRadius: '6px', color: 'var(--text)' }}
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
                    style={{ padding: '10px', background: '#FAF8F5', border: '1px solid var(--gold)', borderRadius: '6px', color: 'var(--text)', fontFamily: 'monospace' }}
                  />
                  <input
                    type="text"
                    placeholder="Phone"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    style={{ padding: '10px', background: '#FAF8F5', border: '1px solid rgba(179, 137, 56, 0.3)', borderRadius: '6px', color: 'var(--text)' }}
                  />
                </div>
                <button
                  type="submit"
                  style={{ marginTop: '8px', padding: '12px', background: 'var(--gold)', color: '#ffffff', border: 'none', borderRadius: '6px', fontWeight: 700, cursor: 'pointer', boxShadow: '0 4px 14px rgba(179, 137, 56, 0.25)' }}
                >
                  Save Address
                </button>
              </form>
            ) : addresses.length === 0 ? (
              <p style={{ fontSize: '0.85rem', color: 'var(--text-dim)' }}>No delivery addresses saved yet.</p>
            ) : (
              addresses.map((addr, idx) => (
                <div key={idx} style={{ padding: '16px', background: '#FAF8F5', border: '1px solid rgba(179, 137, 56, 0.2)', borderRadius: '8px', marginBottom: '12px' }}>
                  <p style={{ fontWeight: 600, color: 'var(--text)', fontSize: '0.9rem' }}>{addr.fullName || user?.name}</p>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-dim)', marginTop: '4px' }}>{addr.street}, {addr.city}, {addr.state} - <strong>{addr.pincode}</strong></p>
                  <p style={{ fontSize: '0.78rem', color: 'var(--gold)', marginTop: '4px', fontWeight: 600 }}>📱 {addr.phone || 'Phone linked to account'}</p>
                </div>
              ))
            )}
          </div>

          {/* Member Benefits */}
          <div style={{ background: '#ffffff', border: '1px solid rgba(179, 137, 56, 0.22)', borderRadius: '12px', padding: '32px', boxShadow: '0 4px 16px rgba(26, 19, 13, 0.05)' }}>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.3rem', color: 'var(--gold)', marginBottom: '16px' }}>
              Sutraಧಾರ Member Benefits
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', fontSize: '0.85rem', color: 'var(--text-dim)' }}>
              <div style={{ display: 'flex', gap: '12px' }}>
                <span style={{ color: 'var(--gold)', fontSize: '1.1rem', fontWeight: 700 }}>✓</span>
                <div>
                  <strong style={{ color: 'var(--text)' }}>1-of-1 Heirloom Reservation:</strong>
                  <p>10-minute uninterrupted checkout hold on single-piece unrepeatable weaves.</p>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '12px' }}>
                <span style={{ color: 'var(--gold)', fontSize: '1.1rem', fontWeight: 700 }}>✓</span>
                <div>
                  <strong style={{ color: 'var(--text)' }}>Pre-Shipment 20s Inspection Log:</strong>
                  <p>Watch your saree's Silk Mark and gold zari purity test recorded before package sealing.</p>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '12px' }}>
                <span style={{ color: 'var(--gold)', fontSize: '1.1rem', fontWeight: 700 }}>✓</span>
                <div>
                  <strong style={{ color: 'var(--text)' }}>Complimentary Insured Air Express:</strong>
                  <p>Zero contactless loss. Your package is dispatched in a sealed tamper-proof luxury box.</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ⚠️ Privacy & Account Deactivation Sanctuary (DPDP / GDPR Compliance) */}
        <div
          style={{
            marginTop: '48px',
            background: '#ffffff',
            border: '1px solid rgba(239, 68, 68, 0.25)',
            borderRadius: '12px',
            padding: '28px 32px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '20px',
            boxShadow: '0 4px 16px rgba(239, 68, 68, 0.04)',
          }}
        >
          <div>
            <h3 style={{ fontSize: '1.1rem', color: '#b91c1c', fontWeight: 600 }}>
              Account Privacy &amp; Right to Erasure
            </h3>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-dim)', marginTop: '4px', maxWidth: '640px' }}>
              In accordance with India DPDP Act 2023 &amp; GDPR, you may request permanent deactivation of your account and erasure of all personal delivery addresses. Past order records are anonymized and retained for GST accounting compliance.
            </p>
          </div>

          <button
            type="button"
            onClick={() => {
              setIsDeleteModalOpen(true);
              setDeleteStep('TYPE_DELETE');
              setDeleteConfirmationText('');
              setDeleteOtp('');
              setDeleteError(null);
            }}
            style={{
              padding: '10px 20px',
              background: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid #ef4444',
              borderRadius: '6px',
              color: '#b91c1c',
              fontSize: '0.85rem',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(239, 68, 68, 0.2)')}
            onMouseLeave={(e) => (e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)')}
          >
            Delete Account
          </button>
        </div>
      </div>

      {/* 2-Step Deletion Modal */}
      {isDeleteModalOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(26, 19, 13, 0.65)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: '16px',
          }}
        >
          <div
            style={{
              width: '100%',
              maxWidth: '480px',
              background: '#ffffff',
              border: '1.5px solid #ef4444',
              borderRadius: '16px',
              padding: '36px 32px',
              boxShadow: '0 25px 60px rgba(26, 19, 13, 0.2)',
            }}
          >
            <div style={{ textAlign: 'center', marginBottom: '20px' }}>
              <span style={{ fontSize: '2rem' }}>⚠️</span>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.6rem', color: 'var(--text)', marginTop: '8px' }}>
                Deactivate Sutraಧಾರ Account
              </h2>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-dim)', marginTop: '6px', lineHeight: 1.5 }}>
                {deleteStep === 'TYPE_DELETE'
                  ? 'This action will permanently anonymize your name, phone, and purge all saved delivery addresses. Type "DELETE" below to request confirmation OTP.'
                  : `A 6-digit confirmation code has been dispatched to ${user?.email}. Enter it below to execute permanent deactivation.`}
              </p>
            </div>

            {devDeletionOtp && (
              <div
                style={{
                  marginBottom: '16px',
                  padding: '10px 14px',
                  background: '#FAF8F5',
                  border: '1px dashed var(--gold)',
                  borderRadius: '6px',
                  textAlign: 'center',
                }}
              >
                <span style={{ fontSize: '0.72rem', color: 'var(--gold)', textTransform: 'uppercase', fontWeight: 600 }}>
                  🔑 Deletion Test Code:
                </span>
                <div style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text)', letterSpacing: '4px' }}>
                  {devDeletionOtp}
                </div>
              </div>
            )}

            {deleteError && (
              <div
                style={{
                  marginBottom: '16px',
                  padding: '10px 14px',
                  background: 'rgba(239, 68, 68, 0.12)',
                  border: '1px solid #ef4444',
                  borderRadius: '6px',
                  color: '#b91c1c',
                  fontSize: '0.82rem',
                  textAlign: 'center',
                  fontWeight: 600,
                }}
              >
                {deleteError}
              </div>
            )}

            {deleteStep === 'TYPE_DELETE' ? (
              <form onSubmit={handleRequestDeletionOtp} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', color: '#b91c1c', marginBottom: '6px', textAlign: 'center', fontWeight: 600 }}>
                    Type <strong>DELETE</strong> to confirm:
                  </label>
                  <input
                    type="text"
                    required
                    autoFocus
                    placeholder="DELETE"
                    value={deleteConfirmationText}
                    onChange={(e) => setDeleteConfirmationText(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      background: '#FAF8F5',
                      border: '1.5px solid #ef4444',
                      borderRadius: '8px',
                      color: 'var(--text)',
                      fontSize: '1.1rem',
                      textAlign: 'center',
                      letterSpacing: '3px',
                      fontWeight: 700,
                    }}
                  />
                </div>

                <div style={{ display: 'flex', gap: '10px', marginTop: '8px' }}>
                  <button
                    type="button"
                    onClick={() => setIsDeleteModalOpen(false)}
                    style={{
                      flex: 1,
                      padding: '12px',
                      background: '#FAF8F5',
                      border: '1px solid rgba(179, 137, 56, 0.3)',
                      borderRadius: '8px',
                      color: 'var(--text)',
                      fontSize: '0.85rem',
                      cursor: 'pointer',
                      fontWeight: 600,
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isDeleting || deleteConfirmationText.trim() !== 'DELETE'}
                    style={{
                      flex: 1,
                      padding: '12px',
                      background: deleteConfirmationText.trim() !== 'DELETE' ? 'rgba(239, 68, 68, 0.3)' : '#dc2626',
                      border: 'none',
                      borderRadius: '8px',
                      color: '#fff',
                      fontSize: '0.85rem',
                      fontWeight: 700,
                      cursor: deleteConfirmationText.trim() !== 'DELETE' || isDeleting ? 'not-allowed' : 'pointer',
                    }}
                  >
                    {isDeleting ? 'Sending OTP...' : 'Send Deletion OTP →'}
                  </button>
                </div>
              </form>
            ) : (
              <form onSubmit={handleConfirmAccountDeletion} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--gold)', marginBottom: '6px', textAlign: 'center', fontWeight: 600 }}>
                    Enter 6-Digit Deletion Code:
                  </label>
                  <input
                    type="text"
                    required
                    autoFocus
                    maxLength={6}
                    placeholder="• • • • • •"
                    value={deleteOtp}
                    onChange={(e) => setDeleteOtp(e.target.value.replace(/[^0-9]/g, ''))}
                    style={{
                      width: '100%',
                      padding: '14px',
                      background: '#FAF8F5',
                      border: '1.5px solid var(--gold)',
                      borderRadius: '8px',
                      color: 'var(--text)',
                      fontSize: '1.5rem',
                      textAlign: 'center',
                      letterSpacing: '6px',
                      fontFamily: 'monospace',
                      fontWeight: 700,
                    }}
                  />
                </div>

                <div style={{ display: 'flex', gap: '10px', marginTop: '8px' }}>
                  <button
                    type="button"
                    onClick={() => setDeleteStep('TYPE_DELETE')}
                    style={{
                      flex: 1,
                      padding: '12px',
                      background: '#FAF8F5',
                      border: '1px solid rgba(179, 137, 56, 0.3)',
                      borderRadius: '8px',
                      color: 'var(--text)',
                      fontSize: '0.85rem',
                      cursor: 'pointer',
                      fontWeight: 600,
                    }}
                  >
                    ← Back
                  </button>
                  <button
                    type="submit"
                    disabled={isDeleting || deleteOtp.length < 6}
                    style={{
                      flex: 1,
                      padding: '12px',
                      background: deleteOtp.length < 6 ? 'rgba(239, 68, 68, 0.3)' : '#dc2626',
                      border: 'none',
                      borderRadius: '8px',
                      color: '#fff',
                      fontSize: '0.85rem',
                      fontWeight: 700,
                      cursor: deleteOtp.length < 6 || isDeleting ? 'not-allowed' : 'pointer',
                    }}
                  >
                    {isDeleting ? 'Deactivating...' : 'Confirm Deletion'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
