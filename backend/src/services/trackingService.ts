import redisClient from "../config/redisClient";

// How long (in seconds) to keep the location in RAM before auto-deleting?
const LOCATION_TTL = 3600; // 1 Hour

// 1. Save Location (Write to Redis)
export const updateBusLocationService = async (
    tripId: number, 
    lat: number, 
    lng: number, 
    heading: number = 0, 
    speed: number = 0
) => {
    try {
        // We use a prefix so this project's data is unique
        const key = `bus_booking:trip:${tripId}`;
        
        const data = {
            trip_id: tripId,
            latitude: lat,
            longitude: lng,
            heading: heading,
            speed: speed,
            last_updated: new Date().toISOString()
        };

        // Redis SET command
        // 'EX' sets the expiration timer
        await redisClient.set(key, JSON.stringify(data), { EX: LOCATION_TTL });
        
        return data;
    } catch (error) {
        console.error("Redis Error (Update):", error);
        return null;
    }
};

// 2. Get Last Known Location (Read from Redis)
export const getLastKnownLocationService = async (tripId: number) => {
    try {
        const key = `bus_booking:trip:${tripId}`;
        
        // Redis GET command
        const dataString = await redisClient.get(key);
        
        if (!dataString) return null;

        return JSON.parse(dataString);
    } catch (error) {
        console.error("Redis Error (Get):", error);
        return null;
    }
};