import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';

export const verifyToken = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith("Bearer ")) {
     res.status(401).json({
      status: false,
      message: "Missing or invalid Authorization header.",
      error: {
        code: "ERR_NO_TOKEN",
        issue: "Expected Authorization: Bearer <token>"
      }
    });
  }

  if(authHeader){
    const token = authHeader.split(" ")[1];

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as {
          userId: string;
          role: string;
        };
    
        (req as any).user = decoded;
        next();
      } catch (err) {
         res.status(401).json({
          status: false,
          message: "Token invalid or expired.",
          error: {
            code: "ERR_TOKEN_INVALID",
            issue: "JWT failed to verify"
          }
        });
      }
  }

};
