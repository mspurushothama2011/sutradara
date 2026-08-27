'use client';

import { useState, useEffect } from 'react';
import { apiRequest } from '@/lib/api';
import { AuditLog } from '../../../../../shared/types/index';

export default function AuditLogsPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadAuditLogs = async () => {
    try {
      setIsLoading(true);
      const res = await apiRequest('/audit');
      setLogs(res.auditLogs || []);
    } catch (e) {
      console.error('Failed to load audit logs:', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAuditLogs();
  }, []);

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ marginBottom: '28px' }}>
        <span style={{ fontSize: '0.75rem', letterSpacing: '0.2em', color: 'var(--gold)', textTransform: 'uppercase' }}>
          CYBER DEFENSE & TRACEABILITY
        </span>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', color: '#fff', marginTop: '4px' }}>
          Security Audit Trail
        </h1>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-dim)', marginTop: '4px' }}>
          Immutable record of high-privilege actions, pricing overrides, and fulfillment state transitions
        </p>
      </div>

      <div style={{ background: 'var(--bg-deep)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '12px', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
          <thead>
            <tr style={{ background: 'rgba(255, 255, 255, 0.03)', borderBottom: '1px solid rgba(255, 255, 255, 0.08)', color: 'var(--gold)', fontSize: '0.75rem', textTransform: 'uppercase' }}>
              <th style={{ padding: '14px 18px' }}>Timestamp</th>
              <th style={{ padding: '14px 18px' }}>Actor</th>
              <th style={{ padding: '14px 18px' }}>Action Triggered</th>
              <th style={{ padding: '14px 18px' }}>Target Entity</th>
              <th style={{ padding: '14px 18px' }}>Delta / Values</th>
              <th style={{ padding: '14px 18px' }}>Origin IP / Proxy</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={6} style={{ padding: '32px', textAlign: 'center', color: 'var(--text-dim)' }}>Loading security audit logs...</td>
              </tr>
            ) : (
              logs.map((log) => (
                <tr key={log.id} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.04)' }}>
                  <td style={{ padding: '14px 18px', color: 'var(--text-dim)', fontSize: '0.78rem' }}>
                    {new Date(log.createdAt).toLocaleString()}
                  </td>
                  <td style={{ padding: '14px 18px', color: '#fff', fontWeight: 500 }}>
                    {log.userName || log.userId}
                  </td>
                  <td style={{ padding: '14px 18px' }}>
                    <span
                      style={{
                        padding: '4px 8px',
                        borderRadius: '4px',
                        background: 'rgba(201, 168, 76, 0.15)',
                        border: '1px solid var(--gold)',
                        color: 'var(--gold)',
                        fontFamily: 'monospace',
                        fontSize: '0.75rem',
                      }}
                    >
                      {log.action}
                    </span>
                  </td>
                  <td style={{ padding: '14px 18px', fontFamily: 'monospace', color: '#fff' }}>
                    {log.entityType}: {log.entityId}
                  </td>
                  <td style={{ padding: '14px 18px', fontFamily: 'monospace', fontSize: '0.75rem', color: '#4ade80' }}>
                    {JSON.stringify(log.newValues || {})}
                  </td>
                  <td style={{ padding: '14px 18px', color: 'var(--text-dim)', fontSize: '0.75rem' }}>
                    {log.ipAddress || 'Cloudflare Edge (WAF Guarded)'}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
