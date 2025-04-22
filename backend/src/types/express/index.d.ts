import { UserRole } from '@prisma/client'; // adjust path based on your setup

declare global {
  namespace Express {
    interface Request {
      user?: {
        userId: string;
        role: UserRole; // or just 'role: string' if not using Prisma enums
      };
    }
  }
}
