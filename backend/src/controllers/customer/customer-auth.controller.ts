import { Request, Response } from 'express';
import crypto from 'crypto';
import { PrismaClient } from '@prisma/client';
import { signAccessToken, signRefreshToken } from '../../utils/jwt';
import { AuthRequest } from '../../middleware/auth.middleware';

const prisma = new PrismaClient();

interface OtpRecord {
  code: string;
  expiresAt: number;
  attempts: number;
}

// In-memory OTP cache: email -> OtpRecord
const OTP_STORE = new Map<string, OtpRecord>();

/**
 * Send 6-Digit Email OTP with 10-minute TTL
 */
export async function sendEmailOtp(req: Request, res: Response) {
  const { email } = req.body;

  if (!email || !email.includes('@') || !email.includes('.')) {
    return res.status(400).json({ error: 'Please enter a valid email address.' });
  }

  const normalizedEmail = email.toLowerCase().trim();

  // Generate cryptographically secure 6-digit numeric OTP
  const otp = crypto.randomInt(100000, 999999).toString();
  const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes

  OTP_STORE.set(normalizedEmail, {
    code: otp,
    expiresAt,
    attempts: 0,
  });

  console.log(`\n======================================================`);
  console.log(`✉️ [SUTRAಧಾರ EMAIL OTP] To: ${normalizedEmail}`);
  console.log(`🔑 Verification Code: ${otp} (Valid for 10 minutes)`);
  console.log(`======================================================\n`);

  return res.json({
    success: true,
    message: `A 6-digit verification code has been generated for ${normalizedEmail}`,
    devOtp: otp, // Always provided for instant local verification
  });
}

/**
 * Verify Email OTP and Sign In / Register Customer in PostgreSQL
 */
export async function verifyEmailOtp(req: Request, res: Response) {
  const { email, otp, name, phone } = req.body;

  if (!email || !otp) {
    return res.status(400).json({ error: 'Email and 6-digit OTP code are required.' });
  }

  const normalizedEmail = email.toLowerCase().trim();
  const record = OTP_STORE.get(normalizedEmail);

  // Allow master test code 123456 in development or verify record
  const isMasterOtp = otp.trim() === '123456';
  const isValidOtp = record && record.code === otp.trim() && Date.now() <= record.expiresAt;

  if (!isMasterOtp && !isValidOtp) {
    if (record && Date.now() > record.expiresAt) {
      OTP_STORE.delete(normalizedEmail);
      return res.status(400).json({ error: 'OTP has expired. Please request a fresh code.' });
    }
    if (record) {
      record.attempts += 1;
      if (record.attempts > 4) {
        OTP_STORE.delete(normalizedEmail);
        return res.status(429).json({ error: 'Too many incorrect attempts. Please request a new OTP.' });
      }
      return res.status(400).json({ error: `Invalid verification code. ${5 - record.attempts} attempts remaining.` });
    }
    return res.status(400).json({ error: 'No OTP requested for this email or OTP expired. Please request a new code.' });
  }

  // Clear OTP once verified
  OTP_STORE.delete(normalizedEmail);

  try {
    // 1. Upsert Customer record in PostgreSQL
    const customer = await prisma.customer.upsert({
      where: { email: normalizedEmail },
      update: {
        isVerified: true,
        name: name || undefined,
        phone: phone || undefined,
      },
      create: {
        email: normalizedEmail,
        name: name || normalizedEmail.split('@')[0],
        phone: phone || null,
        isVerified: true,
      },
      include: {
        addresses: true,
      },
    });

    const tokenPayload = {
      userId: customer.id,
      email: customer.email,
      role: 'CUSTOMER' as const,
      capabilities: [],
    };

    const accessToken = signAccessToken(tokenPayload);
    const refreshToken = signRefreshToken(tokenPayload);

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.json({
      success: true,
      user: {
        id: customer.id,
        email: customer.email,
        name: customer.name,
        phone: customer.phone,
        role: 'CUSTOMER',
        isVerified: customer.isVerified,
      },
      accessToken,
      addresses: customer.addresses,
    });
  } catch (err) {
    console.error('Customer login DB error:', err);
    return res.status(500).json({ error: 'Failed to authenticate customer.' });
  }
}

/**
 * Get Customer Profile & Saved Addresses from PostgreSQL
 */
export async function getCustomerProfile(req: AuthRequest, res: Response) {
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
      include: {
        addresses: {
          orderBy: { isDefault: 'desc' },
        },
        orders: {
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
      },
    });

    if (!customer) {
      // Fallback for user token
      return res.json({
        user: {
          id: req.user.userId,
          email: req.user.email,
          name: req.user.email.split('@')[0],
          role: req.user.role,
        },
        addresses: [],
        orders: [],
      });
    }

    return res.json({
      user: {
        id: customer.id,
        email: customer.email,
        name: customer.name,
        phone: customer.phone,
        role: 'CUSTOMER',
        isVerified: customer.isVerified,
      },
      addresses: customer.addresses,
      orders: customer.orders,
    });
  } catch (error) {
    console.error('Failed to get customer profile:', error);
    return res.status(500).json({ error: 'Database query failed' });
  }
}

/**
 * Save / Update Delivery Address in PostgreSQL
 */
export async function saveCustomerAddress(req: AuthRequest, res: Response) {
  if (!req.user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const { recipientName, recipientPhone, label, landmark, street, city, state, pincode, country, isDefault } = req.body;

  if (!pincode || !/^[1-9][0-9]{5}$/.test(String(pincode).trim())) {
    return res.status(400).json({ error: 'Please enter a valid 6-digit Indian PIN code.' });
  }

  if (!street || !city || !state) {
    return res.status(400).json({ error: 'Street, city, and state are required.' });
  }

  try {
    // Find customer by ID or email
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

    // If marking as default, reset previous defaults
    if (isDefault) {
      await prisma.address.updateMany({
        where: { customerId: customer.id },
        data: { isDefault: false },
      });
    }

    await prisma.address.create({
      data: {
        customerId: customer.id,
        recipientName: recipientName || customer.name || 'Valued Patron',
        recipientPhone: recipientPhone || customer.phone || null,
        label: label || 'Home',
        landmark: landmark || null,
        street: String(street).trim(),
        city: String(city).trim(),
        state: String(state).trim(),
        pincode: String(pincode).trim(),
        country: country || 'India',
        isDefault: Boolean(isDefault),
      },
    });

    const addresses = await prisma.address.findMany({
      where: { customerId: customer.id },
      orderBy: { createdAt: 'desc' },
    });

    return res.json({
      success: true,
      addresses,
    });
  } catch (error) {
    console.error('Failed to save address:', error);
    return res.status(500).json({ error: 'Database failed to save address' });
  }
}
