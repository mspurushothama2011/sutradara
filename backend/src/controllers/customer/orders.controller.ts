import { Response } from 'express';
import crypto from 'crypto';
import { AuthRequest } from '../../middleware/auth.middleware';
import { Order, OrderItem, ShippingAddress, Product } from '../../../../shared/types/index';

export const HEIRLOOM_LOCKS = new Map<string, { lockedBy: string; expiresAt: number }>();

setInterval(() => {
  const now = Date.now();
  for (const [productId, lock] of HEIRLOOM_LOCKS.entries()) {
    if (now > lock.expiresAt) {
      HEIRLOOM_LOCKS.delete(productId);
    }
  }
}, 60 * 1000);

export let MEMORY_PRODUCTS: Product[] = [
  {
    id: 'prod-001',
    sku: 'BAN-KAT-001',
    name: 'Varanasi Royal Kadhwa Pure Katan Silk',
    slug: 'varanasi-royal-kadhwa-pure-katan-silk-saree',
    description: 'Directly sourced from the master weaver guild of Varanasi. 100% pure mulberry katan silk with pure gold zari shikargah motifs.',
    sellingPrice: 38500,
    comparePrice: 48000,
    costPrice: 24000,
    stock: 1,
    isHeirloom1of1: true,
    fabric: 'Pure Katan Silk',
    zariType: 'Pure Gold Zari',
    craftRegion: 'Varanasi',
    weaveStyle: 'Kadhwa Weave',
    silkMarkNumber: 'SM-IN-2026-8891',
    isFeatured: true,
    isDealOfDay: true,
    tags: ['Heirloom', 'Varanasi', 'Kadhwa', 'Silk Mark'],
    images: ['/frames/ezgif-frame-240.jpg'],
    createdAt: new Date().toISOString(),
  },
  {
    id: 'prod-002',
    sku: 'KAN-KOR-002',
    name: 'Kanchipuram Temple Border Korvai Silk',
    slug: 'kanchipuram-temple-border-korvai-silk-saree',
    description: 'Traditional heavy 3-ply mulberry silk with interlocking Korvai border in tested antique gold zari.',
    sellingPrice: 42000,
    comparePrice: 52000,
    costPrice: 27000,
    stock: 2,
    isHeirloom1of1: false,
    fabric: 'Kanjivaram Silk',
    zariType: 'Tested Gold Zari',
    craftRegion: 'Kanchipuram',
    weaveStyle: 'Korvai Interlock',
    silkMarkNumber: 'SM-IN-2026-9402',
    isFeatured: true,
    isDealOfDay: false,
    tags: ['Kanchipuram', 'Bridal', 'Silk Mark'],
    images: ['/frames/ezgif-frame-180.jpg'],
    createdAt: new Date().toISOString(),
  },
  {
    id: 'prod-003',
    sku: 'YEO-PAI-003',
    name: 'Yeola Muniya Border Tapestry Paithani',
    slug: 'yeola-muniya-border-pure-paithani-silk-saree',
    description: 'Exquisite oblique square border with handwoven kaleidoscope peacock pallu in antique copper zari.',
    sellingPrice: 34500,
    comparePrice: 41000,
    costPrice: 21000,
    stock: 1,
    isHeirloom1of1: true,
    fabric: 'Paithani Silk',
    zariType: 'Antique Copper Zari',
    craftRegion: 'Yeola',
    weaveStyle: 'Tapestry Weave',
    silkMarkNumber: 'SM-IN-2026-7731',
    isFeatured: false,
    isDealOfDay: false,
    tags: ['Paithani', 'Heirloom', 'Yeola'],
    images: ['/frames/ezgif-frame-150.jpg'],
    createdAt: new Date().toISOString(),
  },
];

export let MEMORY_ORDERS: Order[] = [
  {
    id: 'ord-001',
    orderNumber: 'SUT-2026-1001',
    userId: 'demo-customer-id',
    status: 'SHIPPED',
    totalAmount: 38500,
    shippingAddress: {
      fullName: 'Ananya Deshmukh',
      phone: '+91 98201 54321',
      street: '14, Altamount Road, Cumballa Hill',
      city: 'Mumbai',
      state: 'Maharashtra',
      pincode: '400026',
      country: 'India',
    },
    courierPartner: 'Bluedart Apex Air',
    awbNumber: 'BD-778902144IN',
    trackingUrl: 'https://www.bluedart.com/tracking/BD-778902144IN',
    deliveryOtp: '7492',
    inspectionVideoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    isNdrFlagged: false,
    items: [
      {
        id: 'item-001',
        productId: 'prod-001',
        productName: 'Varanasi Royal Kadhwa Pure Katan Silk',
        price: 38500,
        quantity: 1,
        image: '/frames/ezgif-frame-240.jpg',
      },
    ],
    trackingEvents: [
      {
        id: 'trk-1',
        status: 'VAULT_INSPECTION_PASSED',
        location: 'Varanasi Central Vault',
        message: 'Master Curator verified Silk Mark & 2G Gold Zari. 20-second video recorded.',
        timestamp: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: 'trk-2',
        status: 'HANDED_TO_CARRIER',
        location: 'Varanasi Airport Hub',
        message: 'Heritage trunk handed to Bluedart Apex Air (AWB: BD-778902144IN).',
        timestamp: new Date(Date.now() - 36 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: 'trk-3',
        status: 'OUT_FOR_DELIVERY',
        location: 'South Mumbai Delivery Center',
        message: 'Out for white-glove delivery. Keep your 4-digit Secure Drop OTP ready.',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      },
    ],
    createdAt: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(),
  },
];

export async function validateCart(req: AuthRequest, res: Response) {
  const { items } = req.body as { items: { productId: string; quantity: number }[] };

  if (!items || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: 'Cart is empty.' });
  }

  const validatedItems: OrderItem[] = [];
  let subtotal = 0;

  for (const clientItem of items) {
    const dbProduct = MEMORY_PRODUCTS.find((p) => p.id === clientItem.productId);
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
    deliveryCharge: subtotal >= 10000 ? 0 : 500,
    totalAmount: subtotal >= 10000 ? subtotal : subtotal + 500,
  });
}

