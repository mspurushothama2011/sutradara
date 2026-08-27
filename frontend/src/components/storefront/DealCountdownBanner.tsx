'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { apiRequest } from '@/lib/api';

export default function DealCountdownBanner() {
  const [deal, setDeal] = useState<any>(null);
  const [timeLeft, setTimeLeft] = useState<{ hours: number; minutes: number; seconds: number } | null>(null);

  useEffect(() => {
    async function fetchDeal() {
      try {
        const res = await apiRequest('/marketing/deal');
        if (res.deal && res.deal.isActive) {
          setDeal(res.deal);
        }
      } catch (e) {
        // Fallback silently if offline
      }
    }
    fetchDeal();
  }, []);

  useEffect(() => {
    if (!deal?.expiresAt) return;

    const timer = setInterval(() => {
      const difference = new Date(deal.expiresAt).getTime() - new Date().getTime();
      if (difference <= 0) {
        setTimeLeft(null);
        clearInterval(timer);
      } else {
        const hours = Math.floor((difference / (1000 * 60 * 60)) % 24);
        const minutes = Math.floor((difference / 1000 / 60) % 60);
        const seconds = Math.floor((difference / 1000) % 60);
        setTimeLeft({ hours, minutes, seconds });
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [deal]);

  if (!deal || !deal.isActive || !timeLeft) return null;

  return (
    <div
      style={{
        background: 'linear-gradient(90deg, #3d2b15 0%, #1a140e 50%, #3d2b15 100%)',
        borderBottom: '1px solid rgba(201, 168, 76, 0.4)',
        padding: '10px 24px',
        color: '#fff',
        fontSize: '0.8rem',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        gap: '16px',
        flexWrap: 'wrap',
        zIndex: 110,
      }}
    >
      <span style={{ color: 'var(--gold)', fontWeight: 600 }}>{deal.bannerText}</span>

      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontFamily: 'monospace' }}>
        <span style={{ fontSize: '0.7rem', color: 'var(--text-dim)', textTransform: 'uppercase' }}>Closes In:</span>
        <span style={{ padding: '2px 6px', background: 'rgba(0,0,0,0.6)', borderRadius: '4px', border: '1px solid var(--gold)', color: '#fff', fontWeight: 700 }}>
          {String(timeLeft.hours).padStart(2, '0')}h
        </span>
        :
        <span style={{ padding: '2px 6px', background: 'rgba(0,0,0,0.6)', borderRadius: '4px', border: '1px solid var(--gold)', color: '#fff', fontWeight: 700 }}>
          {String(timeLeft.minutes).padStart(2, '0')}m
        </span>
        :
        <span style={{ padding: '2px 6px', background: 'rgba(0,0,0,0.6)', borderRadius: '4px', border: '1px solid var(--gold)', color: '#4ade80', fontWeight: 700 }}>
          {String(timeLeft.seconds).padStart(2, '0')}s
        </span>
      </div>

      <Link
        href="/catalog"
        style={{
          padding: '4px 12px',
          background: 'var(--gold)',
          color: '#110c08',
          borderRadius: '4px',
          textDecoration: 'none',
          fontSize: '0.72rem',
          fontWeight: 700,
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
        }}
      >
        Claim Privilege →
      </Link>
    </div>
  );
}
