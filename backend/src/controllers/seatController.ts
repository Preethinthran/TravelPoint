import { Request, Response } from 'express';
import { updateSeatLayoutService, getbusLayoutService } from '../services/seatService';

interface AuthenticatedRequest extends Request {
    user?: {
        user_id: number;
        role: string;
    }
}

export const updateSeatLayout = async (req: Request, res: Response) => {
    const authReq = req as AuthenticatedRequest; // Type assertion

    try {
        const busId = parseInt(req.params.bus_id);
        const operatorId = authReq.user?.user_id; // Taken securely from Token
        const updateData = req.body;

        if (!operatorId) {
            return res.status(401).json({ success: false, message: "Unauthorized" });
        }

        if (isNaN(busId)) {
            return res.status(400).json({ success: false, message: "Invalid Bus ID" });
        }

        // Call the service
        const result = await updateSeatLayoutService(busId, operatorId, updateData);
        
        return res.status(200).json(result);

    } catch (error: any) {
        console.error("Update Seat Error:", error);

        // Handle specific errors based on the Service messages
        if (error.message === "Bus not found") {
            return res.status(404).json({ success: false, message: error.message });
        }
        
        if (error.message.includes("Access Denied")) {
            return res.status(403).json({ success: false, message: error.message });
        }

        return res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
};

export const getBusLayout = async (req: Request, res: Response) => {
    const authReq = req as AuthenticatedRequest; 

    console.log("debug:" , authReq.user);

    try {
        const busId = parseInt(req.params.bus_id);
        const operatorId = authReq.user?.user_id; 

        if (!operatorId) {
            return res.status(401).json({ success: false, message: "Unauthorized" });
        }

        if (isNaN(busId)) {
            return res.status(400).json({ success: false, message: "Invalid Bus ID" });
        }

        const result = await getbusLayoutService(busId, operatorId);
        
        return res.status(200).json(result);

    } catch (error: any) {
        console.error("Get Bus Layout Error:", error);

        if (error.message === "Bus not found") {
            return res.status(404).json({ success: false, message: error.message });
        }
        
        if (error.message.includes("Access Denied")) {
            return res.status(403).json({ success: false, message: error.message });
        }

        return res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
};