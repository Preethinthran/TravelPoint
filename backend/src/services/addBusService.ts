import { createBusRepo } from "../repositories/addBusRepository";
import { getBusesByOperatorRepo } from "../repositories/addBusRepository";
import { BusRequest } from "../types";

export const addBusService = async (data: BusRequest) => {
    // We pass the data (including operator_id) straight to the repo
    const bus = await createBusRepo(data);
    
    return {
        success: true,
        message: `Bus added and ${data.total_seats} seats generated successfully`,
        bus
    };
};
export const getOperatorBusesService = async (operatorId: number) => {
    const buses = await getBusesByOperatorRepo(operatorId);
    
    return {
        success: true,
        message: "Buses fetched successfully",
        data: buses
    };
};