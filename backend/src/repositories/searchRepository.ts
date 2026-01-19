import { prisma } from "../prisma";
import { Prisma } from "@prisma/client";
import { SearchBusQuery } from '../types'; 

interface TripRawResult {
    bus_id: number;
    bus_number: string;
    bus_type: string;
    trip_id: number;
    rating: number;
    departure_time: Date;
    arrival_time: Date;
    ticket_price: number;
    trip_distance: number;
    available_seats: number;
    boarding_points: string[];
    dropping_points: string[];
}
const normalizeDate = (date: string) => {
  if (!date) return null;

  if (date.includes('-')) {
    const parts = date.split('-');

    // DD-MM-YYYY → YYYY-MM-DD
    if (parts[0].length === 2 && parts[2].length === 4) {
      return `${parts[2]}-${parts[1]}-${parts[0]}`;
    }

    // Already YYYY-MM-DD
    return date;
  }

  // Fallback (ISO / timestamp)
  return new Date(date).toISOString().split('T')[0];
};


export const findTrips = async (
    params: SearchBusQuery & { page: number; limit: number }
) => {
    const { 
        from, to, date, 
        bus_type, sort_by, sort_order,
        departure_time, boarding_point, dropping_point, 
        page, limit 
    } = params;

    const offset = (page - 1) * limit;
    const activeSortBy = sort_by || 'departure_time';
    const activeSortOrder = sort_order || 'asc';
    
    // 3. Robust Date Logic (Handles DD-MM-YYYY or YYYY-MM-DD)
    const searchDate = normalizeDate(date);

    const pickupSearch = boarding_point || from;
    const dropSearch = dropping_point || to;

    const timeClause = departure_time 
        ? Prisma.sql`AND TIME(t.departure_time) >= ${departure_time}` 
        : Prisma.empty;

    const busTypeClause = bus_type 
        ? Prisma.sql`AND b.bus_type = ${bus_type}` 
        : Prisma.empty;

    // Sorting Logic
    const direction = activeSortOrder === 'desc' ? Prisma.sql`DESC` : Prisma.sql`ASC`;
    let orderByClause = Prisma.sql`td.departure_time ${direction}`; 

    if (activeSortBy === 'price') orderByClause = Prisma.sql`td.ticket_price ${direction}, td.departure_time ASC`;
    else if (activeSortBy === 'rating' ) orderByClause = Prisma.sql`td.rating ${direction}, td.departure_time ASC`;

    
    const trips = await prisma.$queryRaw<TripRawResult[]>`
        WITH TripSearch AS (
            SELECT 
                t.trip_id, t.bus_id, t.path_id, t.departure_time, t.arrival_time,
                s1.order_id as pickup_order,
                s2.order_id as drop_order,
                (SELECT MIN(price) FROM seat WHERE bus_id = t.bus_id) as ticket_price,
                (s2.distance - s1.distance) as trip_distance
            FROM trips t
            JOIN route r ON t.path_id = r.path_id
            JOIN stops s1 ON r.path_id = s1.path_id
            JOIN stops s2 ON r.path_id = s2.path_id
            JOIN bus b ON t.bus_id = b.bus_id
            WHERE 
                s1.stop_name LIKE CONCAT ('%', ${pickupSearch}, '%')
                AND s2.stop_name LIKE CONCAT ('%', ${dropSearch}, '%')
                AND s1.order_id < s2.order_id
                AND DATE(t.departure_time) = ${searchDate}
                ${busTypeClause}
                ${timeClause} 
        ),
        TripDetails AS (
            SELECT 
                ts.*, b.bus_number, b.bus_type, b.rating, b.total_seats,
                (b.total_seats - (
                    SELECT COUNT(*) FROM bookings bk 
                    WHERE bk.trip_id = ts.trip_id AND bk.booking_status = 'Confirmed'
                )) as available_seats
            FROM TripSearch ts
            JOIN bus b ON ts.bus_id = b.bus_id
        )
        SELECT 
            td.bus_id, td.bus_number, td.bus_type, td.trip_id, td.rating,
            td.departure_time, td.arrival_time, td.ticket_price,
            td.trip_distance, td.available_seats,
            
            -- NEW: Fetch Boarding Points (Order < Drop Order, Type is BOARDING or BOTH)
            (
                SELECT JSON_ARRAYAGG(stop_name) 
                FROM stops 
                WHERE path_id = td.path_id 
                AND order_id <= td.drop_order
                AND (stop_type = 'BOARDING' OR stop_type = 'BOTH')
            ) as boarding_points,

            -- NEW: Fetch Dropping Points (Order > Pickup Order, Type is DROPPING or BOTH)
            (
                SELECT JSON_ARRAYAGG(stop_name) 
                FROM stops 
                WHERE path_id = td.path_id 
                AND order_id >= td.pickup_order
                AND (stop_type = 'DROPPING' OR stop_type = 'BOTH')
            ) as dropping_points

        FROM TripDetails td
        ORDER BY ${orderByClause}
        LIMIT ${limit} OFFSET ${offset}
    `;

    return trips;
};

// ... keep countTotalTrips as it was ...
export const countTotalTrips = async (params: SearchBusQuery) => {
   // (No changes needed here unless you want to filter by specific stop counts)
   // Use the same function I gave you in Step 22
   const { from, to, date, bus_type, departure_time, boarding_point, dropping_point } = params;
   const searchDate = normalizeDate(date);
   const pickupSearch = boarding_point || from;
   const dropSearch = dropping_point || to;
   const timeClause = departure_time ? Prisma.sql`AND TIME(t.departure_time) >= ${departure_time}` : Prisma.empty;
   const busTypeClause = bus_type ? Prisma.sql`AND b.bus_type = ${bus_type}` : Prisma.empty;

   const result = await prisma.$queryRaw<[{ total: bigint }]>`
        SELECT COUNT(*) as total
        FROM trips t
        JOIN route r ON t.path_id = r.path_id
        JOIN stops s1 ON r.path_id = s1.path_id
        JOIN stops s2 ON r.path_id = s2.path_id
        JOIN bus b ON t.bus_id = b.bus_id
        WHERE 
            s1.stop_name LIKE CONCAT('%', ${pickupSearch}, '%') 
            AND s2.stop_name LIKE CONCAT('%', ${dropSearch}, '%')
            AND s1.order_id < s2.order_id
            AND DATE(t.departure_time) = ${searchDate}
            ${busTypeClause}
            ${timeClause}
    `;
    return Number(result[0]?.total || 0);
};