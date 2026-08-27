import { Request, Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import { AuditLog } from '../../../shared/types/index';

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
    action: 'COUPON_CREATE',
    entityType: 'COUPON',
    entityId: 'VIRASAT10',
    newValues: { discount: '10%', minOrder: 25000 },
    ipAddress: '127.0.0.1 (Cloudflare Edge Verified)',
    createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'aud-003',
    userId: 'demo-staff-id',
    userName: 'Priya Sharma (Staff)',
    action: 'ORDER_DISPATCH_CONFIRMED',
    entityType: 'ORDER',
    entityId: 'SUT-2026-1001',
    newValues: { awb: 'BD-778902144IN', courier: 'Bluedart Apex Air', otp: '7492' },
    ipAddress: '127.0.0.1 (Cloudflare Edge Verified)',
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
  },
];

export async function listAuditLogs(req: AuthRequest, res: Response) {
  return res.json({ auditLogs: MEMORY_AUDIT_LOGS });
}
