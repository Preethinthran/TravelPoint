import {Request, Response} from "express";
import { createBookingService, cancelBookingService } from "../services/bookingService";
import { CreateBookingRequest } from "../types/bookingTypes";

interface AuthenticatedRequest extends Request {
    user? : {
        user_id: number;
        role: string;
    }
}

export const createBooking = async (req: Request, res: Response)=>{
    try{
        const bookingData: CreateBookingRequest = req.body;

        if(!bookingData){
            return res.status(400).json({
                success: false,
                error: "Bad Request",
                message: "No booking data provided"
            })
        }
        console.log("recieved:",JSON.stringify(bookingData, null, 2) )
        const result = await createBookingService(bookingData);

        return res.status(201).json(result);
    }catch(error: any){
        console.error("Booking API Error:", error);
        
        if(error.message.includes("already booked") || error.message.includes("Dropping stops")){
            return res.status(409).json({
                success: false,
                error: "Booking Failed",
                message: error.message
            })
        }

        return res.status(500).json({
            success: false,
            error: "Internal Server Error",
            message: "Something went wrong while creating the booking."
        })
    }
}

export const cancelBooking = async (req: Request, res: Response) => {
    const authReq = req as AuthenticatedRequest;

    try {
        const user_id = authReq.user?.user_id;
        console.log("user_id:", user_id);
        const booking_id = Number(req.params.booking_id);

        if (!user_id) {
            return res.status(401).json({ success: false, message: "Unauthorized" });
        }

        if (isNaN(booking_id)) {
            return res.status(400).json({ success: false, message: "Invalid Booking ID" });
        }

        const result = await cancelBookingService(booking_id, user_id);

        return res.status(200).json(result);

    } catch (error: any) {
        console.error("Cancel Booking Error:", error);
        return res.status(500).json({
            success: false,
            message: "Internal Server Error"
        });
    }
};