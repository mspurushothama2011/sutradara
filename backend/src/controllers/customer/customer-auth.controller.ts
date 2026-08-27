import { Request, Response } from 'express';
import crypto from 'crypto';
import { signAccessToken, signRefreshToken } from '../../utils/jwt';
import { AuthRequest } from '../../middleware/auth.middleware';
import { User, ShippingAddress } from '../../../../shared/types/index';

interface OtpRecord {
  code: string;
  expiresAt: number;
  attempts: number;
}

// In-memory OTP storage: email -> OtpRecord
const OTP_STORE = new Map<string, OtpRecord>();

// In-memory Customer store with addresses
export const CUSTOMER_STORE = new Map<string, { user: User; addresses: ShippingAddress[] }>();

// Pre-populate with demo customer
CUSTOMER_STORE.set('customer@sutradara.in', {
  user: {
    id: 'demo-customer-id',
    email: 'customer@sutradara.in',
    name: 'Ananya Deshmukh',
    phone: '+91 98201 54321',
    role: 'CUSTOMER',
    customPermissions: [],
    createdAt: new Date().toISOString(),
  },
  addresses: [
    {
      fullName: 'Ananya Deshmukh',
      phone: '+91 98201 54321',
      street: '14, Altamount Road, Cumballa Hill',
      city: 'Mumbai',
      state: 'Maharashtra',
      pincode: '400026',
      country: 'India',
    },
  ],
});

/**
 * Send 6-Digit Email OTP with 5-minute TTL
 */
export async function sendEmailOtp(req: Request, res: Response) {
  const { email } = req.body;

  if (!email || !email.includes('@') || !email.includes('.')) {
    return res.status(400).json({ error: 'Please enter a valid email address.' });
  }

  const normalizedEmail = email.toLowerCase().trim();

  // Generate cryptographically secure 6-digit numeric OTP
  const otp = crypto.randomInt(100000, 999999).toString();
  const expiresAt = Date.now() + 5 * 60 * 1000; // 5 minutes

  OTP_STORE.set(normalizedEmail, {
    code: otp,
    expiresAt,
    attempts: 0,
  });

  console.log(`\n======================================================`);
  console.log(`✉️ [SUTRADARA EMAIL OTP] To: ${normalizedEmail}`);
  console.log(`🔑 Verification Code: ${otp} (Valid for 5 minutes)`);
  console.log(`======================================================\n`);

  return res.json({
    success: true,
    message: `A 6-digit verification code has been sent to ${normalizedEmail}`,
    devOtp: process.env.NODE_ENV !== 'production' ? otp : undefined,
  });
}

/**
 * Verify Email OTP and Sign In / Register Customer
 */
export async function verifyEmailOtp(req: Request, res: Response) {
  const { email, otp, name, phone } = req.body;

  if (!email || !otp) {
    return res.status(400).json({ error: 'Email and 6-digit OTP code are required.' });
  }

  const normalizedEmail = email.toLowerCase().trim();
  const record = OTP_STORE.get(normalizedEmail);

  if (!record) {
    return res.status(400).json({ error: 'No OTP requested for this email or OTP expired. Please request a new code.' });
  }

  if (Date.now() > record.expiresAt) {
    OTP_STORE.delete(normalizedEmail);
    return res.status(400).json({ error: 'OTP has expired. Please request a fresh code.' });
  }

  record.attempts += 1;
  if (record.attempts > 4) {
    OTP_STORE.delete(normalizedEmail);
    return res.status(429).json({ error: 'Too many incorrect attempts. Please request a new OTP.' });
  }

  if (record.code !== otp.trim()) {
    return res.status(400).json({
      error: `Invalid verification code. ${4 - record.attempts} attempts remaining.`,
    });
  }

  OTP_STORE.delete(normalizedEmail);

  let customerData = CUSTOMER_STORE.get(normalizedEmail);
  if (!customerData) {
    const newUser: User = {
      id: `cust-${crypto.randomBytes(6).toString('hex')}`,
      email: normalizedEmail,
      name: name || normalizedEmail.split('@')[0],
      phone: phone || '',
      role: 'CUSTOMER',
      customPermissions: [],
      createdAt: new Date().toISOString(),
    };
    customerData = { user: newUser, addresses: [] };
    CUSTOMER_STORE.set(normalizedEmail, customerData);
  }

  const accessToken = signAccessToken({
    userId: customerData.user.id,
    email: customerData.user.email,
    role: customerData.user.role,
    capabilities: customerData.user.customPermissions,
  });

  const refreshToken = signRefreshToken({
    userId: customerData.user.id,
    email: customerData.user.email,
    role: customerData.user.role,
    capabilities: customerData.user.customPermissions,
  });

  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  return res.json({
    success: true,
    user: customerData.user,
    accessToken,
    addresses: customerData.addresses,
  });
}

/**
 * Get Customer Profile & Saved Addresses
 */
export async function getCustomerProfile(req: AuthRequest, res: Response) {
  if (!req.user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const customerData = CUSTOMER_STORE.get(req.user.email.toLowerCase()) || {
    user: {
      id: req.user.userId,
      email: req.user.email,
      name: req.user.email.split('@')[0],
      role: req.user.role,
      customPermissions: req.user.capabilities as any,
      createdAt: new Date().toISOString(),
    },
    addresses: [] as ShippingAddress[],
  };

  return res.json({
    user: customerData.user,
    addresses: customerData.addresses,
  });
}

/**
 * Save / Update Delivery Address
 */
export async function saveCustomerAddress(req: AuthRequest, res: Response) {
  if (!req.user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const { fullName, phone, street, city, state, pincode, country } = req.body;

  if (!pincode || !/^[1-9][0-9]{5}$/.test(pincode.trim())) {
    return res.status(400).json({ error: 'Please enter a valid 6-digit Indian PIN code.' });
  }

  let customerData = CUSTOMER_STORE.get(req.user.email.toLowerCase());
  if (!customerData) {
    customerData = {
      user: {
        id: req.user.userId,
        email: req.user.email,
        name: req.user.email.split('@')[0],
        role: req.user.role,
        customPermissions: req.user.capabilities as any,
        createdAt: new Date().toISOString(),
      },
      addresses: [],
    };
    CUSTOMER_STORE.set(req.user.email.toLowerCase(), customerData);
  }

  const newAddress: ShippingAddress = {
    fullName: fullName || customerData.user.name,
    phone: phone || customerData.user.phone || '',
    street,
    city,
    state,
    pincode: pincode.trim(),
    country: country || 'India',
  };

  customerData.addresses.push(newAddress);

  return res.json({
    success: true,
    addresses: customerData.addresses,
  });
}
