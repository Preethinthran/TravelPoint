import { Request, Response } from 'express';
import { getTripLayoutService } from '../services/layoutService';

export const getTripLayout = async (req: Request, res: Response) => {
    try {
        // 1. Extract Trip ID from URL (e.g., /trips/5001/layout)
        const tripId = parseInt(req.params.trip_id);
        const pickupId = req.query.pickup_id ? Number(req.query.pickup_id) : undefined;
        const dropId = req.query.drop_id ? Number(req.query.drop_id) : undefined;

        const fromCity = req.query.from_city as string | undefined;
        const toCity = req.query.to_city as string | undefined;

        // 2. Validation: Is it a number?
        if (isNaN(tripId)) {
            return res.status(400).json({
                success: false,
                error: "Invalid Trip ID",
                message: "Trip ID must be a number."
            });
        }

        // 3. Call Service
        const layoutData = await getTripLayoutService(tripId, pickupId, dropId, fromCity, toCity);

        // 4. Handle "Trip Not Found"
        if (!layoutData) {
            return res.status(404).json({
                success: false,
                error: "Not Found",
                message: "Trip ID not found in database."
            });
        }

        // 5. Success Response
        return res.status(200).json({
            success: true,
            data: layoutData
        });

    } catch (error) {
        console.error("Layout API Error:", error);
        return res.status(500).json({
            success: false,
            error: "Internal Server Error",
            message: "Something went wrong while fetching the seat layout."
        });
    }
};