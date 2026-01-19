/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type TripRequest = {
    /**
     * The ID of the bus running this trip
     */
    bus_id: number;
    /**
     * The ID of the route to follow
     */
    route_id: number;
    /**
     * Start time (YYYY-MM-DDTHH:mm:ssZ)
     */
    departure_time: string;
    /**
     * End time (YYYY-MM-DDTHH:mm:ssZ)
     */
    arrival_time: string;
    status?: 'Scheduled' | 'Cancelled' | 'Completed';
};