export async function createOrder(req: AuthRequest, res: Response) {
  if (!req.user) {
    return res.status(401).json({ error: 'Customer login is required to place an order.' });
  }

  const { items, shippingAddress, couponCode } = req.body as {
    items: { productId: string; quantity: number }[];
    shippingAddress: ShippingAddress;
    couponCode?: string;
  };

  if (!items || items.length === 0) {
    return res.status(400).json({ error: 'Order must contain at least one saree.' });
  }

  if (!shippingAddress || !shippingAddress.street || !shippingAddress.pincode) {
    return res.status(400).json({ error: 'Valid delivery address with 6-digit PIN code is required.' });
  }

  if (!/^[1-9][0-9]{5}$/.test(shippingAddress.pincode.trim())) {
    return res.status(400).json({ error: 'Invalid 6-digit Indian delivery PIN code.' });
  }

  const now = Date.now();
  let serverCalculatedSubtotal = 0;
  const orderItems: OrderItem[] = [];

  for (const item of items) {
    const product = MEMORY_PRODUCTS.find((p) => p.id === item.productId);
    if (!product || product.stock < item.quantity) {
      return res.status(400).json({ error: `Saree "${product?.name || item.productId}" is currently out of stock.` });
    }

    if (product.isHeirloom1of1) {
      const lock = HEIRLOOM_LOCKS.get(product.id);
      if (lock && now < lock.expiresAt && lock.lockedBy !== req.user.userId) {
        return res.status(409).json({
          error: `"${product.name}" is currently reserved in checkout by another customer. Please try again shortly.`,
        });
      }
      HEIRLOOM_LOCKS.set(product.id, {
        lockedBy: req.user.userId,
        expiresAt: now + 10 * 60 * 1000,
      });
    }

    serverCalculatedSubtotal += product.sellingPrice * item.quantity;
    orderItems.push({
      id: `item-${crypto.randomBytes(4).toString('hex')}`,
      productId: product.id,
      productName: product.name,
      price: product.sellingPrice,
      quantity: item.quantity,
      image: product.images[0] || '/frames/ezgif-frame-240.jpg',
    });
  }

  let discount = 0;
  if (couponCode && couponCode.toUpperCase() === 'VIRASAT10' && serverCalculatedSubtotal >= 25000) {
    discount = Math.round(serverCalculatedSubtotal * 0.1);
  }

  const finalAmount = Math.max(0, serverCalculatedSubtotal - discount);
  const deliveryOtp = crypto.randomInt(1000, 9999).toString();
  const orderNumber = `SUT-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

  const newOrder: Order = {
    id: `ord-${crypto.randomBytes(6).toString('hex')}`,
    orderNumber,
    userId: req.user.userId,
    status: 'PAID',
    totalAmount: finalAmount,
    shippingAddress,
    deliveryOtp,
    isNdrFlagged: false,
    items: orderItems,
    trackingEvents: [
      {
        id: `trk-${Date.now()}`,
        status: 'ORDER_PLACED_AND_AUTHENTICATED',
        location: 'Sutradara Heritage Vault',
        message: 'Order confirmed and reserved. Moving to Quality Inspection.',
        timestamp: new Date().toISOString(),
      },
    ],
    createdAt: new Date().toISOString(),
  };

  for (const item of items) {
    const product = MEMORY_PRODUCTS.find((p) => p.id === item.productId);
    if (product) {
      product.stock = Math.max(0, product.stock - item.quantity);
      HEIRLOOM_LOCKS.delete(product.id);
    }
  }

  MEMORY_ORDERS.unshift(newOrder);

  return res.json({
    success: true,
    order: newOrder,
    deliveryOtp,
    message: 'Order placed securely with Zero-Client-Price Trust validation.',
  });
}

export async function getCustomerOrders(req: AuthRequest, res: Response) {
  if (!req.user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const userOrders = MEMORY_ORDERS.filter(
    (o) => o.userId === req.user?.userId || req.user?.email === 'customer@sutradara.in'
  );

  return res.json({ orders: userOrders });
}

export async function trackOrder(req: AuthRequest, res: Response) {
  const { orderId } = req.params;
  const order = MEMORY_ORDERS.find((o) => o.id === orderId || o.orderNumber === orderId);

  if (!order) {
    return res.status(404).json({ error: 'Order not found in Sutradara delivery registry.' });
  }

  return res.json({ order });
}
