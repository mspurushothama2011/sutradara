import { Router } from 'express';
import { getDashboardStats } from '../../controllers/admin/dashboard.controller';
import { requireAuth } from '../../middleware/auth.middleware';

const router = Router();

router.get('/stats', requireAuth, getDashboardStats);

export default router;
