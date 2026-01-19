import { getStaticTripData, getBookedSeatIds } from '../repositories/layoutRepository';
import appCache from '../utils/cache';
import { getDynamicMultiplier, getDateMultiplier, getLocationMultiplier } from '../utils/pricingEngine';

export const getTripLayoutService = async (
    tripId: number, 
    pickupId?: number, dropId?: number,
    fromCity?: string, toCity?: string) => {

    // --- STEP A: STATIC DATA ---
    const cacheKey = `static_layout_${tripId}`;
    let staticData = appCache.get<any>(cacheKey);
    if (!staticData){
        console.log("CACHE MISS: Fetching from DB");
        staticData = await getStaticTripData(tripId);
        if(staticData.trip) appCache.set(cacheKey, staticData);
    } else {
        console.log("CACHE HIT: Using Cached Data");
    }

    if(!staticData.trip) return null;

    // --- STEP B: DYNAMIC BOOKINGS ---
    const bookedSeatIds = await getBookedSeatIds(tripId);

    // --- STEP C: PRICING LOGIC ---
    let routeFare = 0;
    let surgeMultiplier = 1.0;
    let dateMultiplier = 1.0;
    let locationMultiplier = 1.0;

    if (staticData.trip.departure_time) {
        dateMultiplier = getDateMultiplier(staticData.trip.departure_time);
        if (dateMultiplier > 1.0) {
            console.log(`📅 WEEKEND/HOLIDAY: Price increased by ${dateMultiplier}x`);
        }
    }

    if(pickupId && dropId){
        const pId = Number(pickupId);
        const dId = Number(dropId);
        const pickupStop = staticData.stops.find((s:any) => s.stop_id === pId);
        const dropStop = staticData.stops.find((s:any) => s.stop_id === dId);

        if (pickupStop && dropStop) {
            
            
            const diff = Number(dropStop.price) - Number(pickupStop.price);
            routeFare = diff > 0 ? diff : 0;

          
            if (fromCity && toCity) {
                console.log(`🔎 Checking Demand using Search Context: '${fromCity}' -> '${toCity}'`);
                surgeMultiplier = getDynamicMultiplier(fromCity, toCity);
                locationMultiplier = getLocationMultiplier(fromCity, toCity);
            } 
            else {
                const pName = pickupStop.stop_name.split('(')[0].split('-')[0].trim();
                const dName = dropStop.stop_name.split('(')[0].split('-')[0].trim();
                
                console.log(`🔎 Fallback: Checking Demand using DB Names: '${pName}' -> '${dName}'`);
                surgeMultiplier = getDynamicMultiplier(pName, dName);
                locationMultiplier = getLocationMultiplier(pName, dName);
            }

            if(surgeMultiplier !== 1.0){
                console.log(`🔥 PRICE CHANGE: ${surgeMultiplier}x applied!`);
            }
        }
    }

    // --- STEP D: MAP SEATS ---
    const finalSeats = staticData.seats.map((seat: any) => {
        const baseTotal = Number(seat.price) + routeFare; // Now routeFare is correct
        const finalTotal = baseTotal * surgeMultiplier * dateMultiplier * locationMultiplier;
        
        return {
            ...seat,
            price: Math.round(finalTotal),
            status: bookedSeatIds.includes(seat.seat_id) ? 'Booked' : 'Available'
        };
    });

    const boardingPoints = staticData.stops
        .filter((s:any) => s.stop_type === 'Boarding' || s.stop_type === 'Both')
        .map((s:any) => ({ stop_id: s.stop_id, stop_name: s.stop_name, time: s.estimated_time }));

    const droppingPoints = staticData.stops
        .filter((s:any) => s.stop_type === 'Dropping' || s.stop_type === 'Both')
        .map((s:any) => ({ stop_id: s.stop_id, stop_name: s.stop_name, time: s.estimated_time }));

    return {
        trip_id: staticData.trip.trip_id,
        bus_id: staticData.trip.bus_id,
        bus_type: staticData.trip.bus_type,
        seats: finalSeats,
        boarding_points: boardingPoints,
        dropping_points: droppingPoints
    };
}