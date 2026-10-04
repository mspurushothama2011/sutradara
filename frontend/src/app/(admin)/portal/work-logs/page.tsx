'use client';

import { useState, useEffect } from 'react';
import { apiRequest } from '@/lib/api';
import { WorkLog } from '@/shared/types/index';

export default function WorkLogsPage() {
  const [logs, setLogs] = useState<WorkLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [tasksSummary, setTasksSummary] = useState('');
  const [itemsProcessed, setItemsProcessed] = useState('');

  const loadLogs = async () => {
    try {
      setIsLoading(true);
      const res = await apiRequest('/staff/work-logs');
      setLogs(res.workLogs || []);
    } catch (e: any) {
      if (e?.status !== 401) {
        console.warn('Work logs notice:', e?.message || e);
      }
      setLogs([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadLogs();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await apiRequest('/staff/work-logs', {
        method: 'POST',
        data: { tasksSummary, itemsProcessed },
      });
      setTasksSummary('');
      setItemsProcessed('');
      alert('✓ Daily work summary logged successfully!');
      loadLogs();
    } catch (e: any) {
      alert(e.message || 'Submission failed');
    }
  };

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', paddingBottom: '60px' }}>
      <div style={{ marginBottom: '28px' }}>
        <span style={{ fontSize: '0.75rem', letterSpacing: '0.2em', color: 'var(--gold)', textTransform: 'uppercase', fontWeight: 600 }}>
          DAILY OPERATIONS
        </span>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', color: 'var(--text)', marginTop: '4px' }}>
          Staff Work Logs
        </h1>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 420px), 1fr))', gap: '32px', alignItems: 'start' }}>
        {/* Past Logs List */}
        <div style={{ background: '#FFFFFF', border: '1px solid rgba(179, 137, 56, 0.22)', borderRadius: '12px', padding: '24px', boxShadow: '0 4px 16px rgba(26, 19, 13, 0.03)' }}>
          <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.2rem', color: 'var(--text)', marginBottom: '16px' }}>
            Submitted Shift Summaries
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {logs.length === 0 ? (
              <p style={{ color: 'var(--text-dim)', fontSize: '0.85rem' }}>No shift summaries recorded yet.</p>
            ) : (
              logs.map((log) => (
                <div key={log.id} style={{ background: 'var(--bg-deep)', border: '1px solid rgba(179, 137, 56, 0.18)', borderRadius: '8px', padding: '16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                    <span style={{ color: 'var(--gold-dark, #8A6418)', fontSize: '0.88rem', fontWeight: 700 }}>{log.userName}</span>
                    <span style={{ color: 'var(--text-dim)', fontSize: '0.75rem' }}>{new Date(log.date).toLocaleDateString()}</span>
                  </div>
                  <p style={{ color: 'var(--text)', fontSize: '0.85rem', lineHeight: 1.5 }}>{log.tasksSummary}</p>
                  {log.itemsProcessed ? (
                    <span style={{ display: 'inline-block', marginTop: '8px', fontSize: '0.75rem', color: '#15803d', background: 'rgba(34, 197, 94, 0.12)', padding: '2px 8px', borderRadius: '4px', fontWeight: 600 }}>
                      📦 {log.itemsProcessed} Sarees Inspected / Packed
                    </span>
                  ) : null}
                </div>
              ))
            )}
          </div>
        </div>

        {/* Submit Log Form */}
        <div style={{ background: '#FFFFFF', border: '1px solid rgba(179, 137, 56, 0.25)', borderRadius: '12px', padding: '24px', boxShadow: '0 4px 16px rgba(26, 19, 13, 0.03)' }}>
          <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.2rem', color: 'var(--text)', marginBottom: '16px' }}>
            Submit Shift Summary
          </h3>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text)', fontWeight: 600, marginBottom: '4px' }}>
                Tasks Completed Today *
              </label>
              <textarea
                rows={4}
                required
                placeholder="e.g. Conducted 20s pre-dispatch inspection videos for 4 sarees, updated floor stock counts..."
                value={tasksSummary}
                onChange={(e) => setTasksSummary(e.target.value)}
                style={{ width: '100%', padding: '10px 14px', background: '#FAF8F5', border: '1px solid rgba(179, 137, 56, 0.3)', borderRadius: '6px', color: 'var(--text)', fontSize: '0.85rem', outline: 'none' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text)', fontWeight: 600, marginBottom: '4px' }}>
                Items / Sarees Processed
              </label>
              <input
                type="number"
                placeholder="e.g. 4"
                value={itemsProcessed}
                onChange={(e) => setItemsProcessed(e.target.value)}
                style={{ width: '100%', padding: '10px 14px', background: '#FAF8F5', border: '1px solid rgba(179, 137, 56, 0.3)', borderRadius: '6px', color: 'var(--text)', fontSize: '0.85rem', outline: 'none' }}
              />
            </div>

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
              Submit Daily Summary
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
