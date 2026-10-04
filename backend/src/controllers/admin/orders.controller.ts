import { Request, Response } from 'express';
import crypto from 'crypto';
import { PrismaClient } from '@prisma/client';
import { AuthRequest } from '../../middleware/auth.middleware';
import { getShiprocketTracking } from '../../services/shiprocket.service';

const prisma = new PrismaClient();

/**
 * Staff / Admin: List All Orders from PostgreSQL
 */
export async function listAllOrders(req: AuthRequest, res: Response) {
  try {
    const orders = await prisma.order.findMany({
      include: {
        customer: {
          select: {
            id: true,
            email: true,
            name: true,
            phone: true,
          },
        },
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                sku: true,
                images: true,
                craftRegion: true,
                fabric: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return res.json({ orders });
  } catch (error) {
    console.error('Failed to list orders from DB:', error);
    return res.status(500).json({ error: 'Database failed to list orders.' });
  }
}

/**
 * Helper to ensure complete and sequential tracking milestones (Clean Customer Logistics View)
 */
export function buildSequentialMilestones(order: {
  id: string;
  createdAt: Date | string;
  status: string;
  courierPartner?: string | null;
  awbNumber?: string | null;
  trackingHistory?: any;
}) {
  const courier = order.courierPartner || 'Bluedart Apex Air Express';
  const awb = order.awbNumber || `BD-${crypto.randomInt(10000000, 99999999)}IN`;
  const orderDate = new Date(order.createdAt || Date.now());
  const t0 = orderDate.getTime();

  const standardEventsByStatus: Record<string, { status: string; location: string; message: string; offsetHours: number }> = {
    PAID: {
      status: 'PAID',
      location: 'Varanasi Master Loom Vault',
      message: 'Payment authorized and order confirmed. Artisan handloom piece prepared for secure dispatch.',
      offsetHours: 0,
    },
    SHIPPED: {
      status: 'SHIPPED',
      location: 'National Logistics Gateway Hub',
      message: `Air package sealed in tamper-proof luxury heritage trunk and handed over to ${courier} (AWB: ${awb}).`,
      offsetHours: 6,
    },
    DISPATCHED: {
      status: 'SHIPPED',
      location: 'National Logistics Gateway Hub',
      message: `Air package sealed in tamper-proof luxury heritage trunk and handed over to ${courier} (AWB: ${awb}).`,
      offsetHours: 6,
    },
    IN_TRANSIT: {
      status: 'IN_TRANSIT',
      location: 'Destination Air Gateway Hub',
      message: 'Arrived at destination air gateway hub. Sorted for secured white-glove delivery van.',
      offsetHours: 18,
    },
    OUT_FOR_DELIVERY: {
      status: 'OUT_FOR_DELIVERY',
      location: 'Local Heritage Delivery Center',
      message: 'Package is out for white-glove doorstep delivery with the dedicated courier specialist.',
      offsetHours: 30,
    },
    DELIVERED: {
      status: 'DELIVERED',
      location: 'Patron Residence',
      message: 'Handloom heirloom securely delivered and accepted by patron.',
      offsetHours: 36,
    },
  };

  const statusOrder = ['PAID', 'SHIPPED', 'IN_TRANSIT', 'OUT_FOR_DELIVERY', 'DELIVERED'];
  const targetIndex = statusOrder.indexOf(
    order.status === 'PROCESSING' || order.status === 'QC_INSPECTED' ? 'PAID' : order.status === 'DISPATCHED' ? 'SHIPPED' : order.status
  );

  let existingEvents = (Array.isArray(order.trackingHistory) ? [...order.trackingHistory] : []) as any[];

  // Filter out any internal QC events from customer-facing view
  existingEvents = existingEvents.filter((e) => e.status !== 'QC_INSPECTED');

  if (targetIndex >= 0) {
    const existingStatuses = new Set(existingEvents.map((e) => e.status));
    for (let i = 0; i <= targetIndex; i++) {
      const stepStatus = statusOrder[i];
      if (!existingStatuses.has(stepStatus)) {
        const def = standardEventsByStatus[stepStatus];
        if (def) {
          const timestamp = new Date(Math.min(Date.now(), t0 + def.offsetHours * 3600 * 1000)).toISOString();
          existingEvents.push({
            id: `evt-${stepStatus.toLowerCase()}-${order.id || Date.now()}`,
            status: def.status,
            location: def.location,
            message: def.message,
            timestamp,
          });
        }
      }
    }
  }

  // Sort descending (newest event first)
  existingEvents.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  return existingEvents;
}

/**
 * Public Live Delivery Tracking by Order Number or ID
 */
export async function getOrderTracking(req: Request, res: Response) {
  const orderId = req.params.orderId || req.params.id;

  try {
    const order = await prisma.order.findFirst({
      where: {
        OR: [
          { orderNumber: orderId },
          { id: orderId },
          { awbNumber: orderId },
        ],
      },
      include: {
        customer: true,
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                sku: true,
                craftRegion: true,
                fabric: true,
                images: true,
                silkMarkNumber: true,
              },
            },
          },
        },
      },
    });

    if (!order) {
      return res.status(404).json({ error: 'Order not found in tracking records.' });
    }

    let liveCourier = order.courierPartner;
    let liveAwb = order.awbNumber;
    let liveTrackingUrl = order.trackingUrl;
    let trackingHistory = buildSequentialMilestones(order);

    // 🚀 Attempt to fetch real-time carrier scans from Shiprocket API if AWB or orderNumber exists
    if (order.awbNumber || order.orderNumber) {
      try {
        const shiprocketData = await getShiprocketTracking(order.awbNumber || order.orderNumber);
        if (shiprocketData && shiprocketData.activities && shiprocketData.activities.length > 0) {
          liveCourier = shiprocketData.courierPartner || liveCourier;
          liveAwb = shiprocketData.awbNumber || liveAwb;
          liveTrackingUrl = shiprocketData.trackingUrl || liveTrackingUrl;
          
          // Combine Shiprocket live carrier activities with the initial order confirmation
          const paidEvent = trackingHistory.find((e) => e.status === 'PAID') || {
            id: `evt-paid-${order.id}`,
            status: 'PAID',
            location: 'Varanasi Master Loom Vault',
            message: 'Payment authorized and order confirmed. Artisan handloom piece prepared for secure dispatch.',
            timestamp: new Date(order.createdAt).toISOString(),
          };

          const combined = [...shiprocketData.activities, paidEvent];
          combined.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
          trackingHistory = combined;
        }
      } catch (srErr) {
        console.warn('Shiprocket live telemetry lookup skipped:', srErr);
      }
    }

    // Scrub confidential internal inspectionVideoUrl from customer view if customer
    const { inspectionVideoUrl, ...publicOrder } = order as any;

    return res.json({
      order: {
        ...publicOrder,
        courierPartner: liveCourier || (order.status !== 'PAID' ? 'Bluedart Apex Air Express' : null),
        awbNumber: liveAwb || (order.status !== 'PAID' ? `BD-${order.orderNumber.replace(/[^0-9]/g, '')}IN` : null),
        trackingUrl: liveTrackingUrl,
        trackingHistory,
        trackingEvents: trackingHistory,
      },
    });
  } catch (error) {
    console.error('Failed to get tracking:', error);
    return res.status(500).json({ error: 'Database tracking lookup failed.' });
  }
}

