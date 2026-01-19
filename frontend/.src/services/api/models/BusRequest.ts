/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type BusRequest = {
    /**
     * The bus registration number.
     */
    bus_number: string;
    /**
     * user id of the operator.
     */
    operator_id: number;
    /**
     * Total capacity of the bus.
     */
    total_seats: number;
    bus_type: BusRequest.bus_type;
};
export namespace BusRequest {
    export enum bus_type {
        AC = 'AC',
        NON_AC = 'Non-AC',
        SLEEPER = 'Sleeper',
        SEMI_SLEEPER_AC_SLEEPER = 'Semi-Sleeper\'AC Sleeper',
        NON_AC_SEATER = 'Non-AC Seater',
        VOLVO_MULTI_AXLE = 'Volvo Multi-Axle',
        AC_SEATER = 'AC Seater',
    }
}

