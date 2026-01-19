/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class AiService {
    /**
     * Generate a secure API Key for the AI Agent
     * Generates a new random API key for the logged-in user and saves it to the database. If a key already exists, it overwrites it.
     * @param requestBody
     * @returns any API Key generated successfully
     * @throws ApiError
     */
    public static postAiGenerateKey(
        requestBody: {
            user_id: number;
        },
    ): CancelablePromise<{
        success?: boolean;
        message?: string;
        /**
         * The generated secret key (e.g., trv_...)
         */
        apiKey?: string;
    }> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/ai/generate-key',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                401: `Unauthorized – missing or invalid authentication credentials.`,
                500: `Internal server error – unexpected condition on the server.`,
            },
        });
    }
}
