import crypto from 'crypto';
import { Request, Response, NextFunction } from 'express';
import { db } from './db.js';
import { User } from './types.js';

export interface AuthSession {
  userId: string;
  role: 'customer' | 'admin';
  email: string;
  expiresAt: number;
}

// In-memory token store with persistent backup in db
const activeTokens = new Map<string, AuthSession>();

// Rate limiting map: ip -> { count, resetTime }
const loginAttempts = new Map<string, { count: number; resetTime: number }>();

export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.scryptSync(password, salt, 64).toString('hex');
  return `${salt}:${hash}`;
}

export function verifyPassword(password: string, storedHash: string): boolean {
  try {
    const [salt, key] = storedHash.split(':');
    if (!salt || !key) return false;
    const keyBuffer = Buffer.from(key, 'hex');
    const derivedKey = crypto.scryptSync(password, salt, 64);
    return crypto.timingSafeEqual(keyBuffer, derivedKey);
  } catch {
    return false;
  }
}

export function generateToken(user: User): string {
  const token = crypto.randomBytes(32).toString('hex');
  const expiresAt = Date.now() + 7 * 24 * 60 * 60 * 1000; // 7 days
  activeTokens.set(token, {
    userId: user.id,
    role: user.role,
    email: user.email,
    expiresAt,
  });
  return token;
}

export function invalidateToken(token: string): void {
  activeTokens.delete(token);
}

export function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const attempt = loginAttempts.get(ip);
  if (!attempt || now > attempt.resetTime) {
    loginAttempts.set(ip, { count: 1, resetTime: now + 15 * 60 * 1000 }); // 15 mins
    return true;
  }
  if (attempt.count >= 8) {
    return false;
  }
  attempt.count++;
  return true;
}

export function resetRateLimit(ip: string): void {
  loginAttempts.delete(ip);
}

export interface AuthenticatedRequest extends Request {
  user?: User;
  session?: AuthSession;
}

export function authenticate(req: AuthenticatedRequest, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Authentication required' });
    return;
  }

  const token = authHeader.split(' ')[1];
  const session = activeTokens.get(token);

  if (!session || session.expiresAt < Date.now()) {
    if (session) activeTokens.delete(token);
    res.status(401).json({ error: 'Session expired or invalid' });
    return;
  }

  const user = db.getUserById(session.userId);
  if (!user) {
    res.status(401).json({ error: 'User not found' });
    return;
  }

  req.user = user;
  req.session = session;
  next();
}

export function optionalAuthenticate(req: AuthenticatedRequest, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next();
  }

  const token = authHeader.split(' ')[1];
  const session = activeTokens.get(token);

  if (session && session.expiresAt >= Date.now()) {
    const user = db.getUserById(session.userId);
    if (user) {
      req.user = user;
      req.session = session;
    }
  }
  next();
}

export function requireAdmin(req: AuthenticatedRequest, res: Response, next: NextFunction): void {
  authenticate(req, res, () => {
    if (req.user?.role !== 'admin') {
      res.status(403).json({ error: 'Access denied: Administrator privileges required' });
      return;
    }
    next();
  });
}
