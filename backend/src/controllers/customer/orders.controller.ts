import { Response } from 'express';
import crypto from 'crypto';
import { PrismaClient } from '@prisma/client';
import { AuthRequest } from '../../middleware/auth.middleware';
import {
  createRazorpayOrder,
  verifyRazorpaySignature,
  verifyWebhookSignature,
} from '../../services/razorpay.service';
import {
  createAndDispatchShipment,
  getShiprocketTracking,
} from '../../services/shiprocket.service';

const prisma = new PrismaClient();

// In-memory active checkout pessimistic locks for 1-of-1 heirlooms (10 min TTL)
export const HEIRLOOM_LOCKS = new Map<string, { lockedBy: string; expiresAt: number }>();

setInterval(() => {
  const now = Date.now();
  for (const [productId, lock] of HEIRLOOM_LOCKS.entries()) {
    if (now > lock.expiresAt) {
      HEIRLOOM_LOCKS.delete(productId);
    }
  }
}, 60 * 1000);

/**
 * Validate Cart Items against PostgreSQL (Public / Guest Allowed)
 */
export async function validateCart(req: AuthRequest, res: Response) {
  const { items } = req.body as { items: { productId: string; quantity: number }[] };

  if (!items || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: 'Cart is empty.' });
  }

  try {
    const productIds = items.map((i) => i.productId);
    const dbProducts = await prisma.product.findMany({
      where: { id: { in: productIds } },
    });

    const validatedItems: any[] = [];
    let subtotal = 0;

    for (const clientItem of items) {
      const dbProduct = dbProducts.find((p) => p.id === clientItem.productId);
      if (!dbProduct) {
        return res.status(404).json({ error: `Saree with ID ${clientItem.productId} is no longer available in catalog.` });
      }

      if (dbProduct.stock < clientItem.quantity) {
        return res.status(400).json({
          error: `Only ${dbProduct.stock} unit(s) available for "${dbProduct.name}".`,
        });
      }

      if (dbProduct.isHeirloom1of1) {
        const lock = HEIRLOOM_LOCKS.get(dbProduct.id);
        const userId = req.user?.userId || 'guest';
        if (lock && Date.now() < lock.expiresAt && lock.lockedBy !== userId) {
          const remainingSeconds = Math.ceil((lock.expiresAt - Date.now()) / 1000);
          return res.status(409).json({
            error: `"${dbProduct.name}" is a 1-of-1 Heirloom currently in checkout by another customer. Lock expires in ${remainingSeconds}s.`,
            isLocked: true,
            retryAfterSeconds: remainingSeconds,
          });
        }
      }

      const itemPrice = dbProduct.sellingPrice;
      subtotal += itemPrice * clientItem.quantity;

      validatedItems.push({
        id: `val-${dbProduct.id}`,
        productId: dbProduct.id,
        productName: dbProduct.name,
        price: itemPrice,
        quantity: clientItem.quantity,
        image: dbProduct.images[0] || '/frames/ezgif-frame-240.jpg',
      });
    }

    return res.json({
      success: true,
      items: validatedItems,
      subtotal,
      deliveryCharge: 0, // Complimentary insured white-glove shipping
      totalAmount: subtotal,
    });
  } catch (error) {
    console.error('Validate cart DB error:', error);
    return res.status(500).json({ error: 'Failed to validate cart items.' });
  }
}

/**
 * Create Order in PostgreSQL & Acquire 1-of-1 Piece (Authentication Required)
 */
