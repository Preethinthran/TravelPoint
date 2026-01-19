import { createTripRepo, findOverlappingTripRepo, getOperatorTripsRepo, getTripPassengersRepo } from "../repositories/tripRepository";
import { TripRequest } from "../types";

export const createTripService = async (operatorId: number, data: TripRequest) => {
    
    // 1. Keep Date objects ONLY for logical validation (comparisons)
    const start = new Date(data.departure_time);
    const end = new Date(data.arrival_time);

    if (start >= end) {
        throw new Error("Arrival time must be after departure time.");
    }

    if (start < new Date()) {
        throw new Error("Cannot schedule trips in the past.");
    }

    // 2. THE FIX: Pass raw STRINGS to the repository, not Date objects
    // This ensures we compare "String vs String" in the database, matching the Wall Clock Strategy
    const busyTrip = await findOverlappingTripRepo(
        data.bus_id, 
        data.departure_time, // <--- Pass Raw String "YYYY-MM-DD HH:mm:ss"
        data.arrival_time    // <--- Pass Raw String
    );

    if (busyTrip) {
        throw new Error("Bus is already assigned to another trip during this time.");
    }

    const result = await createTripRepo(data);
    
    return {
        success: true,
        trip_id: result.trip_id,
        message: result.message
    };
};

// ... other services remain the same
export const getOperatorTripsService = async (operatorId: number) => {
    const trips = await getOperatorTripsRepo(operatorId);
    return { success: true, data: trips };
};

export const getTripPassengersService = async (tripId: number) => {
    const passengers = await getTripPassengersRepo(tripId);
    return { success: true, count: passengers.length, data: passengers };
};