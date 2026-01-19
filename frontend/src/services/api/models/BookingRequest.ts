/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type BookingRequest = {
    /**
     * Id of the user making the booking
     */
    user_id: number;
    /**
     * Id of the trip they are booking
     */
    trip_id: number;
    /**
     * Id of the pickup stop
     */
    pickup_stop_id: number;
    /**
     * Id of the drop stop
     */
    drop_stop_id: number;
    /**
     * List of passengers on this bus and their assigned seats.
     */
    passengers: Array<{
        name: string;
        age: number;
        gender: 'Male' | 'Female' | 'Other';
        /**
         * Visual Seat number
         */
        seat_number: string;
        /**
         * Database Id of the seat
         */
        seat_id: number;
    }>;
};

