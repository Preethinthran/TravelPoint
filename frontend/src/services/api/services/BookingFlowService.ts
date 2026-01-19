/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { BookingRequest } from '../models/BookingRequest';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class BookingFlowService {
    /**
     * Get Bookings for the specific user
     * Retrieve the list tickets booked by a specific user
     * @param userId The ID of the user.
     * @returns any List of user Bookings
     * @throws ApiError
     */
    public static getUserBookings(
        userId: number,
    ): CancelablePromise<{
        success?: boolean;
        data?: Array<{
            trip_id?: number;
            booking_id?: number;
            ticket_id?: string;
            trip_date?: string;
            bus_name?: string;
            route_name?: string;
            pickup_stop?: string;
            drop_stop?: string;
            total_amount?: number;
            booking_status?: string;
            /**
             * Status of the trip
             */
            trip_status?: string;
            passengers?: Array<{
                seat_id?: number;
                seat_number?: string;
                seat_type?: string;
                name?: string;
                age?: number;
                gender?: string;
            }>;
        }>;
    }> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/bookings/user/{user_id}',
            path: {
                'user_id': userId,
            },
            errors: {
                404: `User Not Found`,
                500: `Internal server error – unexpected condition on the server.`,
            },
        });
    }
    /**
     * Booking seats for a trip
     * Receives a list passengers and seat selections, checks availability (freezing logic),
     * and creates a confirmed booking.
     *
     * @param requestBody
     * @returns any Successful booking response.
     * @throws ApiError
     */
    public static createBooking(
        requestBody: BookingRequest,
    ): CancelablePromise<{
        success?: boolean;
        message?: string;
        booking_id?: number;
        ticket_id?: number;
        total_amount?: number;
        status?: string;
    }> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/bookings',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                400: `Bad Request – Invalid inputs (e.g., date format or missing ID).`,
                409: `Conflict - Seats already taken`,
                500: `Internal server error – unexpected condition on the server.`,
            },
        });
    }
    /**
     * Cancel a user's booking
     * Cancels a booking if the trip has not started yet.
     * @param bookingId The ID of the booking to cancel
     * @returns any Booking cancelled successfully
     * @throws ApiError
     */
    public static patchBookingsCancel(
        bookingId: number,
    ): CancelablePromise<{
        success?: boolean;
        message?: string;
    }> {
        return __request(OpenAPI, {
            method: 'PATCH',
            url: '/bookings/{booking_id}/cancel',
            path: {
                'booking_id': bookingId,
            },
            errors: {
                400: `Bad Request – Invalid inputs (e.g., date format or missing ID).`,
                401: `Unauthorized – missing or invalid authentication credentials.`,
                403: `Forbidden – authenticated but not allowed to access this resource.`,
                404: `User Not Found`,
                500: `Internal server error – unexpected condition on the server.`,
            },
        });
    }
}
