import { Request, Response } from "express";
import { addRatingService } from "../services/ratingService";
import { AddRatingRequest } from "../types/index";

// Define the Authenticated Request interface
interface AuthenticatedRequest extends Request {
    user?: {
        user_id: number;
        role: string;
    }
}

export const addRating = async (req: Request, res: Response) => {
    const authReq = req as AuthenticatedRequest;

    try {
        // 1. Extract IDs safely
        const userId = authReq.user?.user_id;
        const bookingId = Number(req.params.booking_id);

        if (!userId) {
            return res.status(401).json({ success: false, message: "Unauthorized: User not logged in" });
        }

        if (isNaN(bookingId)) {
            return res.status(400).json({ success: false, message: "Invalid Booking ID" });
        }

        // 2. Extract Body Data
        const ratingData: AddRatingRequest = {
            stars: req.body.stars,
            review_text: req.body.review_text
        };

        const result = await addRatingService(bookingId, userId, ratingData);
        return res.status(200).json(result);

    } catch (error: any) {
        console.error("Add Rating Error:", error);

        if (error.message.includes("Conflict") || error.message.includes("already rated")) {
            return res.status(409).json({ success: false, message: error.message });
        }

        if (error.message.includes("Forbidden")) {
            return res.status(403).json({ success: false, message: error.message });
        }

        if (error.message.includes("Cannot rate") || error.message.includes("Stars must be")) {
            return res.status(400).json({ success: false, message: error.message });
        }

        if (error.message.includes("Booking not found")) {
            return res.status(404).json({ success: false, message: error.message });
        }
        return res.status(500).json({
            success: false,
            message: "Internal Server Error"
        });
    }
};