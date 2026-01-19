/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { BusSearchResult } from '../models/BusSearchResult';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class PublicSearchService {
    /**
     * Search for available bus trips
     * Retrieve a list of bus trips based on source, destination, and travel date with optional filters and sorting.
     * @param from The starting stop name (Source)
     * @param to The destination stop name
     * @param date Travel date in YYYY-MM-DD format
     * @param busType Filter by specific bus type
     * @param departureTime Filter for buses departing after this time (HH:MM:SS)
     * @param boardingPoint Filter by specific boarding point name
     * @param droppingPoint Filter by specific dropping point name
     * @param page Page number for pagination
     * @param limit Number of results per page
     * @param sort Sort criteria in format `field:order`. Can separate multiple with commas.
     * Allowed fields: price, rating, departure_time, duration.
     * Allowed orders: asc, desc.
     *
     * @param sortBy Field to sort the results by
     * @param sortOrder Order of sorting
     * @returns any Successful search results
     * @throws ApiError
     */
    public static searchTrips(
        from: string,
        to: string,
        date: string,
        busType?: 'AC' | 'Non-AC' | 'Sleeper' | 'Semi-Sleeper' | 'AC Sleeper' | 'Non-AC Seater' | 'Volvo Multi-Axle' | 'AC Seater',
        departureTime?: string,
        boardingPoint?: string,
        droppingPoint?: string,
        page: number = 1,
        limit: number = 10,
        sort?: string,
        sortBy: 'price' | 'rating' | 'departure_time' = 'departure_time',
        sortOrder: 'asc' | 'desc' = 'asc',
    ): CancelablePromise<{
        success?: boolean;
        meta?: {
            total?: number;
            page?: number;
            limit?: number;
            totalPages?: number;
        };
        data?: Array<BusSearchResult>;
    }> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/trips/search',
            query: {
                'from': from,
                'to': to,
                'date': date,
                'bus_type': busType,
                'departure_time': departureTime,
                'boarding_point': boardingPoint,
                'dropping_point': droppingPoint,
                'page': page,
                'limit': limit,
                'sort': sort,
                'sort_by': sortBy,
                'sort_order': sortOrder,
            },
            errors: {
                400: `Bad Request – Invalid inputs (e.g., date format or missing ID).`,
                500: `Internal server error – unexpected condition on the server.`,
            },
        });
    }
}
