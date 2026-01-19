/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type SeatUpdateItem = {
    /**
     * List of seat numbers to apply the changes to
     */
    seat_numbers: Array<string>;
    /**
     * New price for this seat
     */
    price?: number;
    seat_type?: 'Seater' | 'Sleeper_Upper' | 'Sleeper_Lower';
    status?: 'good' | 'repair' | 'maintenance' | 'damaged';
};

