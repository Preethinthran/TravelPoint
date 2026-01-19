import { prisma } from "../prisma";
import { Prisma } from "@prisma/client";

// --- Types for Raw SQL Results ---
export interface TripMetaRaw {
    trip_id: number;
    bus_id: number;
    bus_type: string;
    departure_time: Date;
}

export interface StaticSeatRaw {
    seat_id: number;
    seat_number: string;
    seat_type: string;
    price: number;
}

export interface StopRaw {
    stop_id: number;
    stop_name: string;
    stop_type: string; // 'Boarding', 'Dropping', 'Both'
    estimated_time: string;
    price: number;
}

/**
 * Main function to fetch all layout details in parallel
 */
export const getStaticTripData = async (tripId: number) => {
    
    // 1. Fetch Basic Trip & Bus Details
    // We need this to ensure the trip exists and to get the Bus ID
    const metaQuery = prisma.$queryRaw<TripMetaRaw[]>`
        SELECT t.trip_id, b.bus_id, b.bus_type, t.departure_time
        FROM trips t
        JOIN bus b ON t.bus_id = b.bus_id
        WHERE t.trip_id = ${tripId}
    `;

    // 2. Fetch Seat Layout (The "Merge" Logic)
    // Left Join Seat (Master) with Booked_Seats (Transaction)
    const seatsQuery = prisma.$queryRaw<StaticSeatRaw[]>`
        SELECT 
            s.seat_id,
            s.seat_number,
            s.seat_type,
            s.price
        FROM seat s
        JOIN trips t ON t.bus_id = s.bus_id
        WHERE t.trip_id = ${tripId}
        ORDER BY s.seat_id ASC
    `;

    // 3. Fetch All Stops for this Route
    // We fetch ALL of them; the Service layer will filter Boarding vs Dropping
    const stopsQuery = prisma.$queryRaw<StopRaw[]>`
        SELECT 
            s.stop_id, 
            s.stop_name, 
            s.stop_type, 
            s.estimated_time,
            s.price
        FROM stops s
        JOIN trips t ON t.path_id = s.path_id
        WHERE t.trip_id = ${tripId}
        ORDER BY s.order_id ASC
    `;

    // Run all 3 queries in parallel for maximum speed
    const [meta, seats, stops] = await Promise.all([metaQuery, seatsQuery, stopsQuery]);

    return {
        trip: meta[0] || null,
        seats,
        stops
    };
};
export const getBookedSeatIds = async (tripId: number) => {
    const result = prisma.$queryRaw<{seat_id:number}[]>`
        SELECT bs.seat_id
        FROM booked_seats bs
        JOIN bookings b ON bs.booking_id = b.booking_id
        WHERE b.trip_id = ${tripId}
        AND b.booking_status = 'Confirmed'
    `;
    return (await result).map(row => row.seat_id);
};