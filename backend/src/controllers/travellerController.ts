import { Request, Response } from "express";
import { addTravellerService, getTravellersService, deleteTravellerService } from "../services/travellerService";

interface AuthenticatedRequest extends Request {
    user?: { user_id: number };
}

export const addTraveller = async (req: Request, res: Response) => {
    const authReq = req as AuthenticatedRequest;
    try {
        const userId = authReq.user?.user_id;
        if (!userId) {
            return res.status(401).json({ message: "Unauthorized" });
        }

        const { name, age, gender } = req.body;
        
        await addTravellerService({ user_id: userId, name, age, gender });
        res.status(201).json({ success: true, message: "Traveller Added" });

    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const getTravellers = async (req: Request, res: Response) => {
    const authReq = req as AuthenticatedRequest;
    try {
        const userId = authReq.user?.user_id;

        if (!userId) return res.status(401).json({ message: "Unauthorized" });

        const result = await getTravellersService(userId);
        res.status(200).json(result);

    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
};