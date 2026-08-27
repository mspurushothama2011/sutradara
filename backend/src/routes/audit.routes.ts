import { Router } from 'express';
import { listAuditLogs } from '../controllers/audit.controller';
import { requireAuth, requireCapability } from '../middleware/auth.middleware';

const router = Router();

router.get('/', requireAuth, requireCapability('audit:view'), listAuditLogs);

export default router;
