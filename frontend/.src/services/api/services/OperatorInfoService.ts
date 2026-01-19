/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { OperatorBusManifest } from '../models/OperatorBusManifest';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class OperatorInfoService {
    /**
     * Get Operator Manifest
     * Returns the full manifest for a specific Operator.
     * Data is grouped by Bus -> Trips -> Passengers.
     *
     * @param operatorId The ID of the operator requesting the manifest.
     * @returns any Successful manifest response.
     * @throws ApiError
     */
    public static getBookingsInfo(
        operatorId: number,
    ): CancelablePromise<{
        /**
         * List of buses found for the operator.
         */
        bus?: Array<OperatorBusManifest>;
    }> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/getBookingsInfo',
            query: {
                'operator_id': operatorId,
            },
            errors: {
                400: `Bad Request – Invalid inputs (e.g., date format or missing ID).`,
                401: `Unauthorized – missing or invalid authentication credentials.`,
                403: `Forbidden – authenticated but not allowed to access this resource.`,
                500: `Internal server error – unexpected condition on the server.`,
            },
        });
    }
}
