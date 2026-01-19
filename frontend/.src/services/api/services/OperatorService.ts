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
}
