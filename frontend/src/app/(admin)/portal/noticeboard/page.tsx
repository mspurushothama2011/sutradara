'use client';

import { useState, useEffect } from 'react';
import { usePermissions } from '@/hooks/usePermissions';
import { apiRequest } from '@/lib/api';
import { Announcement } from '@/shared/types/index';

export default function NoticeboardPage() {
  const { hasCapability } = usePermissions();
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isUrgent, setIsUrgent] = useState(false);

  const loadAnnouncements = async () => {
    try {
      setIsLoading(true);
      const res = await apiRequest('/staff/announcements');
      setAnnouncements(res.announcements || []);
    } catch (e: any) {
      if (e?.status !== 401) {
        console.warn('Announcements load notice:', e?.message || e);
      }
      setAnnouncements([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAnnouncements();
  }, []);

  const handlePost = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await apiRequest('/staff/announcements', {
        method: 'POST',
        data: { title, content, isUrgent },
      });
      setTitle('');
      setContent('');
      setIsUrgent(false);
      alert('✓ Announcement broadcasted to all team members!');
      loadAnnouncements();
    } catch (e: any) {
      alert(e.message || 'Failed to post announcement');
    }
  };

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', paddingBottom: '60px' }}>
      <div style={{ marginBottom: '28px' }}>
        <span style={{ fontSize: '0.75rem', letterSpacing: '0.2em', color: 'var(--gold)', textTransform: 'uppercase', fontWeight: 600 }}>
          INTERNAL COMMUNICATIONS
        </span>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', color: 'var(--text)', marginTop: '4px' }}>
          Team Noticeboard
        </h1>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: hasCapability('announcements:post') ? 'repeat(auto-fit, minmax(min(100%, 420px), 1fr))' : '1fr', gap: '32px', alignItems: 'start' }}>
        {/* Noticeboard Stream */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {announcements.length === 0 ? (
            <div style={{ background: '#FFFFFF', border: '1px solid rgba(179, 137, 56, 0.22)', borderRadius: '12px', padding: '24px', textAlign: 'center', color: 'var(--text-dim)' }}>
              No announcements posted yet.
            </div>
          ) : (
            announcements.map((ann) => (
              <div
                key={ann.id}
                style={{
                  background: ann.isUrgent ? '#FEF2F2' : '#FFFFFF',
                  border: ann.isUrgent ? '1px solid rgba(220, 38, 38, 0.4)' : '1px solid rgba(179, 137, 56, 0.22)',
                  borderRadius: '12px',
                  padding: '24px',
                  boxShadow: '0 4px 16px rgba(26, 19, 13, 0.03)',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    {ann.isUrgent && (
                      <span style={{ padding: '3px 8px', background: '#dc2626', color: '#FFFFFF', fontSize: '0.7rem', fontWeight: 700, borderRadius: '4px' }}>
                        URGENT BROADCAST
                      </span>
                    )}
                    <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.2rem', color: 'var(--text)' }}>
                      {ann.title}
                    </h3>
                  </div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>
                    {new Date(ann.createdAt).toLocaleDateString()}
                  </span>
                </div>

                <p style={{ fontSize: '0.9rem', color: 'var(--text)', lineHeight: 1.6 }}>{ann.content}</p>

                <div style={{ marginTop: '16px', paddingTop: '12px', borderTop: '1px solid rgba(179, 137, 56, 0.15)', fontSize: '0.78rem', color: 'var(--gold-dark, #8A6418)', fontWeight: 600 }}>
                  Posted by: {ann.createdBy}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Post Announcement Form (Restricted to Admin / Announcements capability) */}
        {hasCapability('announcements:post') && (
          <div style={{ background: '#FFFFFF', border: '1px solid rgba(179, 137, 56, 0.25)', borderRadius: '12px', padding: '24px', boxShadow: '0 4px 16px rgba(26, 19, 13, 0.03)' }}>
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.2rem', color: 'var(--text)', marginBottom: '16px' }}>
              Broadcast Announcement
            </h3>

            <form onSubmit={handlePost} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text)', fontWeight: 600, marginBottom: '4px' }}>Headline *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Bluedart Express Holiday Dispatch Schedule"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  style={{ width: '100%', padding: '10px 14px', background: '#FAF8F5', border: '1px solid rgba(179, 137, 56, 0.3)', borderRadius: '6px', color: 'var(--text)', outline: 'none' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text)', fontWeight: 600, marginBottom: '4px' }}>Message Details *</label>
                <textarea
                  rows={4}
                  required
                  placeholder="Enter full operational details and deadlines..."
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  style={{ width: '100%', padding: '10px 14px', background: '#FAF8F5', border: '1px solid rgba(179, 137, 56, 0.3)', borderRadius: '6px', color: 'var(--text)', outline: 'none' }}
                />
              </div>

              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', color: '#dc2626', cursor: 'pointer', fontWeight: 600 }}>
                <input type="checkbox" checked={isUrgent} onChange={(e) => setIsUrgent(e.target.checked)} />
                <span>Mark as High-Priority Urgent Notice</span>
              </label>

              <button
                type="submit"
                style={{
                  marginTop: '8px',
                  padding: '12px',
                  background: 'var(--gold)',
                  border: 'none',
                  borderRadius: '6px',
                  color: '#FFFFFF',
                  fontWeight: 700,
                  cursor: 'pointer',
                  boxShadow: '0 2px 8px rgba(179, 137, 56, 0.35)',
                }}
              >
                Broadcast to Team
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
