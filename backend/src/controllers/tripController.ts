import { Request, Response } from 'express';
import { createTripService, getOperatorTripsService, getTripPassengersService } from '../services/tripService';

interface AuthenticatedRequest extends Request {
    user?: {
        user_id: number;
        role: string;
    }
}

export const createTrip = async (req: Request, res: Response) => {
    const authReq = req as AuthenticatedRequest;

    try {
        const operatorId = authReq.user?.user_id;
        const tripData = req.body;

        if (!operatorId) {
            return res.status(401).json({ success: false, message: "Unauthorized" });
        }

        const result = await createTripService(operatorId, tripData);
        return res.status(201).json(result);

    } catch (error: any) {
        console.error("Create Trip Error:", error);
        
        if (error.message.includes("Overlapping") || error.message.includes("past")) {
            return res.status(400).json({ success: false, message: error.message });
        }

        return res.status(500).json({ 
            success: false, 
            message: error.message || 'Internal Server Error' 
        });
    }
};

export const getOperatorTrips = async (req: Request, res: Response) => {
    const authReq = req as AuthenticatedRequest;

    try {
        const operatorId = authReq.user?.user_id;

        if (!operatorId) {
            return res.status(401).json({ success: false, message: "Unauthorized" });
        }

        const result = await getOperatorTripsService(operatorId);
        return res.status(200).json(result);

    } catch (error: any) {
        console.error("Get Trips Error:", error);
        return res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
};

export const getTripPassengers = async (req: Request, res: Response) => {
    try {
        const tripId = Number(req.params.trip_id);

        if (isNaN(tripId)) {
            return res.status(400).json({ success: false, message: "Invalid Trip ID" });
        }

        const result = await getTripPassengersService(tripId);
        return res.status(200).json(result);

    } catch (error) {
        console.error("Get Passengers Error:", error);
        return res.status(500).json({
            success: false,
            message: "Internal Server Error"
        });
    }
};