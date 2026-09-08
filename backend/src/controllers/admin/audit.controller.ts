import { Request, Response } from 'express';
import { AuthRequest } from '../../middleware/auth.middleware';
import { AuditLog } from '../../../../shared/types/index';

let MEMORY_AUDIT_LOGS: AuditLog[] = [
  {
    id: 'aud-001',
    userId: 'demo-staff-id',
    userName: 'Priya Sharma (Staff)',
    action: 'STOCK_OVERRIDE',
    entityType: 'PRODUCT',
    entityId: 'BAN-KAT-001',
    oldValues: { stock: 1 },
    newValues: { stock: 0 },
    ipAddress: '127.0.0.1 (Cloudflare Edge Verified)',
    createdAt: new Date(Date.now() - 35 * 60 * 1000).toISOString(),
  },
  {
    id: 'aud-002',
    userId: 'demo-admin-id',
    userName: 'Sutradara Admin',
    action: 'PRICE_UPDATE',
    entityType: 'PRODUCT',
    entityId: 'KAN-WED-002',
    oldValues: { price: 68000 },
    newValues: { price: 72000 },
    ipAddress: '127.0.0.1 (Cloudflare Edge Verified)',
    createdAt: new Date(Date.now() - 120 * 60 * 1000).toISOString(),
  },
];

export async function getAuditLogs(req: AuthRequest, res: Response) {
  return res.json({
    logs: MEMORY_AUDIT_LOGS,
    totalCount: MEMORY_AUDIT_LOGS.length,
  });
}

export async function recordAuditEntry(entry: Omit<AuditLog, 'id' | 'createdAt'>) {
  const newLog: AuditLog = {
    id: `aud-${Date.now()}`,
    ...entry,
    createdAt: new Date().toISOString(),
  };
  MEMORY_AUDIT_LOGS.unshift(newLog);
  return newLog;
}
