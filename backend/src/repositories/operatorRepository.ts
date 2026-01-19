import { prisma} from "../prisma";

export const fetchBookingsInfoRaw = async (operatorId: number) => {
    const rawData: any = await prisma.$queryRaw`
        WITH RawData AS (
        SELECT 
            B.bus_number,
            B.bus_type,
            T.trip_id,
            BK.booking_date,
            T.departure_time,
            R.route_name,
            BS.booking_id,
            BS.ticket_id,
            BS.passenger_name,
            BS.passenger_age,
            BS.passenger_gender,
            S.seat_number,       
            S.status AS seat_condition,
            U.Phone AS contact_number,
            Pickup.stop_name AS pickup_point,
            DropOff.stop_name AS drop_point,
            BK.booking_status,
            BK.amount_paid,
            -- Window function to count total passengers/seats per trip
            COUNT(BS.seat_id) OVER (PARTITION BY T.trip_id) AS total_trip_bookings
        FROM bus B
        JOIN trips T ON B.bus_id = T.bus_id
        JOIN route R ON T.path_id = R.path_id
        JOIN bookings BK ON T.trip_id = BK.trip_id
        JOIN booked_seats BS ON BK.booking_id = BS.booking_id
        JOIN seat S ON BS.seat_id = S.seat_id
        JOIN users U ON BK.passenger_id = U.user_id
        JOIN stops Pickup ON BK.pickup_stop_id = Pickup.stop_id
        JOIN stops DropOff ON BK.drop_stop_id = DropOff.stop_id
        WHERE B.operator_id = ${operatorId}
        -- We sort here so the rows enter the grouping step in the desired order
        ORDER BY BK.booking_date, T.departure_time, S.seat_number
    ),

    BusGrouped AS (
        SELECT 
            bus_number,
            bus_type,
            -- JSON_ARRAYAGG simply aggregates the rows in the order it receives them
            JSON_ARRAYAGG(
                JSON_OBJECT(
                    'trip_id', trip_id,
                    'booking_date', booking_date,
                    'booking_id', booking_id,
                    'ticket_id', ticket_id,
                    'total_trip_bookings', total_trip_bookings,
                    'departure_time', departure_time,
                    'route_name', route_name,
                    'passenger_name', passenger_name,
                    'gender', passenger_gender,
                    'seat_number', seat_number,
                    'seat_condition', seat_condition,
                    'contact_number', contact_number,
                    'pickup_point', pickup_point,
                    'drop_point', drop_point,
                    'booking_status', booking_status,
                    'amount_paid', amount_paid
                ) 
            ) AS passengers_list
        FROM RawData
        GROUP BY bus_number, bus_type
    )

    SELECT 
        JSON_OBJECT(
            'bus', 
            JSON_ARRAYAGG(
                JSON_OBJECT(
                    'bus_number', bus_number, 
                    'bus_type', bus_type, 
                    'passengers_list', passengers_list
                )
            )
        ) AS result
    FROM BusGrouped;`;

    return rawData;
}

export const getOperatorTripsRepo = async (operatorId: number) => {
    return await prisma.$queryRaw`
        SELECT 
            t.trip_id,
            b.bus_id,
            b.bus_number,
            r.route_name,
            t.departure_time,
            t.arrival_time,
            
            -- Smart Status Calculation
            CASE 
                WHEN t.departure_time < NOW() THEN 'Completed'
                ELSE 'Scheduled'
            END as trip_status

        FROM trips t
        JOIN bus b ON t.bus_id = b.bus_id
        JOIN route r ON t.path_id = r.path_id
        WHERE b.operator_id = ${operatorId}
        ORDER BY t.departure_time ASC
    `;
};


export const updateTripStatusRepo = async (tripId: number, operatorId: number, newStatus: string) => {
    // 1. Verify Ownership: Does this trip belong to a bus owned by this operator?
    const trip = await prisma.$queryRaw<any[]>`
        SELECT t.trip_id 
        FROM trips t
        JOIN bus b ON t.bus_id = b.bus_id
        WHERE t.trip_id = ${tripId} AND b.operator_id = ${operatorId}
    `;

    if (!trip || trip.length === 0) {
        throw new Error("Forbidden: Trip not found or you do not own this bus.");
    }

    // 2. Update Status
    await prisma.$executeRaw`
        UPDATE trips 
        SET status = ${newStatus}
        WHERE trip_id = ${tripId}
    `;

    return { 
        success: true, 
        message: `Trip status updated to ${newStatus}` 
    };
};