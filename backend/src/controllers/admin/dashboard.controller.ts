import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthRequest } from '../../middleware/auth.middleware';

const prisma = new PrismaClient();

/**
 * Get Real-Time Dashboard Statistics & Operational Telemetry
 */
export async function getDashboardStats(req: AuthRequest, res: Response) {
  try {
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
    const startOfYesterday = new Date(startOfToday.getTime() - 24 * 60 * 60 * 1000);

    // 1. Order Status Counts & Logistics Metrics
    const [
      totalOrders,
      pendingDispatch,
      readyForInspection,
      processingOrders,
      inTransitOrders,
      deliveredOrders,
      cancelledOrders,
      recentOrders,
    ] = await Promise.all([
      prisma.order.count(),
      prisma.order.count({
        where: {
          status: { in: ['PAID', 'QC_INSPECTED', 'PROCESSING'] },
        },
      }),
      prisma.order.count({
        where: { status: 'PAID' },
      }),
      prisma.order.count({
        where: { status: 'PROCESSING' },
      }),
      prisma.order.count({
        where: { status: { in: ['SHIPPED', 'IN_TRANSIT', 'OUT_FOR_DELIVERY'] } },
      }),
      prisma.order.count({
        where: { status: 'DELIVERED' },
      }),
      prisma.order.count({
        where: { status: 'CANCELLED' },
      }),
      prisma.order.findMany({
        take: 6,
        orderBy: { createdAt: 'desc' },
        include: {
          customer: {
            select: { id: true, name: true, email: true, phone: true },
          },
          items: {
            include: {
              product: {
                select: { id: true, name: true, sku: true, images: true, sellingPrice: true },
              },
            },
          },
        },
      }),
    ]);

    // 2. Inventory & Stock Metrics
    const [
      totalProducts,
      activeInStock,
      heirloomCount,
      lowStockCount,
      outOfStockCount,
      stockAggregate,
    ] = await Promise.all([
      prisma.product.count(),
      prisma.product.count({
        where: { stock: { gt: 0 } },
      }),
      prisma.product.count({
        where: { isHeirloom1of1: true, stock: { gt: 0 } },
      }),
      prisma.product.count({
        where: { stock: { lte: 1, gt: 0 } },
      }),
      prisma.product.count({
        where: { stock: 0 },
      }),
      prisma.product.aggregate({
        _sum: { stock: true },
      }),
    ]);

    // 3. Financial & Revenue Metrics (Calculated from actual Orders)
    const [todayOrders, yesterdayOrders, allCompletedOrders] = await Promise.all([
      prisma.order.findMany({
        where: {
          createdAt: { gte: startOfToday },
          status: { notIn: ['CANCELLED', 'PENDING'] },
        },
        select: { totalAmount: true },
      }),
      prisma.order.findMany({
        where: {
          createdAt: { gte: startOfYesterday, lt: startOfToday },
          status: { notIn: ['CANCELLED', 'PENDING'] },
        },
        select: { totalAmount: true },
      }),
      prisma.order.findMany({
        where: {
          status: { notIn: ['CANCELLED', 'PENDING'] },
        },
        select: { totalAmount: true },
      }),
    ]);

    const todayRevenue = todayOrders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);
    const yesterdayRevenue = yesterdayOrders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);
    const totalLifetimeRevenue = allCompletedOrders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);

    const revenueGrowth = yesterdayRevenue > 0
      ? Number((((todayRevenue - yesterdayRevenue) / yesterdayRevenue) * 100).toFixed(1))
      : todayRevenue > 0
      ? 100
      : 0;

    // 4. Staff, Operations & Shift Telemetry
    const userId = req.user?.userId;
    const [totalStaff, todayAttendanceCount, userAttendanceToday, recentAuditLogs, announcements] = await Promise.all([
      prisma.user.count({
        where: { role: { in: ['STAFF', 'ADMIN'] } },
      }),
      prisma.attendance.count({
        where: {
          date: { gte: startOfToday },
        },
      }),
      userId
        ? prisma.attendance.findFirst({
            where: {
              userId,
              date: { gte: startOfToday },
            },
            orderBy: { clockIn: 'desc' },
          })
        : null,
      prisma.auditLog.findMany({
        take: 6,
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            select: { name: true, email: true, role: true },
          },
        },
      }),
      prisma.announcement.findMany({
        take: 3,
        orderBy: { createdAt: 'desc' },
      }),
    ]);

    const isShiftActive = Boolean(userAttendanceToday && !userAttendanceToday.clockOut);

    return res.json({
      success: true,
      timestamp: new Date().toISOString(),
      orders: {
        total: totalOrders,
        pendingDispatch,
        readyForInspection,
        processing: processingOrders,
        inTransit: inTransitOrders,
        delivered: deliveredOrders,
        cancelled: cancelledOrders,
        recent: recentOrders,
      },
      inventory: {
        totalProducts,
        activeInStock,
        totalStockUnits: stockAggregate._sum.stock || 0,
        heirloomCount,
        lowStockCount,
        outOfStockCount,
      },
      finance: {
        todayRevenue,
        yesterdayRevenue,
        revenueGrowth,
        totalLifetimeRevenue,
        paidOrdersCount: allCompletedOrders.length,
      },
      operations: {
        totalStaff,
        todayAttendanceCount,
        isShiftActive,
        userAttendanceToday,
        recentAuditLogs,
        announcements,
      },
    });
  } catch (error) {
    console.error('Failed to fetch dashboard stats:', error);
    return res.status(500).json({ error: 'Failed to retrieve real-time dashboard data' });
  }
}
