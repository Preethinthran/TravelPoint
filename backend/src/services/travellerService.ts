import { addTravellerRepo, getTravellersRepo, deleteTravellerRepo } from "../repositories/travellersRepository";
import { SavedTraveller } from "../types/index";

export const addTravellerService = async (data: SavedTraveller) => {
    // Basic Validation
    if (!data.name || !data.age || !data.gender) {
        throw new Error("Name, Age, and Gender are required");
    }
    await addTravellerRepo(data);
    return { success: true, message: "Traveller saved successfully" };
};

export const getTravellersService = async (userId: number) => {
    const travellers = await getTravellersRepo(userId);
    return { success: true, data: travellers };
};

export const deleteTravellerService = async (travellerId: number, userId: number) => {
    await deleteTravellerRepo(travellerId, userId);
    return { success: true, message: "Traveller deleted" };
};