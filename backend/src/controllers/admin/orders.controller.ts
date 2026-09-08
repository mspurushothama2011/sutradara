import { Request, Response } from 'express';
import crypto from 'crypto';
import { PrismaClient } from '@prisma/client';
import { AuthRequest } from '../../middleware/auth.middleware';

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

    // Scrub confidential internal inspectionVideoUrl from customer view
    const { inspectionVideoUrl, ...publicOrder } = order as any;

    return res.json({ order: publicOrder });
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
  const { courierPartner, awbNumber, inspectionVideoUrl, status, isNdrFlagged, ndrReason } = req.body;

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

    const generatedAwb = awbNumber || existing.awbNumber || `BD-${crypto.randomInt(10000000, 99999999)}IN`;
    const selectedCourier = courierPartner || existing.courierPartner || 'Bluedart Apex Air';
    const trackingUrl = `https://www.bluedart.com/tracking?awb=${generatedAwb}`;

    const currentEvents = (Array.isArray(existing.trackingHistory) ? existing.trackingHistory : []) as any[];

    if (status && status !== existing.status) {
      let milestoneMessage = `Order status transitioned to ${status}`;
      let location = 'Master Handloom Vault';

      if (status === 'QC_INSPECTED') {
        milestoneMessage = 'Pre-shipment 20s ultra-high-definition video inspection recorded and verified by Master Curator.';
        location = 'Varanasi Master Vault';
      } else if (status === 'DISPATCHED' || status === 'SHIPPED') {
        milestoneMessage = `Air package sealed in tamper-proof luxury heritage trunk and handed over to ${selectedCourier} (AWB: ${generatedAwb}).`;
        location = 'National Logistics Hub';
      } else if (status === 'IN_TRANSIT') {
        milestoneMessage = 'Arrived at destination gateway hub. Sorted for secured white-glove van dispatch.';
        location = 'Metro Air Gateway';
      } else if (status === 'OUT_FOR_DELIVERY') {
        milestoneMessage = `Package is out for delivery with the local courier specialist to your destination address.`;
        location = 'Local Delivery Center';
      } else if (status === 'DELIVERED') {
        milestoneMessage = 'Handloom heirloom securely delivered to patron.';
        location = 'Patron Residence';
      }

      currentEvents.unshift({
        id: `evt-${Date.now()}`,
        status,
        location,
        message: milestoneMessage,
        timestamp: new Date().toISOString(),
      });
    }

    const updated = await prisma.order.update({
      where: { id: existing.id },
      data: {
        status: status || existing.status,
        courierPartner: selectedCourier,
        awbNumber: generatedAwb,
        trackingUrl,
        inspectionVideoUrl: inspectionVideoUrl || existing.inspectionVideoUrl,
        isNdrFlagged: typeof isNdrFlagged === 'boolean' ? isNdrFlagged : existing.isNdrFlagged,
        ndrReason: ndrReason !== undefined ? ndrReason : existing.ndrReason,
        trackingHistory: currentEvents as any,
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
      message: 'Order dispatch and simulated logistics updated successfully.',
      order: updated,
    });
  } catch (error) {
    console.error('Failed to update dispatch in DB:', error);
    return res.status(500).json({ error: 'Database failed to update dispatch.' });
  }
}
