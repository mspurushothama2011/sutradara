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
    } catch (e) {
      console.error('Failed to load work logs:', e);
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
    <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
      <div style={{ marginBottom: '28px' }}>
        <span style={{ fontSize: '0.75rem', letterSpacing: '0.2em', color: 'var(--gold)', textTransform: 'uppercase' }}>
          DAILY OPERATIONS
        </span>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', color: '#fff', marginTop: '4px' }}>
          Staff Work Logs
        </h1>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '32px', alignItems: 'start' }}>
        {/* Past Logs List */}
        <div style={{ background: 'var(--bg-deep)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '12px', padding: '24px' }}>
          <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.2rem', color: '#fff', marginBottom: '16px' }}>
            Submitted Shift Summaries
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {logs.map((log) => (
              <div key={log.id} style={{ background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '8px', padding: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <span style={{ color: 'var(--gold)', fontSize: '0.85rem', fontWeight: 600 }}>{log.userName}</span>
                  <span style={{ color: 'var(--text-dim)', fontSize: '0.75rem' }}>{new Date(log.date).toLocaleDateString()}</span>
                </div>
                <p style={{ color: '#e0d8cc', fontSize: '0.85rem', lineHeight: 1.5 }}>{log.tasksSummary}</p>
                {log.itemsProcessed ? (
                  <span style={{ display: 'inline-block', marginTop: '8px', fontSize: '0.72rem', color: '#4ade80', background: 'rgba(74, 222, 128, 0.15)', padding: '2px 8px', borderRadius: '4px' }}>
                    📦 {log.itemsProcessed} Sarees Inspected / Packed
                  </span>
                ) : null}
              </div>
            ))}
          </div>
        </div>

        {/* Submit Log Form */}
        <div style={{ background: 'var(--bg-deep)', border: '1px solid rgba(201, 168, 76, 0.25)', borderRadius: '12px', padding: '24px' }}>
          <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.2rem', color: '#fff', marginBottom: '16px' }}>
            Submit Shift Summary
          </h3>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--gold)', marginBottom: '4px' }}>
                Tasks Completed Today *
              </label>
              <textarea
                rows={4}
                required
                placeholder="e.g. Conducted 20s pre-dispatch inspection videos for 4 sarees, updated floor stock counts..."
                value={tasksSummary}
                onChange={(e) => setTasksSummary(e.target.value)}
                style={{ width: '100%', padding: '10px', background: 'rgba(0,0,0,0.6)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '6px', color: '#fff', fontSize: '0.85rem' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--gold)', marginBottom: '4px' }}>
                Items / Sarees Processed
              </label>
              <input
                type="number"
                placeholder="e.g. 4"
                value={itemsProcessed}
                onChange={(e) => setItemsProcessed(e.target.value)}
                style={{ width: '100%', padding: '10px', background: 'rgba(0,0,0,0.6)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '6px', color: '#fff', fontSize: '0.85rem' }}
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
                color: '#110c08',
                fontWeight: 600,
                cursor: 'pointer',
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
