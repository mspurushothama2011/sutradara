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
} from '../controllers/staff.controller';
import { requireAuth, requireCapability } from '../middleware/auth.middleware';

const router = Router();

// Attendance & Clock in/out
router.post('/attendance/clock-in', requireAuth, clockIn);
router.post('/attendance/clock-out', requireAuth, clockOut);
router.get('/attendance', requireAuth, requireCapability('staff:attendance_view'), listAttendance);

// Payroll Calculator (Requires staff:payroll_manage or admin)
router.post('/payroll/calculate', requireAuth, requireCapability('staff:payroll_manage'), calculateSalary);

// Daily Work Logs
router.get('/work-logs', requireAuth, listWorkLogs);
router.post('/work-logs', requireAuth, submitWorkLog);

// Noticeboard Announcements
router.get('/announcements', listAnnouncements);
router.post('/announcements', requireAuth, requireCapability('announcements:post'), createAnnouncement);

export default router;
