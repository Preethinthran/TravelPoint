import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'default_secret_123456789';


export interface AuthRequest extends Request {
    user?: {
        user_id: number;
        role: string;
    };
}

export const authenticateToken = (req: Request, res: Response, next: NextFunction) => {
   
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; 
    
    console.log("🔐 Auth check - Header:", authHeader?.substring(0, 30) + "...");
    
    if (!token) {
        console.log("❌ No token provided");
        return res.status(401).json({ success: false, message: 'Access Denied: No Token Provided' });
    }

    try {
        console.log("🔑 Verifying token with secret:", JWT_SECRET?.substring(0, 10) + "...");
        const verified = jwt.verify(token, JWT_SECRET) as { user_id: number; role: string };
        
        console.log("✅ Token verified for user:", verified.user_id, "role:", verified.role);
        (req as AuthRequest).user = verified;
        
        next();

    } catch (error: any) {
        console.log("❌ Token verification failed:", error.message);
        return res.status(403).json({ success: false, message: 'Invalid or Expired Token' });
    }
};


export const authorizeAdmin = (req: Request, res: Response, next: NextFunction) => {
    const authReq = req as AuthRequest;
    
    if (authReq.user?.role !== 'admin') {
        return res.status(403).json({ success: false, message: 'Access Denied: Admins Only' });
    }
    
    next();
};

export const authorizeOperator = (req: Request, res: Response, next: NextFunction) => {
    const authReq = req as any;
    // Check if the role is operator
    if (authReq.user?.role !== 'operator') {
        return res.status(403).json({ success: false, message: 'Access Denied: Operators Only' });
    }
    next();
};