import { getUserHistory } from  '../repositories/historyRepository';
import { BookingHistoryItem } from '../types/bookingTypes';

export const getUserHistoryService = async (userId: number): Promise<BookingHistoryItem[]> =>{

    const {bookings,passengers} = await getUserHistory(userId);

    const historyList: BookingHistoryItem[] = bookings.map(booking =>{
        
        const myPassengers = passengers.filter(p => p.booking_id === booking.booking_id);

        return {
            booking_id: booking.booking_id,
            trip_id: booking.trip_id,
            ticket_id: `TKT-${booking.booking_id}`,
            booking_status: booking.booking_status,
            trip_date : new Date(booking.trip_date).toISOString(),
            total_amount : booking.total_amount,
            bus_name: booking.bus_name,
            bus_number: booking.bus_number,
            route_name: booking.route_name,
            pickup_stop: booking.pickup_stop,
            drop_stop: booking.drop_stop,
            trip_status: booking.trip_status,

            passengers: myPassengers.map(p => ({
                seat_id: p.seat_id,
                seat_number: p.seat_number,
                seat_type: p.seat_type,
                name: p.passenger_name,
                age: p.passenger_age,
                gender: p.passenger_gender as 'Male' | 'Female' | 'Other'
            }))
        }
    });

    return historyList;
}