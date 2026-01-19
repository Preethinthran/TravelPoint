import { Request, Response } from 'express';
import { addBusService } from '../services/addBusService';
import {getOperatorBusesService} from '../services/addBusService';
interface AuthenticatedRequest extends Request {
    user?: {
        user_id: number;
        role: string;
    }
}
export const addBus = async (req: Request, res: Response) => {
    try {
        // req.body contains { bus_number, operator_id, total_seats, bus_type }
        const result = await addBusService(req.body);
        
        return res.status(201).json(result);

    } catch (error: any) {
        console.error("Add Bus Error:", error);
        
        // Handle specific error from Repository
        if (error.message === "Bus Number already exists") {
            return res.status(409).json({ 
                success: false, 
                message: error.message 
            });
        }

        return res.status(500).json({ 
            success: false, 
            message: 'Internal Server Error during Bus Creation' 
        });
    }
};

export const getOperatorBuses = async (req: Request, res: Response) => {
    const authReq = req as AuthenticatedRequest;

    try {
        const operatorId = authReq.user?.user_id;

        if (!operatorId) {
            return res.status(401).json({ success: false, message: "Unauthorized" });
        }

        const result = await getOperatorBusesService(operatorId);
        return res.status(200).json(result);

    } catch (error: any) {
        console.error("Get Operator Buses Error:", error);
        return res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};