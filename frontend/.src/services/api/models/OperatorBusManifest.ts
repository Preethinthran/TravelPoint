/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type OperatorBusManifest = {
    bus_type?: string;
    bus_number?: string;
    /**
     * List of passengers on this bus.
     */
    passengers_list?: Array<{
        trip_id?: number;
        ticket_id?: number;
        booking_id?: number;
        passenger_name?: string;
        seat_number?: string;
        seat_condition?: 'good' | 'repair' | 'maintenance' | 'damaged';
        contact_number?: string;
        route_name?: string;
        pickup_point?: string;
        drop_point?: string;
        departure_time?: string;
        booking_date?: string;
        booking_status?: string;
        amount_paid?: number;
        /**
         * Total passengers on this specific trip.
         */
        total_trip_bookings?: number;
    }>;
};

