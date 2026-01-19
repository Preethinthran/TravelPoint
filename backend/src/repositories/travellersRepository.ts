import { prisma } from "../prisma";
import { SavedTraveller } from "../types";

// 1. Add a new Traveller
export const addTravellerRepo = async (data: SavedTraveller) => {
    return await prisma.saved_travellers.create({
        data: {
            user_id: data.user_id,
            name: data.name,
            age: data.age,
            gender: data.gender as any // Casting as Gender enum might match or string, ensuring compatibility
        }
    });
};

// 2. Get All Travellers for a User
export const getTravellersRepo = async (userId: number) => {
    return await prisma.saved_travellers.findMany({
        where: {
            user_id: userId
        },
        orderBy: {
            created_at: 'desc'
        }
    });
};

// 3. Delete a Traveller
export const deleteTravellerRepo = async (travellerId: number, userId: number) => {
    return await prisma.saved_travellers.deleteMany({
        where: {
            traveller_id: travellerId,
            user_id: userId
        }
    });
};