export async function createOrder(req: AuthRequest, res: Response) {
  if (!req.user) {
    return res.status(401).json({ error: 'Customer sign in is required to place an order.' });
  }

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
    const result = await prisma.$transaction(async (tx) => {
      // 1. Resolve Customer ID
      let customer = await tx.customer.findFirst({
        where: {
          OR: [
            { id: req.user!.userId },
            { email: req.user!.email.toLowerCase() },
          ],
        },
      });

      if (!customer) {
        customer = await tx.customer.create({
          data: {
            email: req.user!.email.toLowerCase(),
            name: req.user!.email.split('@')[0],
            isVerified: true,
          },
        });
      }

      // Also save address to customer address book if not already existing
      try {
        const existingAddr = await tx.address.findFirst({
          where: {
            customerId: customer.id,
            street: shippingAddress.street.trim(),
            pincode: shippingAddress.pincode.trim(),
          },
        });
        if (!existingAddr) {
          await tx.address.create({
            data: {
              customerId: customer.id,
              recipientName: shippingAddress.recipientName || customer.name || 'Valued Patron',
              recipientPhone: shippingAddress.recipientPhone || null,
              label: 'Delivery Address',
              landmark: shippingAddress.landmark || null,
              street: shippingAddress.street.trim(),
              city: shippingAddress.city.trim(),
              state: shippingAddress.state.trim(),
              pincode: shippingAddress.pincode.trim(),
              country: shippingAddress.country || 'India',
              isDefault: false,
            },
          });
        }
      } catch (addrErr) {
        console.warn('Address auto-save note:', addrErr);
      }

      // 2. Fetch Products and Check Live Stock inside transaction (Race condition protection)
      const productIds = items.map((i) => i.productId);
      const dbProducts = await tx.product.findMany({
        where: { id: { in: productIds } },
      });

      let subtotal = 0;
      const orderLineItems: { productId: string; price: number; quantity: number }[] = [];

      for (const item of items) {
        const p = dbProducts.find((prod) => prod.id === item.productId);
        if (!p) {
          throw new Error(`Saree "${item.productId}" is no longer available in our collection.`);
        }
        if (p.stock < item.quantity) {
          throw new Error(`STOCK_UNAVAILABLE: "${p.name}" has only ${p.stock} piece(s) available. It was just acquired by another patron.`);
        }

        subtotal += p.sellingPrice * item.quantity;
        orderLineItems.push({
          productId: p.id,
          price: p.sellingPrice,
          quantity: item.quantity,
        });

        // Atomic Stock Decrement
        await tx.product.update({
          where: { id: p.id },
          data: { stock: { decrement: item.quantity } },
        });

        // Release heirloom locks if any
        HEIRLOOM_LOCKS.delete(p.id);
      }

      // 3. Apply Coupon if valid
      let discountAmount = 0;
      if (couponCode) {
        const coupon = await tx.coupon.findUnique({
          where: { code: couponCode.toUpperCase().trim() },
        });
        if (coupon && coupon.isActive && new Date(coupon.validUntil) >= new Date()) {
          if (!coupon.minOrderValue || subtotal >= coupon.minOrderValue) {
            if (coupon.discountType === 'PERCENTAGE') {
              discountAmount = (subtotal * coupon.discountValue) / 100;
              if (coupon.maxDiscount && discountAmount > coupon.maxDiscount) {
                discountAmount = coupon.maxDiscount;
              }
            } else {
              discountAmount = coupon.discountValue;
            }
            await tx.coupon.update({
              where: { id: coupon.id },
              data: { usedCount: { increment: 1 } },
            });
          }
        }
      }

      const finalTotal = Math.max(0, subtotal - discountAmount);

      // 4. Generate Order Number
      const orderNumber = `SUT-${new Date().getFullYear()}-${crypto.randomInt(1000, 9999)}`;

      // 5. Initial Milestone Timeline
      const initialMilestones = [
        {
          status: 'PAID',
          location: 'Varanasi Master Loom Vault',
          message: 'Order verified and securely captured. Artisan piece queued for dispatch.',
          timestamp: new Date().toISOString(),
        },
      ];

      // 6. Create Order in PostgreSQL
      const createdOrder = await tx.order.create({
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

      return { createdOrder };
    });

    let finalOrder = result.createdOrder;

    // Trigger Automated Shiprocket Order Registration & AWB Generation
    try {
      const shipping = (finalOrder.shippingAddress || {}) as any;
      const dispatchRes = await createAndDispatchShipment({
        orderId: finalOrder.id,
        orderNumber: finalOrder.orderNumber,
        orderDate: finalOrder.createdAt.toISOString(),
        billingCustomerName: finalOrder.customerName || shipping.recipientName || 'Valued Patron',
        billingAddress: shipping.street || 'Master Heritage Road',
        billingCity: shipping.city || 'Varanasi',
        billingPincode: shipping.pincode || '221001',
        billingState: shipping.state || 'Uttar Pradesh',
        billingCountry: shipping.country || 'India',
        billingEmail: finalOrder.customerEmail || 'patron@sutradara.in',
        billingPhone: finalOrder.customerPhone || shipping.recipientPhone || '+91 98765 43210',
        shippingIsBilling: true,
        orderItems: finalOrder.items.map((item) => ({
          name: item.product.name,
          sku: item.product.sku,
          units: item.quantity,
          sellingPrice: item.price,
        })),
        paymentMethod: 'Prepaid',
        subTotal: finalOrder.totalAmount,
      });

      if (dispatchRes.success && dispatchRes.awbNumber) {
        const milestones = (Array.isArray(finalOrder.trackingHistory) ? [...finalOrder.trackingHistory] : []) as any[];
        milestones.unshift({
          id: `evt-${Date.now()}`,
          status: 'SHIPPED',
          location: 'National Logistics Gateway Hub',
          message: `Package sealed and registered with ${dispatchRes.courierPartner || 'Shiprocket Courier'}. AWB: ${dispatchRes.awbNumber}.`,
          timestamp: new Date().toISOString(),
        });

        finalOrder = await prisma.order.update({
          where: { id: finalOrder.id },
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
        console.warn(`Shiprocket order registration notice for ${finalOrder.orderNumber}:`, dispatchRes.error);
      }
    } catch (srErr: any) {
      console.error('Shiprocket auto-dispatch notice:', srErr?.message);
    }

    return res.json({
      success: true,
      message: 'Your royal order has been successfully placed.',
      order: finalOrder,
      trackingUrl: `/track/${finalOrder.orderNumber}`,
    });
  } catch (error: any) {
    console.error('Failed to create order in DB:', error);
    const errMsg = error?.message || 'Database failed to place order.';
    if (errMsg.startsWith('STOCK_UNAVAILABLE:')) {
      return res.status(409).json({ error: errMsg.replace('STOCK_UNAVAILABLE:', '').trim(), code: 'OUT_OF_STOCK' });
    }
    return res.status(500).json({ error: errMsg });
  }
}

/**
 * Get Customer's Orders
 */
export async function getCustomerOrders(req: AuthRequest, res: Response) {
  if (!req.user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const customer = await prisma.customer.findFirst({
      where: {
        OR: [
          { id: req.user.userId },
          { email: req.user.email.toLowerCase() },
        ],
      },
    });

    if (!customer) {
      return res.json({ orders: [] });
    }

    const orders = await prisma.order.findMany({
      where: { customerId: customer.id },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return res.json({ orders });
  } catch (error) {
    console.error('Failed to fetch customer orders:', error);
    return res.status(500).json({ error: 'Database failed to fetch orders.' });
  }
}

/**
 * Public Live Delivery Tracking by Order Number or ID
 */
export async function trackOrder(req: any, res: Response) {
  const { orderId } = req.params;

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
        customer: {
          select: {
            id: true,
            name: true,
            email: true,
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
      return res.status(404).json({ error: 'Order not found in vault records.' });
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
        console.warn('Shiprocket customer telemetry lookup notice:', srErr);
      }
    }

    // Default sequential timeline if no external carrier events available yet
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
    console.error('Failed to track order:', error);
    return res.status(500).json({ error: 'Database failed to track order.' });
  }
}

/**
 * Initiate Razorpay Order (Paise calculation, stock reservation check, server-side receipt)
 */
export async function initiateRazorpayOrder(req: AuthRequest, res: Response) {
  if (!req.user) {
    return res.status(401).json({ error: 'Customer sign in is required to initialize payment.' });
  }

  const { items, couponCode } = req.body as {
    items: { productId: string; quantity: number }[];
    couponCode?: string;
  };

  if (!items || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: 'Order must contain at least one saree.' });
  }

  try {
    const productIds = items.map((i) => i.productId);
    const dbProducts = await prisma.product.findMany({
      where: { id: { in: productIds } },
    });

    let subtotal = 0;

    for (const item of items) {
      const p = dbProducts.find((prod) => prod.id === item.productId);
      if (!p) {
        return res.status(404).json({ error: `Saree "${item.productId}" is no longer available in our collection.` });
      }
      if (p.stock < item.quantity) {
        return res.status(409).json({
          error: `"${p.name}" has only ${p.stock} piece(s) remaining. It was just acquired by another patron.`,
          code: 'OUT_OF_STOCK',
        });
      }
      subtotal += p.sellingPrice * item.quantity;
    }

    // Apply Coupon Discount if provided
    let discountAmount = 0;
    if (couponCode) {
      const coupon = await prisma.coupon.findUnique({
        where: { code: couponCode.toUpperCase().trim() },
      });
      if (coupon && coupon.isActive && new Date(coupon.validUntil) >= new Date()) {
        if (!coupon.minOrderValue || subtotal >= coupon.minOrderValue) {
          if (coupon.discountType === 'PERCENTAGE') {
            discountAmount = (subtotal * coupon.discountValue) / 100;
            if (coupon.maxDiscount && discountAmount > coupon.maxDiscount) {
              discountAmount = coupon.maxDiscount;
            }
          } else {
            discountAmount = coupon.discountValue;
          }
        }
      }
    }

    const finalTotal = Math.max(0, subtotal - discountAmount);
    const amountInPaise = Math.round(finalTotal * 100);

    const rzpOrder = await createRazorpayOrder({
      amountInPaise,
      currency: 'INR',
      receipt: `rcpt_${Date.now()}`,
      notes: {
        customerEmail: req.user.email,
        itemCount: String(items.length),
      },
    });

    return res.json({
      success: true,
      razorpayOrderId: rzpOrder.id,
      amount: rzpOrder.amount,
      amountInPaise,
      currency: rzpOrder.currency,
      keyId: rzpOrder.keyId,
      isSimulated: rzpOrder.isSimulated,
      finalTotal,
      subtotal,
      discountAmount,
    });
  } catch (error: any) {
    console.error('Failed to initiate Razorpay order:', error);
    return res.status(500).json({ error: error?.message || 'Failed to initialize payment gateway.' });
  }
}

/**
 * Verify Razorpay Cryptographic Signature, Commit Order & Dispatch via Shiprocket
 */
export async function verifyRazorpayPayment(req: AuthRequest, res: Response) {
  if (!req.user) {
    return res.status(401).json({ error: 'Customer sign in is required to complete order.' });
  }

  const {
    razorpayOrderId,
    razorpayPaymentId,
    razorpaySignature,
    items,
    shippingAddress,
    couponCode,
  } = req.body as {
    razorpayOrderId: string;
    razorpayPaymentId: string;
    razorpaySignature: string;
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

  if (!razorpayOrderId || !razorpayPaymentId || !razorpaySignature) {
    return res.status(400).json({ error: 'Missing payment gateway authorization tokens.' });
  }

  if (!items || items.length === 0) {
    return res.status(400).json({ error: 'No items in order payload.' });
  }

  if (!shippingAddress || !shippingAddress.street || !shippingAddress.pincode) {
    return res.status(400).json({ error: 'Valid delivery address is required.' });
  }

  // 1. Verify Cryptographic Signature
  const verification = verifyRazorpaySignature({
    razorpayOrderId,
    razorpayPaymentId,
    razorpaySignature,
  });

  if (!verification.isValid) {
    console.warn('⚠️ Razorpay signature mismatch for order:', razorpayOrderId);
    return res.status(400).json({ error: 'Invalid payment signature. Transaction unverified.' });
  }

  try {
    const result = await prisma.$transaction(async (tx) => {
      // Resolve or create Customer
      let customer = await tx.customer.findFirst({
        where: {
          OR: [
            { id: req.user!.userId },
            { email: req.user!.email.toLowerCase() },
          ],
        },
      });

      if (!customer) {
        customer = await tx.customer.create({
          data: {
            email: req.user!.email.toLowerCase(),
            name: req.user!.email.split('@')[0],
            isVerified: true,
          },
        });
      }

      // Re-fetch products with row checks and calculate subtotal
      const productIds = items.map((i) => i.productId);
      const dbProducts = await tx.product.findMany({
        where: { id: { in: productIds } },
      });

      let subtotal = 0;
      const orderLineItems: { productId: string; price: number; quantity: number }[] = [];

      for (const item of items) {
        const p = dbProducts.find((prod) => prod.id === item.productId);
        if (!p) {
          throw new Error(`Saree "${item.productId}" is no longer available in our collection.`);
        }
        if (p.stock < item.quantity) {
          throw new Error(`STOCK_UNAVAILABLE: "${p.name}" has only ${p.stock} piece(s) available. It was just acquired by another patron.`);
        }

        subtotal += p.sellingPrice * item.quantity;
        orderLineItems.push({
          productId: p.id,
          price: p.sellingPrice,
          quantity: item.quantity,
        });

        // Atomic stock decrement
        await tx.product.update({
          where: { id: p.id },
          data: { stock: { decrement: item.quantity } },
        });

        HEIRLOOM_LOCKS.delete(p.id);
      }

      // Apply coupon if valid
      let discountAmount = 0;
      if (couponCode) {
        const coupon = await tx.coupon.findUnique({
          where: { code: couponCode.toUpperCase().trim() },
        });
        if (coupon && coupon.isActive && new Date(coupon.validUntil) >= new Date()) {
          if (!coupon.minOrderValue || subtotal >= coupon.minOrderValue) {
            if (coupon.discountType === 'PERCENTAGE') {
              discountAmount = (subtotal * coupon.discountValue) / 100;
              if (coupon.maxDiscount && discountAmount > coupon.maxDiscount) {
                discountAmount = coupon.maxDiscount;
              }
            } else {
              discountAmount = coupon.discountValue;
            }
            await tx.coupon.update({
              where: { id: coupon.id },
              data: { usedCount: { increment: 1 } },
            });
          }
        }
      }

      const finalTotal = Math.max(0, subtotal - discountAmount);
      const orderNumber = `SUT-${new Date().getFullYear()}-${crypto.randomInt(1000, 9999)}`;

      const initialMilestones = [
        {
          status: 'PAID',
          location: 'Varanasi Master Loom Vault',
          message: `Payment authorized via Razorpay (${razorpayPaymentId}). Artisan piece queued for dispatch.`,
          timestamp: new Date().toISOString(),
        },
      ];

      // Create Order in PostgreSQL
      const createdOrder = await tx.order.create({
        data: {
          orderNumber,
          customerId: customer.id,
          customerName: customer.name || shippingAddress.recipientName || 'Valued Patron',
          customerEmail: customer.email,
          customerPhone: customer.phone || shippingAddress.recipientPhone || null,
          status: 'PAID',
          totalAmount: finalTotal,
          shippingAddress: shippingAddress as any,
          razorpayOrderId,
          razorpayPaymentId,
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

      return { createdOrder };
    });

    let finalOrder = result.createdOrder;

    // 🚀 Automated Shiprocket Order Creation & AWB Assignment
    try {
      const shipping = (finalOrder.shippingAddress || {}) as any;
      const dispatchRes = await createAndDispatchShipment({
        orderId: finalOrder.id,
        orderNumber: finalOrder.orderNumber,
        orderDate: finalOrder.createdAt.toISOString(),
        billingCustomerName: finalOrder.customerName || shipping.recipientName || 'Valued Patron',
        billingAddress: shipping.street || 'Master Heritage Road',
        billingCity: shipping.city || 'Varanasi',
        billingPincode: shipping.pincode || '221001',
        billingState: shipping.state || 'Uttar Pradesh',
        billingCountry: shipping.country || 'India',
        billingEmail: finalOrder.customerEmail || 'patron@sutradara.in',
        billingPhone: finalOrder.customerPhone || shipping.recipientPhone || '+91 98765 43210',
        shippingIsBilling: true,
        orderItems: finalOrder.items.map((item) => ({
          name: item.product.name,
          sku: item.product.sku,
          units: item.quantity,
          sellingPrice: item.price,
        })),
        paymentMethod: 'Prepaid',
        subTotal: finalOrder.totalAmount,
      });

      if (dispatchRes.success && dispatchRes.awbNumber) {
        const milestones = (Array.isArray(finalOrder.trackingHistory) ? [...finalOrder.trackingHistory] : []) as any[];
        milestones.unshift({
          id: `evt-${Date.now()}`,
          status: 'SHIPPED',
          location: 'National Logistics Gateway Hub',
          message: `Shipment registered with ${dispatchRes.courierPartner || 'Shiprocket Air Courier'}. AWB: ${dispatchRes.awbNumber}.`,
          timestamp: new Date().toISOString(),
        });

        finalOrder = await prisma.order.update({
          where: { id: finalOrder.id },
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
        console.warn(`Shiprocket automated dispatch notice for ${finalOrder.orderNumber}:`, dispatchRes.error);
      }
    } catch (dispatchErr: any) {
      console.error('Shiprocket automated dispatch error:', dispatchErr?.message);
    }

    return res.json({
      success: true,
      message: 'Payment verified and royal order placed successfully.',
      order: finalOrder,
      trackingUrl: `/track/${finalOrder.orderNumber}`,
    });
  } catch (error: any) {
    console.error('Failed to verify and create order in DB:', error);
    const errMsg = error?.message || 'Database failed to record payment.';
    if (errMsg.startsWith('STOCK_UNAVAILABLE:')) {
      return res.status(409).json({ error: errMsg.replace('STOCK_UNAVAILABLE:', '').trim(), code: 'OUT_OF_STOCK' });
    }
    return res.status(500).json({ error: errMsg });
  }
}

/**
 * Razorpay Webhook Listener for Asynchronous Payment Confirmations
 */
export async function handleRazorpayWebhook(req: any, res: Response) {
  const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
  const signature = req.headers['x-razorpay-signature'] as string;

  if (webhookSecret && signature) {
    const rawBody = typeof req.body === 'string' ? req.body : JSON.stringify(req.body);
    const isValid = verifyWebhookSignature(rawBody, signature, webhookSecret);
    if (!isValid) {
      return res.status(400).json({ error: 'Invalid webhook signature.' });
    }
  }

  const event = req.body?.event;
  const payload = req.body?.payload;

  if (event === 'payment.captured' || event === 'order.paid') {
    const rzpOrderId = payload?.payment?.entity?.order_id || payload?.order?.entity?.id;
    const rzpPaymentId = payload?.payment?.entity?.id;

    if (rzpOrderId) {
      try {
        const order = await prisma.order.findFirst({
          where: { razorpayOrderId: rzpOrderId },
          include: {
            items: {
              include: {
                product: true,
              },
            },
          },
        });

        if (order) {
          await prisma.order.update({
            where: { id: order.id },
            data: {
              status: 'PAID',
              razorpayPaymentId: rzpPaymentId || order.razorpayPaymentId || undefined,
            },
          });

          // If not yet dispatched to Shiprocket, trigger idempotent dispatch
          if (!order.awbNumber) {
            try {
              const shipping = (order.shippingAddress || {}) as any;
              const dispatchRes = await createAndDispatchShipment({
                orderId: order.id,
                orderNumber: order.orderNumber,
                orderDate: order.createdAt.toISOString(),
                billingCustomerName: order.customerName || shipping.recipientName || 'Valued Patron',
                billingAddress: shipping.street || 'Master Heritage Road',
                billingCity: shipping.city || 'Varanasi',
                billingPincode: shipping.pincode || '221001',
                billingState: shipping.state || 'Uttar Pradesh',
                billingCountry: shipping.country || 'India',
                billingEmail: order.customerEmail || 'patron@sutradara.in',
                billingPhone: order.customerPhone || shipping.recipientPhone || '+91 98765 43210',
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

              if (dispatchRes.success && dispatchRes.awbNumber) {
                const milestones = (Array.isArray(order.trackingHistory) ? [...order.trackingHistory] : []) as any[];
                milestones.unshift({
                  id: `evt-${Date.now()}`,
                  status: 'SHIPPED',
                  location: 'National Logistics Gateway Hub',
                  message: `Shipment registered with ${dispatchRes.courierPartner || 'Shiprocket Air Courier'}. AWB: ${dispatchRes.awbNumber}.`,
                  timestamp: new Date().toISOString(),
                });

                await prisma.order.update({
                  where: { id: order.id },
                  data: {
                    status: 'SHIPPED',
                    courierPartner: dispatchRes.courierPartner,
                    awbNumber: dispatchRes.awbNumber,
                    trackingUrl: dispatchRes.trackingUrl,
                    trackingHistory: milestones as any,
                  },
                });
              }
            } catch (srErr: any) {
              console.warn('Shiprocket webhook auto-dispatch notice:', srErr?.message);
            }
          }
        }
      } catch (e) {
        console.error('Webhook order update notice:', e);
      }
    }
  }

  return res.json({ status: 'ok', received: true });
}
