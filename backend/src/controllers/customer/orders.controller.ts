import { Response } from 'express';
import crypto from 'crypto';
import { PrismaClient } from '@prisma/client';
import { AuthRequest } from '../../middleware/auth.middleware';

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
    // 1. Resolve Customer ID
    let customer = await prisma.customer.findFirst({
      where: {
        OR: [
          { id: req.user.userId },
          { email: req.user.email.toLowerCase() },
        ],
      },
    });

    if (!customer) {
      customer = await prisma.customer.create({
        data: {
          email: req.user.email.toLowerCase(),
          name: req.user.email.split('@')[0],
          isVerified: true,
        },
      });
    }

    // 2. Fetch Products and Recalculate Server Total
    const productIds = items.map((i) => i.productId);
    const dbProducts = await prisma.product.findMany({
      where: { id: { in: productIds } },
    });

    let subtotal = 0;
    const orderLineItems: { productId: string; price: number; quantity: number }[] = [];

    for (const item of items) {
      const p = dbProducts.find((prod) => prod.id === item.productId);
      if (!p) {
        return res.status(404).json({ error: `Saree "${item.productId}" is not available.` });
      }
      if (p.stock < item.quantity) {
        return res.status(400).json({ error: `Insufficient stock for "${p.name}". Only ${p.stock} available.` });
      }

      subtotal += p.sellingPrice * item.quantity;
      orderLineItems.push({
        productId: p.id,
        price: p.sellingPrice,
        quantity: item.quantity,
      });
    }

    // 3. Apply Coupon if valid
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
          await prisma.coupon.update({
            where: { id: coupon.id },
            data: { usedCount: { increment: 1 } },
          });
        }
      }
    }

    const finalTotal = Math.max(0, subtotal - discountAmount);

    // 4. Generate Order Number & 4-Digit Secure Drop OTP
    const orderNumber = `SUT-${new Date().getFullYear()}-${crypto.randomInt(1000, 9999)}`;
    const deliveryOtp = crypto.randomInt(1000, 9999).toString();

    // 5. Initial Milestone Timeline
    const initialMilestones = [
      {
        status: 'PAID',
        location: 'Varanasi Master Loom Vault',
        message: 'Order verified and securely captured. Artisan piece queued for pre-shipment quality inspection.',
        timestamp: new Date().toISOString(),
      },
    ];

    // 6. Create Order in PostgreSQL
    const createdOrder = await prisma.order.create({
      data: {
        orderNumber,
        customerId: customer.id,
        status: 'PAID',
        totalAmount: finalTotal,
        shippingAddress: shippingAddress as any,
        deliveryOtp,
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

    // 7. Decrement Stock in PostgreSQL
    for (const item of items) {
      await prisma.product.update({
        where: { id: item.productId },
        data: { stock: { decrement: item.quantity } },
      });
    }

    return res.json({
      success: true,
      message: 'Your royal order has been successfully placed.',
      order: createdOrder,
      trackingUrl: `/track/${createdOrder.orderNumber}`,
    });
  } catch (error) {
    console.error('Failed to create order in DB:', error);
    return res.status(500).json({ error: 'Database failed to place order.' });
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
      return res.status(404).json({ error: 'Order not found in vault records.' });
    }

    // Scrub confidential internal inspectionVideoUrl from customer view
    const { inspectionVideoUrl, ...publicOrder } = order as any;

    return res.json({ order: publicOrder });
  } catch (error) {
    console.error('Failed to track order:', error);
    return res.status(500).json({ error: 'Database failed to track order.' });
  }
}
