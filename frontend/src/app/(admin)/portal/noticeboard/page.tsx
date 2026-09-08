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
    } catch (e) {
      console.error('Failed to load announcements:', e);
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
    <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
      <div style={{ marginBottom: '28px' }}>
        <span style={{ fontSize: '0.75rem', letterSpacing: '0.2em', color: 'var(--gold)', textTransform: 'uppercase' }}>
          INTERNAL COMMUNICATIONS
        </span>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', color: '#fff', marginTop: '4px' }}>
          Team Noticeboard
        </h1>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: hasCapability('announcements:post') ? '1.3fr 1fr' : '1fr', gap: '32px', alignItems: 'start' }}>
        {/* Noticeboard Stream */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {announcements.map((ann) => (
            <div
              key={ann.id}
              style={{
                background: ann.isUrgent ? 'rgba(239, 68, 68, 0.08)' : 'var(--bg-deep)',
                border: ann.isUrgent ? '1px solid rgba(239, 68, 68, 0.4)' : '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: '12px',
                padding: '24px',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  {ann.isUrgent && (
                    <span style={{ padding: '3px 8px', background: '#ef4444', color: '#fff', fontSize: '0.7rem', fontWeight: 700, borderRadius: '4px' }}>
                      URGENT BROADCAST
                    </span>
                  )}
                  <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.2rem', color: '#fff' }}>
                    {ann.title}
                  </h3>
                </div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>
                  {new Date(ann.createdAt).toLocaleDateString()}
                </span>
              </div>

              <p style={{ fontSize: '0.9rem', color: '#d1c7b7', lineHeight: 1.6 }}>{ann.content}</p>

              <div style={{ marginTop: '16px', paddingTop: '12px', borderTop: '1px solid rgba(255,255,255,0.06)', fontSize: '0.75rem', color: 'var(--gold)' }}>
                Posted by: {ann.createdBy}
              </div>
            </div>
          ))}
        </div>

        {/* Post Announcement Form (Restricted to Admin / Announcements capability) */}
        {hasCapability('announcements:post') && (
          <div style={{ background: 'var(--bg-deep)', border: '1px solid rgba(201, 168, 76, 0.3)', borderRadius: '12px', padding: '24px' }}>
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.2rem', color: '#fff', marginBottom: '16px' }}>
              Broadcast Announcement
            </h3>

            <form onSubmit={handlePost} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--gold)', marginBottom: '4px' }}>Headline *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Bluedart Express Holiday Dispatch Schedule"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  style={{ width: '100%', padding: '10px', background: 'rgba(0,0,0,0.6)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '6px', color: '#fff' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--gold)', marginBottom: '4px' }}>Message Details *</label>
                <textarea
                  rows={4}
                  required
                  placeholder="Enter full operational details and deadlines..."
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  style={{ width: '100%', padding: '10px', background: 'rgba(0,0,0,0.6)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '6px', color: '#fff' }}
                />
              </div>

              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.82rem', color: '#fca5a5', cursor: 'pointer' }}>
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
                  color: '#110c08',
                  fontWeight: 600,
                  cursor: 'pointer',
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
