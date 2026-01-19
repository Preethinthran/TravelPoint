import { prisma } from "../prisma";
import { RatingResponse } from "../types/index";

export const addRatingRepo = async (
    bookingId: number, 
    userId: number, 
    stars: number, 
    reviewText?: string
): Promise<RatingResponse> => {
    
    return await prisma.$transaction(async (tx) => {
        // --- 1. VALIDATION: Fetch Booking, Trip, and Bus details ---
        const rows = await tx.$queryRaw<any[]>`
            SELECT 
                b.booking_id, 
                b.booking_status, 
                b.passenger_id, 
                t.trip_id,
                t.status as trip_status,
                t.arrival_time,
                bus.bus_id
            FROM bookings b
            JOIN trips t ON b.trip_id = t.trip_id
            JOIN bus ON t.bus_id = bus.bus_id
            WHERE b.booking_id = ${bookingId}
        `;

        const record = rows[0];

        // Validation Checks
        if (!record) {
            throw new Error("Booking not found");
        }

        if (record.passenger_id !== userId) {
            throw new Error("Forbidden: You can only rate your own trips");
        }

        if (record.booking_status === 'Cancelled') {
            throw new Error("Cannot rate a cancelled ticket");
        }

        const now = new Date();
        const arrivalTime = new Date(record.arrival_time);
        
        // Note: We perform a loose check. If the trip status isn't explicitly 'Completed' 
        // yet, we still allow rating if the scheduled arrival time has passed.
        if (record.trip_status !== 'Completed' && now < arrivalTime) {
            throw new Error("Cannot rate yet: Trip is not completed");
        }

        const existingReview = await tx.$queryRaw<any[]>`
            SELECT review_id FROM bus_reviews WHERE booking_id = ${bookingId}
        `;
        
        if (existingReview.length > 0) {
            throw new Error("Conflict: You have already rated this trip");
        }

        await tx.$executeRaw`
            INSERT INTO bus_reviews (booking_id, bus_id, user_id, stars, review_text, created_at)
            VALUES (${bookingId}, ${record.bus_id}, ${userId}, ${stars}, ${reviewText || null}, NOW())
        `;

        // Calculate the new average immediately so the bus profile is up to date
        const agg = await tx.$queryRaw<{avg_rating: number, count_rating: number}[]>`
            SELECT AVG(stars) as avg_rating, COUNT(*) as count_rating
            FROM bus_reviews
            WHERE bus_id = ${record.bus_id}
        `;
        
        // Handle potentially null results if this is the first rating (though we just inserted one)
        const rawAvg = Number(agg[0]?.avg_rating || 0);
        const newCount = Number(agg[0]?.count_rating || 0);
        const newAvgFormatted = rawAvg.toFixed(1); // Format e.g., "4.5"

        // --- 5. UPDATE BUS TABLE ---
        await tx.$executeRaw`
            UPDATE bus 
            SET rating = ${newAvgFormatted}, total_ratings = ${newCount}
            WHERE bus_id = ${record.bus_id}
        `;

        return { 
            success: true, 
            message: "Rating submitted successfully", 
            new_bus_rating: newAvgFormatted 
        };
    });
};