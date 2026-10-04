import crypto from 'crypto';

interface ShiprocketTokenCache {
  token: string | null;
  expiresAt: number;
}

const TOKEN_CACHE: ShiprocketTokenCache = {
  token: null,
  expiresAt: 0,
};

// 60-second in-memory rate-limit cache for live carrier tracking queries
const TRACKING_CACHE = new Map<string, { data: any; expiresAt: number }>();

// Periodic cleanup of expired tracking cache entries
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of TRACKING_CACHE.entries()) {
    if (now > entry.expiresAt) {
      TRACKING_CACHE.delete(key);
    }
  }
}, 60 * 1000);

const BASE_URL = 'https://apiv2.shiprocket.in/v1/external';

/**
 * Obtain or reuse cached Shiprocket JWT authentication token
 */
export async function getShiprocketAuthToken(): Promise<string | null> {
  const email = process.env.SHIPROCKET_EMAIL;
  const password = process.env.SHIPROCKET_PASSWORD;

  if (!email || !password) {
    console.warn('⚠️ Shiprocket credentials (SHIPROCKET_EMAIL, SHIPROCKET_PASSWORD) are not set in environment.');
    return null;
  }

  if (TOKEN_CACHE.token && Date.now() < TOKEN_CACHE.expiresAt) {
    return TOKEN_CACHE.token;
  }

  try {
    const res = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    const data: any = await res.json();

    if (data?.token) {
      TOKEN_CACHE.token = data.token;
      // Tokens are valid for 10 days; refresh after 8 days
      TOKEN_CACHE.expiresAt = Date.now() + 8 * 24 * 60 * 60 * 1000;
      return TOKEN_CACHE.token;
    } else {
      console.error('Shiprocket authentication failed:', data?.message || data?.error || 'Invalid credentials');
    }
  } catch (err: any) {
    console.error('Shiprocket authentication request error:', err?.message);
  }

  return null;
}

export interface CreateShipmentParams {
  orderId: string;
  orderNumber: string;
  orderDate: string;
  channelId?: string;
  pickupLocation?: string;
  billingCustomerName: string;
  billingLastName?: string;
  billingAddress: string;
  billingCity: string;
  billingPincode: string;
  billingState: string;
  billingCountry?: string;
  billingEmail: string;
  billingPhone: string;
  shippingIsBilling: boolean;
  orderItems: {
    name: string;
    sku: string;
    units: number;
    sellingPrice: number;
  }[];
  paymentMethod: 'Prepaid' | 'COD';
  subTotal: number;
  length?: number;
  breadth?: number;
  height?: number;
  weight?: number;
}

export interface DispatchResult {
  success: boolean;
  shipmentId?: string;
  orderId: string;
  awbNumber?: string;
  courierPartner?: string;
  trackingUrl?: string;
  labelUrl?: string;
  error?: string;
}

/**
 * Create Order, Assign Courier & Generate AWB in Shiprocket Production API
 */
export async function createAndDispatchShipment(params: CreateShipmentParams): Promise<DispatchResult> {
  const token = await getShiprocketAuthToken();

  if (!token) {
    return {
      success: false,
      orderId: params.orderNumber,
      error: 'Shiprocket authentication unavailable. Verify SHIPROCKET_EMAIL and SHIPROCKET_PASSWORD in environment.',
    };
  }

  try {
    const pickupLocation = process.env.SHIPROCKET_PICKUP_LOCATION || params.pickupLocation || 'Primary';

    // 1. Create Adhoc Order in Shiprocket
    const payload = {
      order_id: params.orderNumber,
      order_date: params.orderDate,
      pickup_location: pickupLocation,
      billing_customer_name: params.billingCustomerName,
      billing_last_name: params.billingLastName || '',
      billing_address: params.billingAddress,
      billing_city: params.billingCity,
      billing_pincode: params.billingPincode,
      billing_state: params.billingState,
      billing_country: params.billingCountry || 'India',
      billing_email: params.billingEmail,
      billing_phone: params.billingPhone,
      shipping_is_billing: true,
      order_items: params.orderItems.map((item) => ({
        name: item.name,
        sku: item.sku,
        units: item.units,
        selling_price: item.sellingPrice,
      })),
      payment_method: params.paymentMethod,
      sub_total: params.subTotal,
      length: params.length || 35,
      breadth: params.breadth || 25,
      height: params.height || 6,
      weight: params.weight || 1.0,
    };

    const orderRes = await fetch(`${BASE_URL}/orders/create/adhoc`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });

    const orderData: any = await orderRes.json();
    const shipmentId = orderData?.shipment_id || orderData?.order_id;

    if (!shipmentId) {
      const errMsg = orderData?.message || orderData?.error || 'Failed to create order in Shiprocket';
      console.error('Shiprocket order creation error:', errMsg, orderData);
      return {
        success: false,
        orderId: params.orderNumber,
        error: errMsg,
      };
    }

    // 2. Automatically Assign Courier & Generate AWB
    let awbNumber: string | undefined;
    let courierPartner: string = 'Shiprocket Air Express';

    try {
      const awbRes = await fetch(`${BASE_URL}/courier/assign/awb`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ shipment_id: shipmentId }),
      });
      const awbData: any = await awbRes.json();
      if (awbData?.response?.data?.awb_code) {
        awbNumber = awbData.response.data.awb_code;
        courierPartner = awbData.response.data.courier_name || courierPartner;
      } else if (awbData?.awb_code) {
        awbNumber = awbData.awb_code;
        courierPartner = awbData.courier_name || courierPartner;
      }
    } catch (awbErr: any) {
      console.warn('AWB assign warning:', awbErr?.message);
    }

    // 3. Generate Printable Shipping Label URL
    let labelUrl: string | undefined;
    try {
      const labelRes = await fetch(`${BASE_URL}/courier/generate/label`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ shipment_id: [shipmentId] }),
      });
      const labelData: any = await labelRes.json();
      labelUrl = labelData?.label_url;
    } catch (lblErr: any) {
      console.warn('Shipping label generation warning:', lblErr?.message);
    }

    return {
      success: true,
      shipmentId: String(shipmentId),
      orderId: params.orderNumber,
      awbNumber,
      courierPartner,
      trackingUrl: awbNumber ? `https://shiprocket.co//tracking/${awbNumber}` : undefined,
      labelUrl,
    };
  } catch (error: any) {
    console.error('Shiprocket dispatch API error:', error?.message);
    return {
      success: false,
      orderId: params.orderNumber,
      error: error?.message || 'Shiprocket API connection failed.',
    };
  }
}

