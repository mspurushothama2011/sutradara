import { Router } from 'express';
import {
  clockIn,
  clockOut,
  listAttendance,
  calculateSalary,
  listWorkLogs,
  submitWorkLog,
  listAnnouncements,
  createAnnouncement,
} from '../../controllers/admin/staff.controller';
import { requireAuth, requireCapability } from '../../middleware/auth.middleware';

const router = Router();

router.post('/attendance/clock-in', requireAuth, clockIn);
router.post('/attendance/clock-out', requireAuth, clockOut);
router.get('/attendance', requireAuth, requireCapability('staff:attendance_view'), listAttendance);
router.post('/salary/calculate', requireAuth, requireCapability('staff:payroll_manage'), calculateSalary);

router.post('/work-logs', requireAuth, submitWorkLog);
router.get('/work-logs', requireAuth, listWorkLogs);

router.get('/announcements', listAnnouncements);
router.post('/announcements', requireAuth, requireCapability('announcements:post'), createAnnouncement);

export default router;
