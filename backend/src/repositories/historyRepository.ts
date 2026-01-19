import { prisma } from "../prisma";
import { Prisma } from "@prisma/client";

export interface BookingMasterRaw {
    booking_id : number;
    booking_status: string;
    trip_id: number;
    trip_date: string;
    total_amount: number;
    bus_name: string;
    bus_number: string;
    route_name: string;
    pickup_stop: string;
    drop_stop: string;
    trip_status: string;
}
export interface PassengerRaw{
    booking_id: number;
    seat_id: number;
    seat_number: string;
    seat_type: string;
    passenger_name: string;
    passenger_age: number;
    passenger_gender: string;
}

export const getUserHistory = async (userId: number) => {
    
    const bookings = await prisma.$queryRaw<BookingMasterRaw[]>`
    SELECT 
        b.booking_id,
        t.trip_id,
        b.booking_status,
        b.amount_paid as total_amount,
        t.departure_time as trip_date,
        t.status as trip_status,
        bus.bus_number,
        Concat(bus.bus_type, '-', bus.bus_number) as bus_name,
        r.route_name,
        pickup.stop_name as pickup_stop,
        drop_point.stop_name as drop_stop
    From bookings b
    join trips t on b.trip_id = t.trip_id
    join bus on t.bus_id = bus.bus_id
    join route r on t.path_id = r.path_id
    join stops as pickup on b.pickup_stop_id = pickup.stop_id
    join stops as drop_point on b.drop_stop_id = drop_point.stop_id
    where b.passenger_id = ${userId}
    order by b.booking_date desc
  `;
  
  if (bookings.length === 0){
    return {bookings: [], passengers:[]};
  }

  const bookingIds = bookings.map(b => b.booking_id );

  const passengers = await prisma.$queryRaw<PassengerRaw[]>`
    Select
      bs.booking_id,
      bs.seat_id,
      bs.seat_number,
      s.seat_type,
      bs.passenger_name,
      bs.passenger_age,
      bs.passenger_gender
    from booked_seats bs
    join seat s on bs.seat_id = s.seat_id
    where bs.booking_id in (${Prisma.join(bookingIds)})
    order by bs.seat_number asc
    `;
    return {bookings,passengers};
};