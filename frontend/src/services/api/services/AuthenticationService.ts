/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { AuthResponse } from '../models/AuthResponse';
import type { LoginRequest } from '../models/LoginRequest';
import type { SignupRequest } from '../models/SignupRequest';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class AuthenticationService {
    /**
     * Register a new user
     * creates a new user account with a hashed password
     * @param requestBody
     * @returns AuthResponse User registered successfully
     * @throws ApiError
     */
    public static registerUser(
        requestBody: SignupRequest,
    ): CancelablePromise<AuthResponse> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/auth/signup',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                400: `Bad Request – Invalid inputs (e.g., date format or missing ID).`,
                409: `Conflict - Email Already Exists`,
                500: `Internal server error – unexpected condition on the server.`,
            },
        });
    }
    /**
     * Login to the system
     * Authenticate a user and return a JWT token
     * @param requestBody
     * @returns AuthResponse Login successful
     * @throws ApiError
     */
    public static loginUser(
        requestBody: LoginRequest,
    ): CancelablePromise<AuthResponse> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/auth/login',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                400: `Bad Request – Invalid inputs (e.g., date format or missing ID).`,
                401: `Unauthorized - Invalid credentials`,
                500: `Internal server error – unexpected condition on the server.`,
            },
        });
    }
}
