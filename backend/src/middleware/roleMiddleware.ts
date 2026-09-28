import { Response, NextFunction } from 'express';
import { AuthRequest } from '../types';

export const authorizeRoles = (...roles: string[]) => {
  const normalizedAllowed = roles.map(r => r.toUpperCase());
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Not authenticated' });
    }
    const userRole = (req.user.role || '').toUpperCase();
    if (!normalizedAllowed.includes(userRole)) {
      return res.status(403).json({
        success: false,
        message: `Access denied. Role '${req.user.role}' is not authorized for this resource`,
      });
    }
    next();
  };
};
