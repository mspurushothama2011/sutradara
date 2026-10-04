'use client';

import { useState, useEffect } from 'react';
import { apiRequest } from '@/lib/api';
import { AuditLog } from '@/shared/types/index';

export default function AuditLogsPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadAuditLogs = async () => {
    try {
      setIsLoading(true);
      const res = await apiRequest('/audit');
      setLogs(res.auditLogs || []);
    } catch (e: any) {
      if (e?.status !== 401) {
        console.warn('Audit logs notice:', e?.message || e);
      }
      setLogs([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAuditLogs();
  }, []);

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', paddingBottom: '60px' }}>
      <div style={{ marginBottom: '28px' }}>
        <span style={{ fontSize: '0.75rem', letterSpacing: '0.2em', color: 'var(--gold)', textTransform: 'uppercase', fontWeight: 600 }}>
          CYBER DEFENSE & TRACEABILITY
        </span>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', color: 'var(--text)', marginTop: '4px' }}>
          Security Audit Trail
        </h1>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-dim)', marginTop: '4px' }}>
          Immutable record of high-privilege actions, pricing overrides, and fulfillment state transitions
        </p>
      </div>

      <div style={{ background: '#FFFFFF', border: '1px solid rgba(179, 137, 56, 0.22)', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 4px 16px rgba(26, 19, 13, 0.03)' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
          <thead>
            <tr style={{ background: 'var(--bg-deep)', borderBottom: '1px solid rgba(179, 137, 56, 0.18)', color: 'var(--text)', fontSize: '0.75rem', textTransform: 'uppercase', fontWeight: 700 }}>
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
            ) : logs.length === 0 ? (
              <tr>
                <td colSpan={6} style={{ padding: '32px', textAlign: 'center', color: 'var(--text-dim)' }}>No audit events recorded yet.</td>
              </tr>
            ) : (
              logs.map((log) => (
                <tr key={log.id} style={{ borderBottom: '1px solid rgba(179, 137, 56, 0.12)' }}>
                  <td style={{ padding: '14px 18px', color: 'var(--text-dim)', fontSize: '0.78rem' }}>
                    {new Date(log.createdAt).toLocaleString()}
                  </td>
                  <td style={{ padding: '14px 18px', color: 'var(--text)', fontWeight: 700 }}>
                    {log.userName || log.userId}
                  </td>
                  <td style={{ padding: '14px 18px' }}>
                    <span
                      style={{
                        padding: '4px 10px',
                        borderRadius: '4px',
                        background: 'rgba(179, 137, 56, 0.12)',
                        border: '1px solid rgba(179, 137, 56, 0.3)',
                        color: 'var(--gold-dark, #8A6418)',
                        fontFamily: 'monospace',
                        fontSize: '0.78rem',
                        fontWeight: 700,
                      }}
                    >
                      {log.action}
                    </span>
                  </td>
                  <td style={{ padding: '14px 18px', fontFamily: 'monospace', color: 'var(--text)', fontWeight: 600 }}>
                    {log.entityType}: {log.entityId}
                  </td>
                  <td style={{ padding: '14px 18px', fontFamily: 'monospace', fontSize: '0.75rem', color: '#15803d', fontWeight: 600 }}>
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
