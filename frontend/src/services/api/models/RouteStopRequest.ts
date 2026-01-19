/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type RouteStopRequest = {
    stop_name: string;
    order_id: number;
    /**
     * Distance from source
     */
    distance?: number;
    /**
     * Price from source to this stop
     */
    price?: number;
    /**
     * E.g., "2 hrs 30 mins"
     */
    estimated_time?: string;
    stop_type: 'Boarding' | 'Dropping' | 'Both';
};

