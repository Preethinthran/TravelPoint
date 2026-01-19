/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class UserService {
    /**
     * Rate a completed trip
     * Allows a user to rate a bus journey after completion. Updates the bus's overall rating automatically.
     * @param bookingId The ID of the booking to rate
     * @param requestBody
     * @returns any Rating submitted successfully
     * @throws ApiError
     */
    public static postBookingsRate(
        bookingId: number,
        requestBody: {
            /**
             * Star rating (Must be between 1 and 5)
             */
            stars: number;
            /**
             * Optional feedback about the journey
             */
            review_text?: string;
        },
    ): CancelablePromise<{
        success?: boolean;
        message?: string;
        new_bus_rating?: string;
    }> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/bookings/{booking_id}/rate',
            path: {
                'booking_id': bookingId,
            },
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                400: `Bad Request – Invalid inputs (e.g., date format or missing ID).`,
                403: `Forbidden – authenticated but not allowed to access this resource.`,
                409: `Rating already exists for this booking`,
                500: `Internal server error – unexpected condition on the server.`,
            },
        });
    }
}
