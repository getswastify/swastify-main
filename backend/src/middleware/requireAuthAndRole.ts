import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';
import { UserRole } from '@prisma/client';

export const requireAuthAndRole = (role: 'USER' | 'DOCTOR' | 'HOSPITAL' | 'ADMIN') => {
  return (req: Request, res: Response, next: NextFunction) => {
    const token = req.cookies?.auth_token;
    

    if (!token) {
       res.status(401).json({ status: false, message: 'Auth token missing' });
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET!);

      if (typeof decoded === 'object' && decoded !== null) {
        req.user = decoded as { userId: string; role: UserRole };
      } else {
         res.status(401).json({ status: false, message: 'Invalid token payload' });
      }
      
      
      // Now check if the user has the correct role
      if (!req.user || req.user.role !== role) {
         res.status(403).json({
          status: false,
          message: `Access denied. Requires role: ${role}`,
        });
      }

      next(); // Proceed if both authentication and role match
    } catch (error) {
       res.status(401).json({ status: false, message: 'Invalid or expired token' });
    }
  };
};
