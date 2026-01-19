import { Request, Response } from 'express';
import { createRouteService, getMyRoutesService } from '../services/routeService';

interface AuthenticatedRequest extends Request {
    user?: {
        user_id: number;
        role: string;
    }
}

export const createRoute = async (req: Request, res: Response) => {
    const authReq = req as AuthenticatedRequest;

    try {
        const operatorId = authReq.user?.user_id; 
        const routeData = req.body;

        if (!operatorId) {
            return res.status(401).json({ success: false, message: "Unauthorized" });
        }

        const result = await createRouteService(operatorId, routeData);
        
        return res.status(201).json(result);

    } catch (error: any) {
        console.error("Create Route Error:", error);
        return res.status(500).json({ 
            success: false, 
            message: error.message || 'Internal Server Error' 
        });
    }
};

export const getMyRoutes = async (req: Request, res: Response) => {
    const authReq = req as AuthenticatedRequest;

    try {
        const operatorId = authReq.user?.user_id;

        if (!operatorId) {
            return res.status(401).json({ success: false, message: "Unauthorized" });
        }

        const result = await getMyRoutesService(operatorId);
        
        return res.status(200).json(result);

    } catch (error: any) {
        console.error("Get Routes Error:", error);
        return res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
};