/**
 * Staff / Admin: Update Order Dispatch & Logistics Milestone (Simulated Shiprocket & Bluedart Air)
 */
export async function updateDispatch(req: AuthRequest, res: Response) {
  const orderId = req.params.orderId || req.params.id;
  const {
    courierPartner,
    awbNumber,
    inspectionVideoUrl,
    status,
    isNdrFlagged,
    ndrReason,
    location: customLocation,
    message: customMessage,
  } = req.body;

  try {
    const existing = await prisma.order.findFirst({
      where: {
        OR: [
          { id: orderId },
          { orderNumber: orderId },
        ],
      },
    });

    if (!existing) {
      return res.status(404).json({ error: 'Order not found.' });
    }

    const nextStatus = status || existing.status;
    const generatedAwb = awbNumber || existing.awbNumber || `BD-${crypto.randomInt(10000000, 99999999)}IN`;
    const selectedCourier = courierPartner || existing.courierPartner || 'Bluedart Apex Air Express';
    const trackingUrl = `https://www.bluedart.com/tracking?awb=${generatedAwb}`;

    let currentEvents = (Array.isArray(existing.trackingHistory) ? [...existing.trackingHistory] : []) as any[];

    // If a custom message was provided or status changed
    if (customMessage || (status && status !== existing.status)) {
      let defaultMsg = `Order transitioned to ${nextStatus}`;
      let defaultLoc = 'Master Handloom Vault';

      if (nextStatus === 'QC_INSPECTED') {
        defaultMsg = 'Pre-shipment 20s ultra-high-definition video inspection recorded and verified by Master Curator.';
        defaultLoc = 'Varanasi Master Vault';
      } else if (nextStatus === 'DISPATCHED' || nextStatus === 'SHIPPED') {
        defaultMsg = `Air package sealed in tamper-proof luxury heritage trunk and handed over to ${selectedCourier} (AWB: ${generatedAwb}).`;
        defaultLoc = 'National Logistics Hub';
      } else if (nextStatus === 'IN_TRANSIT') {
        defaultMsg = 'Arrived at destination gateway hub. Sorted for secured white-glove van dispatch.';
        defaultLoc = 'Metro Air Gateway';
      } else if (nextStatus === 'OUT_FOR_DELIVERY') {
        defaultMsg = 'Package is out for white-glove doorstep delivery with the local courier specialist.';
        defaultLoc = 'Local Delivery Center';
      } else if (nextStatus === 'DELIVERED') {
        defaultMsg = 'Handloom heirloom securely delivered and accepted by patron.';
        defaultLoc = 'Patron Residence';
      }

      currentEvents.unshift({
        id: `evt-${Date.now()}`,
        status: nextStatus,
        location: customLocation || defaultLoc,
        message: customMessage || defaultMsg,
        timestamp: new Date().toISOString(),
      });
    }

    // Build comprehensive milestone history ensuring no missing prerequisite stages
    const fullMilestones = buildSequentialMilestones({
      id: existing.id,
      createdAt: existing.createdAt,
      status: nextStatus,
      courierPartner: selectedCourier,
      awbNumber: generatedAwb,
      trackingHistory: currentEvents,
    });

    const updated = await prisma.order.update({
      where: { id: existing.id },
      data: {
        status: nextStatus,
        courierPartner: selectedCourier,
        awbNumber: generatedAwb,
        trackingUrl,
        inspectionVideoUrl: inspectionVideoUrl || existing.inspectionVideoUrl,
        isNdrFlagged: typeof isNdrFlagged === 'boolean' ? isNdrFlagged : existing.isNdrFlagged,
        ndrReason: ndrReason !== undefined ? ndrReason : existing.ndrReason,
        trackingHistory: fullMilestones as any,
      },
      include: {
        customer: true,
        items: {
          include: {
            product: true,
          },
        },
      },
    });

    return res.json({
      success: true,
      message: 'Order dispatch and logistics milestone updated successfully.',
      order: {
        ...updated,
        trackingEvents: fullMilestones,
      },
    });
  } catch (error: any) {
    console.error('Failed to update dispatch in DB:', error);
    return res.status(500).json({ error: error?.message || 'Database failed to update dispatch.' });
  }
}
