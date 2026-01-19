import { prisma } from "../prisma";
import { TripRequest } from "../types";

export const findOverlappingTripRepo = async (busId: number, startTime: string, endTime: string) => {
    const result = await prisma.$queryRaw<{trip_id: number}[]>`
        SELECT trip_id FROM trips 
        WHERE bus_id = ${busId} 
        AND status != 'Cancelled'
        AND departure_time < ${endTime} 
        AND arrival_time > ${startTime}
        LIMIT 1
    `;
    return result[0] || null;
};

export const createTripRepo = async (data: TripRequest) => {
    // const start = new Date(data.departure_time);
    // const end = new Date(data.arrival_time);

    await prisma.$executeRaw`
        INSERT INTO trips (bus_id, path_id, departure_time, arrival_time, status)
        VALUES (${data.bus_id}, ${data.path_id}, ${data.departure_time}, ${data.arrival_time}, 'Scheduled')
    `;

    const lastIdResult = await prisma.$queryRaw<{id: bigint}[]>`
        SELECT LAST_INSERT_ID() as id
    `;
    
    return { 
        trip_id: Number(lastIdResult[0].id), 
        message: "Trip scheduled successfully" 
    };
};

export const getOperatorTripsRepo = async (operatorId: number) => {
    const trips = await prisma.$queryRaw`
        SELECT 
            t.trip_id, 
            t.departure_time, 
            t.arrival_time, 
            t.status,
            b.bus_number, 
            b.bus_type,
            r.route_name, 
            r.total_distance
        FROM trips t
        JOIN bus b ON t.bus_id = b.bus_id
        JOIN route r ON t.path_id = r.path_id
        WHERE b.operator_id = ${operatorId}
        ORDER BY t.departure_time ASC
    `;
    
    return trips;
};

export const getTripPassengersRepo = async (tripId: number) => {
    return await prisma.$queryRaw<any[]>`
        SELECT 
            bs.booking_id,
            bs.seat_number,
            bs.passenger_name,
            bs.passenger_age as age,
            bs.passenger_gender as gender,
            
            -- Booking Contact Info (From the User who booked)
            u.phone as contact_number,
            u.email as contact_email,
            
            -- Journey Details
            pickup.stop_name as pickup_point,
            drop_stop.stop_name as drop_point,
            b.booking_status as status

        FROM booked_seats bs
        JOIN bookings b ON bs.booking_id = b.booking_id
        JOIN users u ON b.passenger_id = u.user_id
        JOIN stops pickup ON b.pickup_stop_id = pickup.stop_id
        JOIN stops drop_stop ON b.drop_stop_id = drop_stop.stop_id
        
        WHERE b.trip_id = ${tripId} 
        AND b.booking_status = 'Confirmed' -- Only show confirmed passengers
        ORDER BY bs.seat_number ASC
    `;
};