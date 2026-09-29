import dotenv from 'dotenv';
dotenv.config();

import { Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { AuthRequest, UserRole } from '../types';
import { dbStore } from '../services/dbStore';

const getJwtSecret = () => process.env.JWT_SECRET || 'edunexus-super-secret-jwt-key-2026-production';

export const protect = (req: AuthRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;

  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    try {
      const decoded = jwt.verify(token, getJwtSecret()) as {
        id: string;
        email: string;
        role: string;
        name: string;
      };
      req.user = {
        id: decoded.id,
        email: decoded.email,
        role: decoded.role.toUpperCase() as UserRole,
        name: decoded.name,
      };
      return next();
    } catch {
      return res.status(401).json({ success: false, message: 'Not authorized, no valid session token provided' });
    }
  }

  return res.status(401).json({ success: false, message: 'Not authorized, no valid session token provided' });
};

// Optional protect that doesn't block if unauthenticated, but populates req.user if available
export const optionalProtect = (req: AuthRequest, _res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  const xUserId = (req.headers['x-user-id'] as string) || (req.query.userId as string);

  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    try {
      const decoded = jwt.verify(token, getJwtSecret()) as any;
      req.user = {
        id: decoded.id,
        email: decoded.email,
        role: decoded.role.toUpperCase() as UserRole,
        name: decoded.name,
      };
      return next();
    } catch {}
  }

  if (xUserId) {
    const user = dbStore.users.find(u => u.id === xUserId || u.role.toLowerCase() === xUserId.toLowerCase());
    if (user) {
      req.user = {
        id: user.id,
        email: user.email,
        role: user.role.toUpperCase() as UserRole,
        name: user.name,
      };
    }
  }

  next();
};

export const generateToken = (payload: { id: string; email: string; role: string; name: string }): string => {
  return jwt.sign(payload, getJwtSecret(), { expiresIn: '7d' });
};
