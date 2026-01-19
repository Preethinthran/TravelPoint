import { getBusOwnerRepo } from "../repositories/addBusRepository";
import { updateSeatLayoutRepo, getSeatsByBusIdRepo } from "../repositories/seatRepository";
import { UpdateSeatsRequest } from "../types";

export const updateSeatLayoutService = async (busId: number, operatorId: number, data: UpdateSeatsRequest) => {
    
    console.log("recieved:",JSON.stringify(data.updates, null, 2) )
    // 1. SECURITY CHECK: Does this bus exist and belong to this operator?
    const bus = await getBusOwnerRepo(busId);

    if (!bus) {
        throw new Error("Bus not found");
    }

    if (bus.operator_id !== operatorId) {
        throw new Error("Access Denied: You do not own this bus");
    }

    // 2. Perform the Update
    // We pass 'data.updates' which is the array of changes
    await updateSeatLayoutRepo(busId, data.updates);

    return {
        success: true,
        message: "Seats updated successfully"
    };
};

export const getbusLayoutService = async (busId: number, operatorId: number) => {
     
    const bus = await getBusOwnerRepo(busId);

    if (!bus){
        throw new Error("Bus not found");
    }
    if (bus.operator_id != operatorId){
        throw new Error ("Access Denied: You do not own this bus");
    }
    const seats = await getSeatsByBusIdRepo(busId);

    return{
        success: true,
        message: "Seats fetched successfully",
        data: seats
    };
};