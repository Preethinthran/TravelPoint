import { prisma } from "../prisma";
import { CreateBookingRequest } from "../types/bookingTypes";
import { Prisma } from "@prisma/client";

export const createBooking = async (userId: number, data: CreateBookingRequest) => {
    
    return await prisma.$transaction(async (tx) => {
        if (data.passengers.length === 0) throw new Error("No passengers provided");

        const seatIds = data.passengers.map((passenger) => passenger.seat_id);

        // --- STEP 1: CALCULATE ROUTE FARE ---
        // FIX: We select 'order_id' to validate the direction correctly
        const stops = await tx.$queryRaw<any[]>`
            SELECT stop_id, price, order_id 
            FROM stops 
            WHERE stop_id IN (${data.pickup_stop_id}, ${data.drop_stop_id})
        `;

        const pickupStop = stops.find(s => s.stop_id === data.pickup_stop_id);
        const dropStop = stops.find(s => s.stop_id === data.drop_stop_id);
        
        if (!pickupStop || !dropStop) {
            throw new Error("Invalid Pickup or Drop Stop ID");
        }

        // FIX: Use order_id to ensure Pickup comes before Drop
        if (Number(pickupStop.order_id) >= Number(dropStop.order_id)) {
             throw new Error("Invalid Route: Drop point comes before Pickup point");
        }

        // FIX: Use Math.abs() to handle price difference regardless of data format (increasing or decreasing)
        // Route Fare = Absolute Difference between prices
        const routeFare = Math.abs(Number(dropStop.price) - Number(pickupStop.price));

        // --- STEP 2: GET SEAT PRICES & CALCULATE TOTAL ---
        const seatPrices = await tx.$queryRaw<{ seat_id: number, price: number }[]>`
            SELECT seat_id, price 
            FROM seat 
            WHERE seat_id IN (${Prisma.join(seatIds)})
        `;

        const priceMap = new Map<number, number>();
        seatPrices.forEach(s => priceMap.set(s.seat_id, Number(s.price)));

        let totalBookingAmount = 0;

        for (const passenger of data.passengers) {
            const seatPrice = priceMap.get(passenger.seat_id);
            if (seatPrice === undefined) throw new Error(`Price not found for seat ID ${passenger.seat_id}`); 
            totalBookingAmount += (routeFare + seatPrice);
        }

        // --- STEP 3: CHECK AVAILABILITY ---
        const checkQuery = Prisma.sql`
            SELECT COUNT(*) as count 
            FROM booked_seats bs
            JOIN bookings b ON bs.booking_id = b.booking_id
            WHERE bs.seat_id IN (${Prisma.join(seatIds)}) 
            AND b.trip_id = ${data.trip_id}
            AND b.booking_status = 'Confirmed'
        `;

        const result = await tx.$queryRaw<{count: bigint}[]>(checkQuery);
        const bookedCount = Number(result[0]?.count || 0);

        if (bookedCount > 0) {
            throw new Error(`One or more selected seats are already booked.`);
        }

        // --- STEP 4: INSERT BOOKING ---
        await tx.$executeRaw`
            INSERT INTO bookings (passenger_id, trip_id, pickup_stop_id, drop_stop_id, booking_date, amount_paid, booking_status )
            VALUES (${userId}, ${data.trip_id}, ${data.pickup_stop_id}, ${data.drop_stop_id}, NOW(), ${totalBookingAmount}, 'Confirmed')
        `;

        const idResult = await tx.$queryRaw<{id: bigint}[]>`
            SELECT LAST_INSERT_ID() as id 
        `;

        const newBookingId = Number(idResult[0]?.id);

        // --- STEP 5: INSERT PASSENGERS ---
        const seatRows = data.passengers.map(p => Prisma.sql`
            (${newBookingId}, ${p.seat_id}, ${p.name}, ${p.age}, ${p.gender}, ${p.seat_number})
        `);

        await tx.$executeRaw`
            INSERT INTO booked_seats (booking_id, seat_id, passenger_name, passenger_age, passenger_gender, seat_number)
            VALUES ${Prisma.join(seatRows)}
        `;

        return { 
            booking_id: newBookingId,
            total_amount : totalBookingAmount
         };
    });
};

export const cancelBooking = async (booking_id: number, user_id: number) => {
    return await prisma.$transaction(async (tx) => {
        
        // 1. Fetch Booking & Trip Details
        const booking = await tx.$queryRaw<any[]>`
            SELECT b.booking_id, b.booking_status, b.passenger_id, t.departure_time
            FROM bookings b
            JOIN trips t ON b.trip_id = t.trip_id
            WHERE b.booking_id = ${booking_id}
        `;

        const record = booking[0];

        // 2. Validations
        if (!record) {
            throw new Error("Booking not found");
        }

        if (record.passenger_id !== user_id) {
            throw new Error("Forbidden: You can only cancel your own bookings");
        }

        if (record.booking_status === 'Cancelled') {
            throw new Error("Booking is already cancelled");
        }

        // Check if trip has already started
        const departureTime = new Date(record.departure_time);
        const now = new Date();

        if (now >= departureTime) {
            throw new Error("Cannot cancel: Trip has already started or completed");
        }

        // 3. Update Status to 'Cancelled'
        await tx.$executeRaw`
            UPDATE bookings 
            SET booking_status = 'Cancelled'
            WHERE booking_id = ${booking_id}
        `;

        return { 
            success: true, 
            message: "Booking cancelled successfully",
            booking_id: booking_id 
        };
    });
}

// --- NEW: Fetch Trip Details for Inbox ---
export const getTripDetailsForInbox = async (bookingIds: number[]) => {
    // If no IDs, return empty array immediately
    if (bookingIds.length === 0) return [];

    try {
        const tripDetails = await prisma.$queryRaw<any[]>`
            SELECT 
                b.booking_id,
                t.departure_time,
                (SELECT stop_name FROM stops WHERE path_id = t.path_id ORDER BY order_id ASC LIMIT 1) as start_loc,
                (SELECT stop_name FROM stops WHERE path_id = t.path_id ORDER BY order_id DESC LIMIT 1) as end_loc
            FROM bookings b
            JOIN trips t ON b.trip_id = t.trip_id
            WHERE b.booking_id IN (${Prisma.join(bookingIds)})
        `;
        return tripDetails;
    } catch (error) {
        console.error("Error in getTripDetailsForInbox:", error);
        throw new Error("Database error fetching trip details");
    }
};

// --- NEW: Fetch Passenger Names for Inbox ---
export const getPassengerNamesForInbox = async (bookingIds: number[]) => {
    if (bookingIds.length === 0) return [];

    return await prisma.booked_seats.findMany({
        where: { booking_id: { in: bookingIds } },
        select: { booking_id: true, passenger_name: true }
    });
};