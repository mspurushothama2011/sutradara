import { Request, Response } from 'express';
import crypto from 'crypto';
import { PrismaClient } from '@prisma/client';
import { AuthRequest } from '../middleware/auth.middleware';

const prisma = new PrismaClient();

/**
 * Public: Create Order (Bypassed Instant Payment & Direct Vault Allocation)
 */
export async function createOrder(req: AuthRequest, res: Response) {
  const { items, shippingAddress, couponCode } = req.body as {
    items: { productId: string; quantity: number }[];
    shippingAddress: {
      recipientName?: string;
      recipientPhone?: string;
      street: string;
      landmark?: string;
      city: string;
      state: string;
      pincode: string;
      country?: string;
    };
    couponCode?: string;
  };

  if (!items || items.length === 0) {
    return res.status(400).json({ error: 'Order must contain at least one saree.' });
  }

  if (!shippingAddress || !shippingAddress.street || !shippingAddress.pincode) {
    return res.status(400).json({ error: 'Valid delivery address with 6-digit PIN code is required.' });
  }

  try {
    // 1. Resolve Customer ID
    let customer = await prisma.customer.findFirst({
      where: req.user?.userId
        ? { id: req.user.userId }
        : { email: 'guest@sutradara.in' },
    });

    if (!customer) {
      customer = await prisma.customer.upsert({
        where: { email: req.user?.email || 'guest@sutradara.in' },
        update: {},
        create: {
          email: req.user?.email || 'guest@sutradara.in',
          name: shippingAddress.recipientName || 'Valued Patron',
          phone: shippingAddress.recipientPhone || '+91 98765 43210',
          isVerified: true,
        },
      });
    }

    // 2. Fetch Products
    const productIds = items.map((i) => i.productId);
    const dbProducts = await prisma.product.findMany({
      where: { id: { in: productIds } },
    });

    let subtotal = 0;
    const orderLineItems: { productId: string; price: number; quantity: number }[] = [];

    for (const item of items) {
      const p = dbProducts.find((prod) => prod.id === item.productId);
      if (!p) {
        return res.status(404).json({ error: `Saree "${item.productId}" is no longer available.` });
      }
      subtotal += p.sellingPrice * item.quantity;
      orderLineItems.push({
        productId: p.id,
        price: p.sellingPrice,
        quantity: item.quantity,
      });
    }

    // 3. Apply Discount
    let discountAmount = 0;
    if (couponCode) {
      const coupon = await prisma.coupon.findUnique({
        where: { code: couponCode.toUpperCase().trim() },
      });
      if (coupon && coupon.isActive) {
        if (coupon.discountType === 'PERCENTAGE') {
          discountAmount = (subtotal * coupon.discountValue) / 100;
        } else {
          discountAmount = coupon.discountValue;
        }
      }
    }

    const finalTotal = Math.max(0, subtotal - discountAmount);
    const orderNumber = `SUT-${new Date().getFullYear()}-${crypto.randomInt(1000, 9999)}`;

    // 4. Initial Logistics Milestone (Bypassed Shiprocket Simulation)
    const initialMilestones = [
      {
        id: `evt-${Date.now()}`,
        status: 'PAID',
        location: 'Varanasi Master Loom Vault',
        message: 'Order placed & payment verified. Saree piece allocated in luxury tamper-proof trunk.',
        timestamp: new Date().toISOString(),
      },
    ];

    const createdOrder = await prisma.order.create({
      data: {
        orderNumber,
        customerId: customer.id,
        customerName: customer.name || shippingAddress.recipientName || 'Valued Patron',
        customerEmail: customer.email,
        customerPhone: customer.phone || shippingAddress.recipientPhone || null,
        status: 'PAID',
        totalAmount: finalTotal,
        shippingAddress: shippingAddress as any,
        trackingHistory: initialMilestones as any,
        courierPartner: 'Bluedart Apex Air',
        awbNumber: `BD-${crypto.randomInt(10000000, 99999999)}IN`,
        items: {
          create: orderLineItems,
        },
      },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    });

    return res.status(201).json({
      success: true,
      message: 'Order created successfully with simulated instant payment.',
      order: createdOrder,
      trackingUrl: `/track/${createdOrder.orderNumber}`,
    });
  } catch (error) {
    console.error('Failed to create order in DB:', error);
    return res.status(500).json({ error: 'Database failed to create order.' });
  }
}

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

    // Prepare simulated courier details
    const generatedAwb = awbNumber || existing.awbNumber || `BD-${crypto.randomInt(10000000, 99999999)}IN`;
    const selectedCourier = courierPartner || existing.courierPartner || 'Bluedart Apex Air';
    const trackingUrl = `https://www.bluedart.com/tracking?awb=${generatedAwb}`;

    // Append new tracking event to history
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
