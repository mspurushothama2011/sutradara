import { Router } from 'express';
import { getAuditLogs } from '../../controllers/admin/audit.controller';
import { requireAuth, requireCapability } from '../../middleware/auth.middleware';

const router = Router();

router.get('/', requireAuth, requireCapability('system:audit_view'), getAuditLogs);

export default router;
