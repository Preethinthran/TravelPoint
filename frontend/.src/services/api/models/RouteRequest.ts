/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { RouteStopRequest } from './RouteStopRequest';
export type RouteRequest = {
    /**
     * E.g., "Chennai - Bangalore"
     */
    route_name: string;
    total_distance: number;
    estimated_time: string;
    stops: Array<RouteStopRequest>;
};

