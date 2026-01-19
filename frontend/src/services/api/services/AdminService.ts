/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { AuthResponse } from '../models/AuthResponse';
import type { BusRequest } from '../models/BusRequest';
import type { BusResponse } from '../models/BusResponse';
import type { SignupRequest } from '../models/SignupRequest';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class AdminService {
    /**
     * Create a new Operator (Admin Only)
     * Registers a new user with the role of 'operator'.
     * Requires a valid JWT token with 'admin' role.
     *
     * @param requestBody
     * @returns AuthResponse Operator created successfully
     * @throws ApiError
     */
    public static addOperator(
        requestBody: SignupRequest,
    ): CancelablePromise<AuthResponse> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/admin/add-operator',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                401: `Unauthorized – missing or invalid authentication credentials.`,
                403: `Forbidden - User is not an Admin`,
                409: `Conflict - Email Already Exists`,
                500: `Internal server error – unexpected condition on the server.`,
            },
        });
    }
    /**
     * Add a new Bus (Admin Only)
     * Registers a new bus, links it to an Operator, and **automatically generates seats** in the database based on capacity.
     *
     * @param requestBody
     * @returns BusResponse Bus created successfully
     * @throws ApiError
     */
    public static addBus(
        requestBody: BusRequest,
    ): CancelablePromise<BusResponse> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/admin/add-bus',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                400: `Bad Request – Invalid inputs (e.g., date format or missing ID).`,
                401: `Unauthorized – missing or invalid authentication credentials.`,
                403: `Forbidden - Only Admins can add buses`,
                409: `Conflict - Bus Number already exists`,
                500: `Internal server error – unexpected condition on the server.`,
            },
        });
    }
    /**
     * Get all Operators
     * Returns a list of all registered operators. Useful for populating dropdowns.
     * @returns any List of operators
     * @throws ApiError
     */
    public static getOperators(): CancelablePromise<{
        success?: boolean;
        data?: Array<{
            user_id?: number;
            name?: string;
            email?: string;
        }>;
    }> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/admin/operators',
            errors: {
                401: `Unauthorized – missing or invalid authentication credentials.`,
                403: `Forbidden – authenticated but not allowed to access this resource.`,
            },
        });
    }
}
