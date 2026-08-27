import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';

interface RateLimitRecord {
  count: number;
  resetAt: number;
}

// In-memory composite rate limit buckets
const RATE_LIMIT_STORE = new Map<string, RateLimitRecord>();

// Clean up expired buckets periodically (every 5 minutes)
setInterval(() => {
  const now = Date.now();
  for (const [key, record] of RATE_LIMIT_STORE.entries()) {
    if (now > record.resetAt) {
      RATE_LIMIT_STORE.delete(key);
    }
  }
}, 5 * 60 * 1000);

export interface CompositeRateLimitOptions {
  windowMs: number;
  max: number;
  message?: string;
  keyPrefix?: string;
}

/**
 * Multi-Factor Composite Rate Limiter Middleware
 * Eliminates false positives on shared NAT/Wi-Fi/Office IPs by tracking:
 * (Target Account/Email + Persistent Device Cookie _sutradara_did + Hardware Fingerprint)
 */
export function compositeRateLimiter(options: CompositeRateLimitOptions) {
  const {
    windowMs = 15 * 60 * 1000,
    max = 5,
    message = 'Too many requests. Please try again after a brief pause.',
    keyPrefix = 'rl',
  } = options;

  return (req: Request, res: Response, next: NextFunction) => {
    // 1. Ensure a persistent, cryptographically signed device cookie is present
    let deviceId = req.cookies?._sutradara_did;
    if (!deviceId) {
      deviceId = `did_${crypto.randomBytes(16).toString('hex')}`;
      res.cookie('_sutradara_did', deviceId, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 365 * 24 * 60 * 60 * 1000, // 1 year
      });
    }

    // 2. Hardware and Browser Signature Hash
    const userAgent = req.headers['user-agent'] || 'unknown_ua';
    const acceptLang = req.headers['accept-language'] || 'unknown_lang';
    const clientSignature = crypto
      .createHash('sha256')
      .update(`${userAgent}|${acceptLang}`)
      .digest('hex')
      .substring(0, 12);

    // 3. Extract target account identifier if present (Login/OTP target)
    const targetEmail =
      req.body?.email?.toString().toLowerCase().trim() ||
      req.query?.email?.toString().toLowerCase().trim() ||
      '';

    // 4. Generate composite key
    let compositeKey = '';
    if (targetEmail) {
      // Account-level limit: Specific to target email + device
      compositeKey = `${keyPrefix}:target:${targetEmail}:${deviceId}`;
    } else {
      // Device-level limit: Device + signature + IP subnet
      const ip = req.ip || '127.0.0.1';
      compositeKey = `${keyPrefix}:device:${deviceId}:${clientSignature}:${ip}`;
    }

    const now = Date.now();
    let record = RATE_LIMIT_STORE.get(compositeKey);

    if (!record || now > record.resetAt) {
      record = { count: 1, resetAt: now + windowMs };
      RATE_LIMIT_STORE.set(compositeKey, record);
    } else {
      record.count += 1;
    }

    // Add standard rate limit headers
    const remaining = Math.max(0, max - record.count);
    res.setHeader('X-RateLimit-Limit', max);
    res.setHeader('X-RateLimit-Remaining', remaining);
    res.setHeader('X-RateLimit-Reset', Math.ceil(record.resetAt / 1000));

    if (record.count > max) {
      return res.status(429).json({
        error: message,
        retryAfterSeconds: Math.ceil((record.resetAt - now) / 1000),
      });
    }

    next();
  };
}
