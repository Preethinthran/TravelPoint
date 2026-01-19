/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { TravellerRequest } from '../models/TravellerRequest';
import type { TravellerResponse } from '../models/TravellerResponse';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class UserProfileService {
    /**
     * Add a Saved Traveller
     * Save a passenger's details to the user's profile for quick booking later.
     * @param requestBody
     * @returns any Traveller saved successfully
     * @throws ApiError
     */
    public static addTraveller(
        requestBody: TravellerRequest,
    ): CancelablePromise<{
        success?: boolean;
        message?: string;
        data?: TravellerResponse;
    }> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/user/travellers',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                500: `Internal server error – unexpected condition on the server.`,
            },
        });
    }
    /**
     * Get All Saved Travellers
     * Retrieve the list of family/friends saved by the logged-in user.
     * @returns any List of travellers
     * @throws ApiError
     */
    public static getTravellers(): CancelablePromise<{
        success?: boolean;
        data?: Array<TravellerResponse>;
    }> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/user/travellers',
            errors: {
                500: `Internal server error – unexpected condition on the server.`,
            },
        });
    }
}
