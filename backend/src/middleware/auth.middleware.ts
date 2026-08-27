import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken, TokenPayload } from '../utils/jwt';

export interface AuthRequest extends Request {
  user?: TokenPayload;
}

/**
 * Verifies the JWT Access Token from the Authorization header or cookie.
 */
export function requireAuth(req: AuthRequest, res: Response, next: NextFunction) {
  let token = req.headers.authorization?.startsWith('Bearer ')
    ? req.headers.authorization.split(' ')[1]
    : req.cookies?.accessToken;

  if (!token) {
    return res.status(401).json({ error: 'Authentication required. No token provided.' });
  }

  const payload = verifyAccessToken(token);
  if (!payload) {
    return res.status(401).json({ error: 'Invalid or expired access token.' });
  }

  req.user = payload;
  next();
}

/**
 * Granular capability-based access control guard.
 * Allows access if the user has the required capability string OR is an ADMIN.
 */
export function requireCapability(requiredCapability: string) {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required.' });
    }

    // Admins bypass granular capability checks
    if (req.user.role === 'ADMIN') {
      return next();
    }

    const userCapabilities = req.user.capabilities || [];
    if (!userCapabilities.includes(requiredCapability)) {
      return res.status(403).json({
        error: 'Forbidden: Insufficient permissions',
        requiredCapability,
      });
    }

    next();
  };
}
