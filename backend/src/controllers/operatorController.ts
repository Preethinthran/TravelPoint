import { Request, Response } from "express";
import { getBookingsInfoService, getOperatorTripsService, 
         updateTripStatusService, getOperatorInboxService
 } from "../services/operatorService";
import { getActiveConversationsService } from "../services/chatService";
import { prisma } from "../prisma";
import { PrismaClient, Prisma } from '@prisma/client'; 

interface AuthenticatedRequest extends Request {
  user?: {
    user_id: number;
    role: string;
  }
}

interface PassengerItem {
  trip_id: number;
  ticket_id: number;
  booking_id: number;
  passenger_name: string;
  seat_number: string;
  seat_condition: string;
  contact_number: string;
  gender: string;
  pickup_point: string;
  drop_point: string;
  booking_status: string;
  amount_paid: number;
  departure_time: Date;
  route_name: string;
  total_trip_bookings: number;
}

interface BookingResponse {
  bus: {
    bus_number: string;
    bus_type: string;
    passengers_list: PassengerItem[];
  }[];
}

export const getBookingsInfo = async (req: Request, res: Response<BookingResponse>) => {
    const authReq = req as AuthenticatedRequest;
    
    try {
        const operatorId = authReq.user?.user_id;

        if (!operatorId) {
            return res.status(401).json({ 
                status: 401, 
                message: "Unauthorized: User ID missing from token" 
            } as any);
        }
        
        console.log("DEBUG: Requesting Data for Operator ID:", operatorId);
        
        const data = await getBookingsInfoService(Number(operatorId));
        res.status(200).json(data);

    } catch(error) {
        console.error("Error fetching bookings info:", error);
        res.status(500).json({
            status: 500,
            error: "Internal Server Error",
            message: "Failed to fetch bookings info",
        } as any);
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

    } catch (error) {
        console.error("Get Operator Trips Error:", error);
        return res.status(500).json({
            success: false,
            message: "Internal Server Error"
        });
    }
};

export const updateTripStatus = async (req: Request, res: Response) => {
    const authReq = req as AuthenticatedRequest;

    try {
        const operatorId = authReq.user?.user_id;
        const tripId = Number(req.params.trip_id);
        const { status } = req.body;

        if (!operatorId) {
            return res.status(401).json({ success: false, message: "Unauthorized" });
        }
        
        if (!status) {
             return res.status(400).json({ success: false, message: "Status is required" });
        }

        const result = await updateTripStatusService(tripId, operatorId, status);
        return res.status(200).json(result);

    } catch (error: any) {
        console.error("Update Trip Status Error:", error);
        
        if (error.message.includes("Forbidden")) {
            return res.status(403).json({ success: false, message: error.message });
        }
        if (error.message.includes("Invalid Status")) {
            return res.status(400).json({ success: false, message: error.message });
        }

        return res.status(500).json({
            success: false,
            message: "Internal Server Error"
        });
    }
};
export const getOperatorInbox = async (req: Request, res: Response) => {
    const authReq = req as AuthenticatedRequest;

    try {
        const operatorId = authReq.user?.user_id;
        if (!operatorId) {
            return res.status(401).json({ success: false, message: "Unauthorized" });
        }

        // Call the Service (All logic is handled there)
        const data = await getOperatorInboxService(operatorId);

        return res.status(200).json({ success: true, data: data });

    } catch (error) {
        console.error("Get Operator Inbox Error:", error);
        return res.status(500).json({ 
            success: false, 
            message: "Failed to load inbox" 
        });
    }
};