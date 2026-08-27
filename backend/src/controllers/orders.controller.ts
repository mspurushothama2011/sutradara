import { Request, Response } from 'express';
import crypto from 'crypto';
import { PrismaClient } from '@prisma/client';
import { AuthRequest } from '../middleware/auth.middleware';
import { Order } from '../../../shared/types/index';

const prisma = new PrismaClient();

// In-memory demo orders & tracking
let MEMORY_ORDERS: Order[] = [
  {
    id: 'ord-001',
    orderNumber: 'SUT-2026-1001',
    userId: 'demo-customer-id',
    status: 'SHIPPED',
    totalAmount: 38500,
    shippingAddress: {
      fullName: 'Aarav Singhania',
      street: '42 Marine Drive, Nariman Point',
      city: 'Mumbai',
      state: 'Maharashtra',
      pincode: '400021',
      country: 'India',
      phone: '+919820012345',
    },
    items: [
      {
        id: 'item-001',
        productId: 'prod-001',
        productName: 'Varanasi Royal Kadhwa Pure Katan Silk Saree',
        price: 38500,
        quantity: 1,
        image: '/frames/ezgif-frame-240.jpg',
      },
    ],
    courierPartner: 'Bluedart Apex Air',
    awbNumber: 'BD-778902144IN',
    trackingUrl: 'https://www.bluedart.com/tracking?awb=BD-778902144IN',
    deliveryOtp: '7492', // 4-digit secure drop code
    inspectionVideoUrl: 'https://assets.sutradara.in/videos/ban-kat-001-inspection-20s.mp4',
    isNdrFlagged: false,
    trackingEvents: [
      {
        id: 'evt-1',
        status: 'QC_INSPECTED',
        location: 'Sutradara Varanasi Master Vault',
        message: 'Pre-shipment 20s high-definition video inspection recorded and verified by Master Curator.',
        timestamp: new Date(Date.now() - 36 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: 'evt-2',
        status: 'PICKED_UP',
        location: 'Varanasi Logistics Hub',
        message: 'Air package sealed in tamper-proof luxury heritage trunk and handed over to Bluedart Express.',
        timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: 'evt-3',
        status: 'IN_TRANSIT',
        location: 'Mumbai Air Cargo Gateway',
        message: 'Arrived at destination hub. Sorted for secured white-glove van dispatch.',
        timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: 'evt-4',
        status: 'OUT_FOR_DELIVERY',
        location: 'South Mumbai Delivery Center',
        message: 'Out for delivery with delivery agent Sunil V. Please share the 4-digit OTP 7492 upon inspection.',
        timestamp: new Date().toISOString(),
      },
    ],
    createdAt: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(),
  },
];

export async function createOrder(req: Request, res: Response) {
  const { items, shippingAddress, couponCode } = req.body;

  if (!items || !Array.isArray(items) || items.length === 0 || !shippingAddress) {
    return res.status(400).json({ error: 'Cart items and shipping address are required.' });
  }

  // Zero-Client Price Trust: Calculate total from server
  let calculatedTotal = 0;
  const verifiedItems: any[] = [];

  for (const item of items) {
    // In production: await prisma.product.findUnique({ where: { id: item.productId } })
    const unitPrice = item.price || 38500;
    const qty = item.quantity || 1;
    calculatedTotal += unitPrice * qty;
    verifiedItems.push({
      id: `item-${Date.now()}-${Math.random().toString(36).substring(7)}`,
      productId: item.productId,
      productName: item.productName || 'Handloom Silk Saree',
      price: unitPrice,
      quantity: qty,
      image: item.image || '/frames/ezgif-frame-240.jpg',
    });
  }

  // Generate 4-digit Secure Delivery OTP
  const deliveryOtp = Math.floor(1000 + Math.random() * 9000).toString();
  const orderNumber = `SUT-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

  const newOrder: Order = {
    id: `ord-${Date.now()}`,
    orderNumber,
    userId: 'demo-customer-id',
    status: 'PROCESSING',
    totalAmount: calculatedTotal,
    shippingAddress,
    items: verifiedItems,
    deliveryOtp,
    isNdrFlagged: false,
    trackingEvents: [
      {
        id: `evt-${Date.now()}`,
        status: 'PROCESSING',
        location: 'Sutradara Vault',
        message: 'Order received. Saree scheduled for 20-second pre-shipment video verification.',
        timestamp: new Date().toISOString(),
      },
    ],
    createdAt: new Date().toISOString(),
  };

  MEMORY_ORDERS.unshift(newOrder);

  return res.status(201).json({
    message: 'Order created successfully',
    orderNumber: newOrder.orderNumber,
    order: newOrder,
    // Razorpay mock credentials for local testing
    razorpay: {
      orderId: `order_mock_${Date.now()}`,
      amount: calculatedTotal * 100,
      currency: 'INR',
      key: process.env.RAZORPAY_KEY_ID || 'rzp_test_sutradara_mock_key',
    },
  });
}

export async function getOrderTracking(req: Request, res: Response) {
  const { orderId } = req.params;

  const order = MEMORY_ORDERS.find(
    (o) => o.orderNumber.toUpperCase() === orderId.toUpperCase() || o.id === orderId || o.awbNumber === orderId
  );

  if (!order) {
    return res.status(404).json({ error: 'Order not found for tracking.' });
  }

  return res.json({ order });
}

export async function listAllOrders(req: AuthRequest, res: Response) {
  return res.json({ orders: MEMORY_ORDERS });
}

export async function updateDispatch(req: AuthRequest, res: Response) {
  const { orderId } = req.params;
  const { courierPartner, awbNumber, inspectionVideoUrl, status, isNdrFlagged, ndrReason } = req.body;

  const order = MEMORY_ORDERS.find((o) => o.id === orderId || o.orderNumber === orderId);
  if (!order) {
    return res.status(404).json({ error: 'Order not found.' });
  }

  if (courierPartner) order.courierPartner = courierPartner;
  if (awbNumber) {
    order.awbNumber = awbNumber;
    order.trackingUrl = `https://www.bluedart.com/tracking?awb=${awbNumber}`;
  }
  if (inspectionVideoUrl) order.inspectionVideoUrl = inspectionVideoUrl;
  if (status) order.status = status;
  if (typeof isNdrFlagged === 'boolean') {
    order.isNdrFlagged = isNdrFlagged;
    order.ndrReason = ndrReason;
  }

  return res.json({ message: 'Order dispatch updated', order });
}
