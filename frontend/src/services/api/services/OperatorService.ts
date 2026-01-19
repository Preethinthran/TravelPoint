/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { RouteRequest } from '../models/RouteRequest';
import type { RouteResponse } from '../models/RouteResponse';
import type { UpdateSeatsRequest } from '../models/UpdateSeatsRequest';
import type { UpdateSeatsResponse } from '../models/UpdateSeatsResponse';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class OperatorService {
    /**
     * Update Seat Layout (Operator Only)
     * Allows the Operator to update price, type, or status for specific seats in their bus.
     * Useful for defining the bus layout (e.g., setting the first 10 seats as Sleeper).
     *
     * @param busId The ID of the bus to update
     * @param requestBody
     * @returns UpdateSeatsResponse Seats updated successfully
     * @throws ApiError
     */
    public static updateBusLayout(
        busId: number,
        requestBody: UpdateSeatsRequest,
    ): CancelablePromise<UpdateSeatsResponse> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/operator/buses/{bus_id}/seats',
            path: {
                'bus_id': busId,
            },
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                400: `Bad Request – Invalid inputs (e.g., date format or missing ID).`,
                403: `Forbidden - User is not an Operator or does not own this bus`,
                404: `Bus not found`,
                500: `Internal server error – unexpected condition on the server.`,
            },
        });
    }
    /**
     * Get Bus Layout (Operator Only)
     * Fetches all seats for a specific bus. Used to populate the "Edit Layout" dashboard.
     * @param busId ID of the bus to fetch
     * @returns any List of seats
     * @throws ApiError
     */
    public static getBusLayout(
        busId: number,
    ): CancelablePromise<{
        success?: boolean;
        data?: Array<{
            seat_id?: number;
            seat_number?: string;
            seat_type?: string;
            price?: number;
            status?: string;
        }>;
    }> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/operator/buses/{bus_id}/seats',
            path: {
                'bus_id': busId,
            },
            errors: {
                403: `Forbidden - You do not own this bus`,
            },
        });
    }
    /**
     * Get all buses belonging to the logged-in operator
     * @returns any List of buses retrieved successfully
     * @throws ApiError
     */
    public static getOperatorBuses(): CancelablePromise<{
        success?: boolean;
        message?: string;
        data?: Array<{
            bus_id?: number;
            bus_number?: string;
            bus_type?: string;
            total_seats?: number;
            operator_id?: number;
        }>;
    }> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/operator/buses',
            errors: {
                401: `Unauthorized (Token missing or invalid)`,
                500: `Internal Server Error`,
            },
        });
    }
    /**
     * Create a New Route (Operator Only)
     * Creates a route (Source -> Destination) and optionally defines intermediate stops.
     * This route can later be assigned to specific bus trips.
     *
     * @param requestBody
     * @returns RouteResponse Route created successfully
     * @throws ApiError
     */
    public static createRoute(
        requestBody: RouteRequest,
    ): CancelablePromise<RouteResponse> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/operator/routes',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                400: `Bad Request – Invalid inputs (e.g., date format or missing ID).`,
                403: `Forbidden – authenticated but not allowed to access this resource.`,
                500: `Internal server error – unexpected condition on the server.`,
            },
        });
    }
    /**
     * Get All My Routes
     * Returns a list of all routes created by the logged-in operator.
     * @returns any List of routes
     * @throws ApiError
     */
    public static getMyRoutes(): CancelablePromise<{
        success?: boolean;
        data?: Array<{
            route_id?: number;
            source?: string;
            destination?: string;
            total_distance?: number;
        }>;
    }> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/operator/routes',
        });
    }
    /**
     * Create a new trip (Schedule a bus)
     * @param requestBody
     * @returns any Trip created successfully
     * @throws ApiError
     */
    public static postOperatorTrips(
        requestBody: {
            bus_id: number;
            path_id: number;
            departure_time: string;
            arrival_time: string;
            status?: 'Scheduled' | 'Cancelled' | 'Completed' | 'Live';
        },
    ): CancelablePromise<{
        success?: boolean;
        message?: string;
        trip_id?: number;
        status?: string;
    }> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/operator/trips',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                400: `Bad Request – Invalid inputs (e.g., date format or missing ID).`,
                401: `Unauthorized – missing or invalid authentication credentials.`,
                500: `Internal server error – unexpected condition on the server.`,
            },
        });
    }
    /**
     * Get all scheduled trips for the logged-in operator
     * Fetches a list of all upcoming and past trips for buses owned by the operator.
     * @returns any List of trips retrieved successfully
     * @throws ApiError
     */
    public static getOperatorTrips(): CancelablePromise<{
        success?: boolean;
        data?: Array<{
            trip_id?: number;
            bus_id?: number;
            bus_number?: string;
            route_name?: string;
            departure_time?: string;
            arrival_time?: string;
            trip_status?: string;
        }>;
    }> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/operator/trips',
            errors: {
                401: `Unauthorized – missing or invalid authentication credentials.`,
                500: `Internal server error – unexpected condition on the server.`,
            },
        });
    }
    /**
     * Update the status of a trip
     * Allows an operator to mark a trip as 'Live', 'Completed', or 'Cancelled'.
     * @param tripId ID of the trip to update
     * @param requestBody
     * @returns any Trip status updated successfully
     * @throws ApiError
     */
    public static patchOperatorTripsStatus(
        tripId: number,
        requestBody: {
            /**
             * The new status of the trip
             */
            status: 'Live' | 'Completed' | 'Cancelled' | 'Scheduled';
        },
    ): CancelablePromise<{
        success?: boolean;
        message?: string;
    }> {
        return __request(OpenAPI, {
            method: 'PATCH',
            url: '/operator/trips/{trip_id}/status',
            path: {
                'trip_id': tripId,
            },
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                400: `Bad Request – Invalid inputs (e.g., date format or missing ID).`,
                401: `Unauthorized – missing or invalid authentication credentials.`,
                403: `Forbidden – authenticated but not allowed to access this resource.`,
                404: `Trip not found`,
                500: `Internal server error – unexpected condition on the server.`,
            },
        });
    }
    /**
     * Get Operator Inbox (Active Chat Conversations)
     * Returns a list of all active booking chats for the logged-in operator, including the last message and passenger name.
     * @returns any Successful response
     * @throws ApiError
     */
    public static getOperatorInbox(): CancelablePromise<{
        success?: boolean;
        data?: Array<{
            bookingId?: number;
            lastMessage?: string;
            lastSender?: string;
            lastTime?: string;
            unreadCount?: number;
            passengerName?: string;
            tripDate?: string;
            routeName?: string;
        }>;
    }> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/operator/inbox',
            errors: {
                401: `Unauthorized – missing or invalid authentication credentials.`,
                500: `Internal server error – unexpected condition on the server.`,
            },
        });
    }
    /**
     * Get passenger manifest for a trip
     * Returns a list of all confirmed passengers for a specific trip.
     * @param tripId
     * @returns any Passenger list retrieved successfully
     * @throws ApiError
     */
    public static getOperatorTripsPassengers(
        tripId: number,
    ): CancelablePromise<{
        success?: boolean;
        data?: Array<{
            booking_id?: number;
            seat_number?: string;
            passenger_name?: string;
            age?: number;
            gender?: string;
            /**
             * Phone number of the person who booked the ticket
             */
            contact_number?: string;
            pickup_point?: string;
            drop_point?: string;
            status?: string;
        }>;
    }> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/operator/trips/{trip_id}/passengers',
            path: {
                'trip_id': tripId,
            },
            errors: {
                404: `User Not Found`,
                500: `Internal server error – unexpected condition on the server.`,
            },
        });
    }
}
