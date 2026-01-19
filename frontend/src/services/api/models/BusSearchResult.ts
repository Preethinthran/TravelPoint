/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type BusSearchResult = {
    bus_name?: string;
    bus_id?: number;
    /**
     * List of all stops on this route
     */
    stops?: Array<string>;
    trip_id?: number;
    trip_date?: string;
    path_id?: number;
    rating?: number;
    /**
     * Estimated departure time at the user's pickup point
     */
    departure_time?: string;
    /**
     * Estimated arrival time at the user's drop point
     */
    arrival_time?: string;
    /**
     * Distance in KM between pickup and drop
     */
    distance?: number;
    /**
     * Ticket cost for this specific leg of the journey
     */
    price?: number;
    available_seats?: number;
    bus_type?: string;
};

