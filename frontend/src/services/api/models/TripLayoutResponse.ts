/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { SeatLayoutPassenger } from './SeatLayoutPassenger';
export type TripLayoutResponse = {
    trip_id?: number;
    bus_id?: number;
    bus_type?: string;
    seats?: Array<SeatLayoutPassenger>;
    boarding_points?: Array<{
        stop_id?: number;
        stop_name?: string;
        time?: string;
    }>;
};

