// src/types/booking.ts

export interface BookingPassenger {
    name: string;
    age: number;
    gender: 'Male' | 'Female' | 'Other';
    seat_number: string; // "L1"
    seat_id: number;     // 205 (The DB ID)
}

export interface CreateBookingRequest {
    user_id: number;
    trip_id: number;
    pickup_stop_id: number;
    drop_stop_id: number;
    passengers: BookingPassenger[];
}

export interface CreateBookingResponse {
    success: boolean;
    booking_id: number;
    ticket_id: string; // "TKT-1001"
    status: string;
    total_amount: number;
    message: string;
}

export interface HistoryPassenger {
    seat_id: number;
    seat_number: string;
    seat_type: string;
    name: string;
    age: number;
    gender: 'Male' | 'Female' | 'Other';
}
export interface BookingHistoryItem {
    booking_id: number;
    ticket_id: string;
    booking_status: string;
    trip_date: string;
    total_amount: number;

    bus_name: string;
    route_name: string;
    pickup_stop: string;
    drop_stop: string;
    trip_status: string;
    passengers: HistoryPassenger[]; 
}

export interface CancelBookingResponse {
    success: boolean;
    message: string;
    booking_id: number;
}