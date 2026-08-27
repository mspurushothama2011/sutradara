import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthRequest } from '../middleware/auth.middleware';
import { AttendanceRecord, WorkLog, Announcement } from '../../../shared/types/index';

const prisma = new PrismaClient();

// In-memory records
let MEMORY_ATTENDANCE: AttendanceRecord[] = [
  {
    id: 'att-001',
    userId: 'demo-staff-id',
    userName: 'Priya Sharma (Fulfillment Staff)',
    date: new Date().toISOString().split('T')[0],
    clockIn: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
    status: 'PRESENT',
  },
  {
    id: 'att-002',
    userId: 'demo-staff-id',
    userName: 'Priya Sharma (Fulfillment Staff)',
    date: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    clockIn: new Date(Date.now() - 32 * 60 * 60 * 1000).toISOString(),
    clockOut: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    status: 'PRESENT',
  },
];

let MEMORY_WORK_LOGS: WorkLog[] = [
  {
    id: 'log-001',
    userId: 'demo-staff-id',
    userName: 'Priya Sharma',
    date: new Date().toISOString(),
    tasksSummary: 'Completed physical inspection and 20s QC video recordings for 3 Banarasi sarees (BAN-KAT-001). Prepared luxury silk boxes for dispatch.',
    itemsProcessed: 3,
  },
];

let MEMORY_ANNOUNCEMENTS: Announcement[] = [
  {
    id: 'ann-001',
    title: 'Diwali Festive Dispatch Deadline & Shift Timing',
    content: 'All heirloom sarees marked for Diwali delivery must undergo video inspection by 4:00 PM daily. Bluedart Express pickup is scheduled for 5:30 PM sharp.',
    isUrgent: true,
    createdBy: 'Sutradara Admin',
    createdAt: new Date().toISOString(),
  },
];

export async function clockIn(req: AuthRequest, res: Response) {
  const userId = req.user?.userId || 'demo-staff-id';
  const today = new Date().toISOString().split('T')[0];

  const existing = MEMORY_ATTENDANCE.find((a) => a.userId === userId && a.date === today);
  if (existing && !existing.clockOut) {
    return res.status(400).json({ error: 'Already clocked in for today.' });
  }

  const newRecord: AttendanceRecord = {
    id: `att-${Date.now()}`,
    userId,
    userName: req.user?.email || 'Staff User',
    date: today,
    clockIn: new Date().toISOString(),
    status: 'PRESENT',
  };

  MEMORY_ATTENDANCE.unshift(newRecord);
  return res.json({ message: 'Clock-in successful', record: newRecord });
}

export async function clockOut(req: AuthRequest, res: Response) {
  const userId = req.user?.userId || 'demo-staff-id';
  const today = new Date().toISOString().split('T')[0];

  const record = MEMORY_ATTENDANCE.find((a) => a.userId === userId && a.date === today && !a.clockOut);
  if (!record) {
    return res.status(400).json({ error: 'No active clock-in found for today.' });
  }

  record.clockOut = new Date().toISOString();
  return res.json({ message: 'Clock-out successful', record });
}

export async function listAttendance(req: AuthRequest, res: Response) {
  return res.json({ attendance: MEMORY_ATTENDANCE });
}

export async function calculateSalary(req: AuthRequest, res: Response) {
  const { baseSalary = 35000, monthDays = 30, presentDays = 26, halfDays = 2, unpaidLeaves = 2, bonus = 2000 } = req.body;

  // Formula: (baseSalary / monthDays) * (presentDays + (0.5 * halfDays)) + bonus
  const dailyRate = baseSalary / monthDays;
  const payableDays = presentDays + 0.5 * halfDays;
  const earnedBase = dailyRate * payableDays;
  const netSalary = Math.round(earnedBase + bonus);

  return res.json({
    baseSalary,
    monthDays,
    presentDays,
    halfDays,
    unpaidLeaves,
    dailyRate: Math.round(dailyRate),
    payableDays,
    earnedBase: Math.round(earnedBase),
    bonus,
    netSalary,
  });
}

export async function listWorkLogs(req: AuthRequest, res: Response) {
  return res.json({ workLogs: MEMORY_WORK_LOGS });
}

export async function submitWorkLog(req: AuthRequest, res: Response) {
  const { tasksSummary, itemsProcessed } = req.body;

  if (!tasksSummary) {
    return res.status(400).json({ error: 'Tasks summary is required.' });
  }

  const newLog: WorkLog = {
    id: `log-${Date.now()}`,
    userId: req.user?.userId || 'demo-staff-id',
    userName: req.user?.email || 'Staff User',
    date: new Date().toISOString(),
    tasksSummary,
    itemsProcessed: itemsProcessed ? parseInt(itemsProcessed, 10) : 0,
  };

  MEMORY_WORK_LOGS.unshift(newLog);
  return res.status(201).json({ message: 'Work log submitted successfully', log: newLog });
}

export async function listAnnouncements(req: Request, res: Response) {
  return res.json({ announcements: MEMORY_ANNOUNCEMENTS });
}

export async function createAnnouncement(req: AuthRequest, res: Response) {
  const { title, content, isUrgent } = req.body;

  if (!title || !content) {
    return res.status(400).json({ error: 'Title and content are required.' });
  }

  const newAnn: Announcement = {
    id: `ann-${Date.now()}`,
    title,
    content,
    isUrgent: Boolean(isUrgent),
    createdBy: req.user?.email || 'Admin',
    createdAt: new Date().toISOString(),
  };

  MEMORY_ANNOUNCEMENTS.unshift(newAnn);
  return res.status(201).json({ message: 'Announcement posted', announcement: newAnn });
}
