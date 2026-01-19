import { findTrips, countTotalTrips } from '../repositories/searchRepository';
import { SearchBusQuery, BusSearchResult } from '../types';
import {trackSearchDemand, getDynamicMultiplier, getDateMultiplier, getLocationMultiplier} from '../utils/pricingEngine';

// Helper to format date (Keep this at the top)
const formatDate = (date: Date): string => {
    const d = new Date(date);
    const day = d.getDate();
    const suffix = ["th", "st", "nd", "rd"][(day % 10 > 3) ? 0 : Number(day % 100 - day % 10 != 10) * day % 10] || "th";
    const options: Intl.DateTimeFormatOptions = { month: 'short', year: 'numeric', hour: 'numeric', minute: 'numeric', hour12: true };
    return `${day}${suffix} ${d.toLocaleDateString('en-US', options)}`;
};

export const searchTripsService = async (
    query: SearchBusQuery & { page: number; limit: number }
) => {

    // Price Engine
    if(query.from && query.to){
        trackSearchDemand(query.from, query.to);
    }
    
    let multiplier = 1.0;
    let locationMultiplier = 1.0;

    if (query.from && query.to) {
        multiplier = getDynamicMultiplier(query.from, query.to);
        locationMultiplier = getLocationMultiplier(query.from, query.to);
    }

    let dateMultiplier = 1.0;
    if (query.date) {
        dateMultiplier = getDateMultiplier(query.date);
    }

    
    const [rawTrips, totalItems] = await Promise.all([
        findTrips(query),
        countTotalTrips(query)
    ]);

    const totalPages = Math.ceil(totalItems / query.limit);

    const formattedData: BusSearchResult[] = rawTrips.map(trip => {

        const TotalPrice = Number(trip.ticket_price) * multiplier * dateMultiplier * locationMultiplier;
        return{
        bus_name: trip.bus_number,
        bus_id: trip.bus_id,
        trip_id: trip.trip_id,
        trip_date: query.date,
        path_id: 0, 
        bus_type: trip.bus_type,
        rating: Number(trip.rating),
        
        boarding_points: trip.boarding_points,
        dropping_points: trip.dropping_points, 

        departure_time: formatDate(trip.departure_time),
        arrival_time: formatDate(trip.arrival_time),
        distance: Number(trip.trip_distance),
        price:Math.round(TotalPrice),
        available_seats: Number(trip.available_seats)
    }});

    return {
        meta: {
            total: totalItems,
            page: query.page,
            limit: query.limit,
            totalPages
        },
        data: formattedData
    };
};

