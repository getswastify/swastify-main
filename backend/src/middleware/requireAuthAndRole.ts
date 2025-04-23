import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';
import { UserRole } from '@prisma/client';

export const requireAuthAndRole = (role: 'USER' | 'DOCTOR' | 'HOSPITAL' | 'ADMIN') => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const token = req.cookies?.auth_token;

    if (!token) {
      res.status(401).json({ status: false, message: 'Auth token missing' });
      return;
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET!);

      if (typeof decoded === 'object' && decoded !== null) {
        req.user = decoded as { userId: string; role: UserRole };
      } else {
        res.status(401).json({ status: false, message: 'Invalid token payload' });
        return;
      }

      if (!req.user || req.user.role !== role) {
        res.status(403).json({
          status: false,
          message: `Access denied. Requires role: ${role}`,
        });
        return;
      }

      next(); // ✅ Only runs if all checks pass
    } catch (error) {
      res.status(401).json({ status: false, message: 'Invalid or expired token' });
    }
  };
};