/**
 * Fetch Live Real-Time Tracking Telemetry directly from Shiprocket Carrier API
 * (with 60-second in-memory rate-limit cache)
 */
export async function getShiprocketTracking(awbOrOrderNumber: string): Promise<{
  success: boolean;
  courierPartner?: string;
  awbNumber?: string;
  currentStatus?: string;
  trackingUrl?: string;
  activities?: {
    id?: string;
    status: string;
    location: string;
    message: string;
    timestamp: string;
  }[];
} | null> {
  if (!awbOrOrderNumber) return null;

  const cleanQuery = awbOrOrderNumber.trim();
  const cached = TRACKING_CACHE.get(cleanQuery);
  if (cached && Date.now() < cached.expiresAt) {
    return cached.data;
  }

  const token = await getShiprocketAuthToken();
  if (!token) {
    return null;
  }

  try {
    let res = await fetch(`${BASE_URL}/courier/track/awb/${encodeURIComponent(cleanQuery)}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });

    let data: any = await res.json().catch(() => ({}));

    // Fallback search by Order ID if not found by AWB
    if (!data?.tracking_data?.track_status) {
      res = await fetch(`${BASE_URL}/courier/track?order_id=${encodeURIComponent(cleanQuery)}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });
      data = await res.json().catch(() => ({}));
    }

    const trackData = data?.tracking_data;
    if (!trackData || !trackData.track_status) {
      return null;
    }

    const trackHeader = Array.isArray(trackData.shipment_track) ? trackData.shipment_track[0] : null;
    const rawActivities = Array.isArray(trackData.shipment_track_activities) ? trackData.shipment_track_activities : [];

    const normalizedActivities = rawActivities.map((act: any, idx: number) => {
      let rawStatus = String(act.status || act.activity || act['sr-status'] || '').toUpperCase();
      let status = 'IN_TRANSIT';

      if (rawStatus.includes('DELIVERED')) {
        status = 'DELIVERED';
      } else if (rawStatus.includes('OUT FOR DELIVER')) {
        status = 'OUT_FOR_DELIVERY';
      } else if (rawStatus.includes('PICK') || rawStatus.includes('DISPATCH') || rawStatus.includes('SHIPPED')) {
        status = 'SHIPPED';
      }

      return {
        id: `sr-${act.id || idx}-${Date.now()}`,
        status,
        location: act.location || 'Logistics Gateway Hub',
        message: act.activity || act.status || 'Package in transit with carrier.',
        timestamp: act.date ? new Date(act.date).toISOString() : new Date().toISOString(),
      };
    });

    const result = {
      success: true,
      courierPartner: trackHeader?.courier_name || 'Shiprocket Air Express',
      awbNumber: trackHeader?.awb_code || cleanQuery,
      currentStatus: trackHeader?.current_status,
      trackingUrl: `https://shiprocket.co//tracking/${cleanQuery}`,
      activities: normalizedActivities,
    };

    // Cache for 60 seconds
    TRACKING_CACHE.set(cleanQuery, {
      data: result,
      expiresAt: Date.now() + 60 * 1000,
    });

    return result;
  } catch (err: any) {
    console.warn('Shiprocket live telemetry lookup notice:', err?.message);
    return null;
  }
}
