import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthRequest } from '../middleware/auth.middleware';
import { createAndDispatchShipment } from '../services/shiprocket.service';

const prisma = new PrismaClient();

/**
 * Staff / Admin: 1-Click Dispatch via Shiprocket
 */
export async function dispatchOrderViaShiprocket(req: AuthRequest, res: Response) {
  const { orderId } = req.params;

  try {
    const order = await prisma.order.findFirst({
      where: {
        OR: [
          { id: orderId },
          { orderNumber: orderId },
        ],
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

    if (!order) {
      return res.status(404).json({ error: 'Order not found.' });
    }

    const shipping = (order.shippingAddress || {}) as any;

    const dispatchRes = await createAndDispatchShipment({
      orderId: order.id,
      orderNumber: order.orderNumber,
      orderDate: order.createdAt.toISOString(),
      billingCustomerName: shipping.recipientName || order.customer?.name || 'Valued Patron',
      billingAddress: shipping.street || 'Master Heritage Road',
      billingCity: shipping.city || 'Mumbai',
      billingPincode: shipping.pincode || '400001',
      billingState: shipping.state || 'Maharashtra',
      billingCountry: shipping.country || 'India',
      billingEmail: order.customer?.email || 'patron@sutradara.in',
      billingPhone: shipping.recipientPhone || order.customer?.phone || '+91 98765 43210',
      shippingIsBilling: true,
      orderItems: order.items.map((item) => ({
        name: item.product.name,
        sku: item.product.sku,
        units: item.quantity,
        sellingPrice: item.price,
      })),
      paymentMethod: 'Prepaid',
      subTotal: order.totalAmount,
    });

    // Update tracking history in PostgreSQL
    const currentEvents = (Array.isArray(order.trackingHistory) ? order.trackingHistory : []) as any[];
    currentEvents.unshift({
      id: `evt-${Date.now()}`,
      status: 'SHIPPED',
      location: 'National Logistics Gateway Hub',
      message: `Shipment sealed and handed over to ${dispatchRes.courierPartner}. Airway Bill: ${dispatchRes.awbNumber}.`,
      timestamp: new Date().toISOString(),
    });

    const updated = await prisma.order.update({
      where: { id: order.id },
      data: {
        status: 'SHIPPED',
        courierPartner: dispatchRes.courierPartner,
        awbNumber: dispatchRes.awbNumber,
        trackingUrl: dispatchRes.trackingUrl,
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
      message: dispatchRes.isSimulated
        ? 'Order dispatched successfully via high-assurance air simulation.'
        : 'Order successfully registered and dispatched via live Shiprocket API.',
      dispatch: dispatchRes,
      order: updated,
    });
  } catch (error: any) {
    console.error('Failed to dispatch order via Shiprocket:', error);
    return res.status(500).json({ error: error?.message || 'Database or logistics failure.' });
  }
}

/**
 * Public Webhook: Shiprocket Live Carrier Scans
 */
export async function handleShiprocketWebhook(req: Request, res: Response) {
  try {
    const { current_status, awb, location, scans, order_id } = req.body;

    if (!awb && !order_id) {
      return res.status(400).json({ error: 'Missing AWB or Order ID in webhook payload.' });
    }

    const order = await prisma.order.findFirst({
      where: {
        OR: [
          { awbNumber: awb },
          { orderNumber: order_id },
        ],
      },
    });

    if (!order) {
      return res.status(404).json({ error: 'Order not found for incoming webhook.' });
    }

    const statusMap: { [key: string]: string } = {
      'PICKED UP': 'SHIPPED',
      'IN TRANSIT': 'IN_TRANSIT',
      'OUT FOR DELIVERY': 'OUT_FOR_DELIVERY',
      'DELIVERED': 'DELIVERED',
      'RTO INITIATED': 'CANCELLED',
    };

    const mappedStatus = statusMap[String(current_status).toUpperCase()] || order.status;
    const currentEvents = (Array.isArray(order.trackingHistory) ? order.trackingHistory : []) as any[];

    const latestScan = scans && Array.isArray(scans) && scans.length > 0 ? scans[0] : null;
    const scanLocation = location || latestScan?.location || 'Logistics Hub Gateway';
    const scanActivity = latestScan?.activity || `Shipment status updated to ${current_status}`;

    currentEvents.unshift({
      id: `evt-${Date.now()}`,
      status: mappedStatus,
      location: scanLocation,
      message: scanActivity,
      timestamp: new Date().toISOString(),
    });

    await prisma.order.update({
      where: { id: order.id },
      data: {
        status: mappedStatus as any,
        trackingHistory: currentEvents as any,
      },
    });

    return res.json({ success: true, message: 'Tracking milestone synced from carrier.' });
  } catch (err: any) {
    console.error('Shiprocket webhook error:', err);
    return res.status(500).json({ error: 'Failed to process tracking webhook.' });
  }
}
