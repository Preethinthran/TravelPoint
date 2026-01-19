import { Request, Response } from 'express';
import { searchTripsService } from '../services/tripSearchService';
import { SearchBusQuery } from '../types';

export const searchBuses = async (req: Request, res: Response) => {
    try {
        // 1. Extract and Parse Query Parameters
        // Defaults: Page 1, Limit 10 if not provided
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 10;

        // Construct the query object matching our Type definition
        const query: SearchBusQuery & { page: number; limit: number } = {
            from: req.query.from as string,
            to: req.query.to as string,
            date: req.query.date as string,
            bus_type: req.query.bus_type as any,
            departure_time: req.query.departure_time as string,
            boarding_point: req.query.boarding_point as string,
            dropping_point: req.query.dropping_point as string,
            sort_by: req.query.sort_by as any,       // Optional
            sort_order: req.query.sort_order as any, // Optional
            page,
            limit
        };

        // 2. Validation
        if (!query.from || !query.to || !query.date) {
             return res.status(400).json({ 
                success: false,
                error: "Missing required fields", 
                message: "Please provide 'from', 'to', and 'date'."
             });
        }

        // 3. Call the Service Layer
        const result = await searchTripsService(query);

        // 4. Send Success Response
        return res.status(200).json({
            success: true,
            meta: result.meta,
            data: result.data
        });

    } catch (error) {
        console.error("Search API Error:", error);
        return res.status(500).json({ 
            success: false, 
            error: "Internal Server Error",
            message: "Something went wrong while searching for buses."
        });
    }
};