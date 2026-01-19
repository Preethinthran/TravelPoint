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
    seat_type?: SeatUpdateItem.seat_type;
    status?: SeatUpdateItem.status;
};
export namespace SeatUpdateItem {
    export enum seat_type {
        SEATER = 'Seater',
        SLEEPER_UPPER = 'Sleeper_Upper',
        SLEEPER_LOWER = 'Sleeper_Lower',
    }
    export enum status {
        GOOD = 'good',
        REPAIR = 'repair',
        MAINTENANCE = 'maintenance',
        DAMAGED = 'damaged',
    }
}

