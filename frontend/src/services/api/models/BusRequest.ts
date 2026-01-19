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
    bus_type: 'AC' | 'Non-AC' | 'Sleeper' | 'Semi-Sleeper\'AC Sleeper' | 'Non-AC Seater' | 'Volvo Multi-Axle' | 'AC Seater';
};

