import { Request, Response } from 'express';
import crypto from 'crypto';
import { PrismaClient } from '@prisma/client';
import { AuthRequest } from '../middleware/auth.middleware';
import {
  createAndDispatchShipment,
  getShiprocketTracking,
} from '../services/shiprocket.service';

const prisma = new PrismaClient();

/**
 * Public: Create Order (Direct Vault Allocation & Automated Shiprocket Dispatch)
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

    // 4. Initial Logistics Milestone
    const initialMilestones = [
      {
        id: `evt-${Date.now()}`,
        status: 'PAID',
        location: 'Varanasi Master Loom Vault',
        message: 'Order placed & payment verified. Saree piece allocated in luxury tamper-proof trunk.',
        timestamp: new Date().toISOString(),
      },
    ];

    let createdOrder = await prisma.order.create({
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

    // 5. Trigger Automated Shiprocket Order Registration & AWB Generation
    try {
      const shipping = (createdOrder.shippingAddress || {}) as any;
      const dispatchRes = await createAndDispatchShipment({
        orderId: createdOrder.id,
        orderNumber: createdOrder.orderNumber,
        orderDate: createdOrder.createdAt.toISOString(),
        billingCustomerName: createdOrder.customerName || shipping.recipientName || 'Valued Patron',
        billingAddress: shipping.street || 'Master Heritage Road',
        billingCity: shipping.city || 'Varanasi',
        billingPincode: shipping.pincode || '221001',
        billingState: shipping.state || 'Uttar Pradesh',
        billingCountry: shipping.country || 'India',
        billingEmail: createdOrder.customerEmail || 'patron@sutradara.in',
        billingPhone: createdOrder.customerPhone || shipping.recipientPhone || '+91 98765 43210',
        shippingIsBilling: true,
        orderItems: createdOrder.items.map((item) => ({
          name: item.product.name,
          sku: item.product.sku,
          units: item.quantity,
          sellingPrice: item.price,
        })),
        paymentMethod: 'Prepaid',
        subTotal: createdOrder.totalAmount,
      });

      if (dispatchRes.success && dispatchRes.awbNumber) {
        const milestones = (Array.isArray(createdOrder.trackingHistory) ? [...createdOrder.trackingHistory] : []) as any[];
        milestones.unshift({
          id: `evt-${Date.now()}`,
          status: 'SHIPPED',
          location: 'National Logistics Gateway Hub',
          message: `Package registered with ${dispatchRes.courierPartner || 'Shiprocket Air Courier'}. AWB: ${dispatchRes.awbNumber}.`,
          timestamp: new Date().toISOString(),
        });

        createdOrder = await prisma.order.update({
          where: { id: createdOrder.id },
          data: {
            status: 'SHIPPED',
            courierPartner: dispatchRes.courierPartner,
            awbNumber: dispatchRes.awbNumber,
            trackingUrl: dispatchRes.trackingUrl,
            trackingHistory: milestones as any,
          },
          include: {
            items: {
              include: {
                product: true,
              },
            },
          },
        });
      } else if (!dispatchRes.success) {
        console.warn(`Shiprocket automated dispatch notice for ${createdOrder.orderNumber}:`, dispatchRes.error);
      }
    } catch (srErr: any) {
      console.error('Shiprocket automated dispatch notice:', srErr?.message);
    }

    return res.status(201).json({
      success: true,
      message: 'Order created successfully.',
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
    let trackingHistory = (Array.isArray(order.trackingHistory) ? [...order.trackingHistory] : []) as any[];

    // Remove any internal QC events from customer view
    trackingHistory = trackingHistory.filter((e) => e.status !== 'QC_INSPECTED');

    // 🚀 Attempt to fetch real-time carrier scans from Shiprocket API if AWB or order number exists
    if (order.awbNumber || order.orderNumber) {
      try {
        const shiprocketData = await getShiprocketTracking(order.awbNumber || order.orderNumber);
        if (shiprocketData && shiprocketData.activities && shiprocketData.activities.length > 0) {
          liveCourier = shiprocketData.courierPartner || liveCourier;
          liveAwb = shiprocketData.awbNumber || liveAwb;
          liveTrackingUrl = shiprocketData.trackingUrl || liveTrackingUrl;

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
        console.warn('Shiprocket telemetry lookup notice:', srErr);
      }
    }

    if (trackingHistory.length === 0) {
      trackingHistory = [
        {
          id: `evt-paid-${order.id}`,
          status: 'PAID',
          location: 'Varanasi Master Loom Vault',
          message: 'Payment authorized and order confirmed. Artisan piece queued for dispatch.',
          timestamp: new Date(order.createdAt).toISOString(),
        },
      ];
    }

    // Scrub confidential internal inspectionVideoUrl from customer view
    const { inspectionVideoUrl, ...publicOrder } = order as any;

    return res.json({
      order: {
        ...publicOrder,
        courierPartner: liveCourier || order.courierPartner,
        awbNumber: liveAwb || order.awbNumber,
        trackingUrl: liveTrackingUrl || order.trackingUrl,
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
 * Staff / Admin: Update Order Dispatch & Logistics Milestone
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
    const generatedAwb = awbNumber || existing.awbNumber;
    const selectedCourier = courierPartner || existing.courierPartner;
    const trackingUrl = generatedAwb ? `https://shiprocket.co//tracking/${generatedAwb}` : existing.trackingUrl;

    let currentEvents = (Array.isArray(existing.trackingHistory) ? [...existing.trackingHistory] : []) as any[];

    if (customMessage || (status && status !== existing.status)) {
      let defaultMsg = `Order transitioned to ${nextStatus}`;
      let defaultLoc = 'Master Handloom Vault';

      if (nextStatus === 'QC_INSPECTED') {
        defaultMsg = 'Pre-shipment 20s ultra-high-definition video inspection recorded and verified by Master Curator.';
        defaultLoc = 'Varanasi Master Vault';
      } else if (nextStatus === 'DISPATCHED' || nextStatus === 'SHIPPED') {
        defaultMsg = `Air package sealed in luxury heritage trunk and handed over to ${selectedCourier || 'Courier'} (AWB: ${generatedAwb || 'Pending'}).`;
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

    const updated = await prisma.order.update({
      where: { id: existing.id },
      data: {
        status: nextStatus,
        courierPartner: selectedCourier || null,
        awbNumber: generatedAwb && generatedAwb.trim() ? generatedAwb.trim() : null,
        trackingUrl: trackingUrl || null,
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
      message: 'Order dispatch and logistics updated successfully.',
      order: {
        ...updated,
        trackingEvents: currentEvents,
      },
    });
  } catch (error: any) {
    console.error('Failed to update dispatch in DB:', error);
    return res.status(500).json({ error: error?.message || 'Database failed to update dispatch.' });
  }
}
