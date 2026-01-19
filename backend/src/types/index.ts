// src/types/index.ts
import { paths, components } from './api-contract';

// 1. Search Query Shortcut
export type SearchBusQuery = paths['/trips/search']['get']['parameters']['query'];

// 2. Search Result Item Shortcut
export type BusSearchResult = components['schemas']['BusSearchResult'];

// 3. Operator Manifest Shortcut (if you need it)
export type OperatorBusManifest = components['schemas']['OperatorBusManifest'];

export * from './api-contract';
export * from './bookingTypes';
export * from './auth';


export interface BusRequest {
    bus_number: string;
    operator_id: number;
    total_seats: number;
    bus_type: string;
}

export interface SeatUpdateGroup {
    seat_numbers: string[];
    price?: number;
    seat_type?: string;
    status?: string;
}

export interface UpdateSeatsRequest {
    updates: SeatUpdateGroup[];
}

export interface RouteStopRequest {
    stop_name: string;
    order_id: number;
    distance: number;
    price: number;
    estimated_time: string; // e.g. "2h 30m"
    stop_type: 'Boarding' | 'Dropping' | 'Both';
}

export interface RouteRequest {
    route_name: string;      // Changed from source/dest to route_name
    total_distance: number;
    estimated_time: string;
    stops: RouteStopRequest[];
}

// --- Trip Management Types ---

export interface TripRequest {
    bus_id: number;
    path_id: number;         // Matches your DB column 'path_id'
    departure_time: string;  // Input format: "2025-12-25T21:00:00Z"
    arrival_time: string;
    status?: 'Scheduled' | 'Cancelled' | 'Completed' | 'Live';
}

export interface SavedTraveller {
    traveller_id?: number;  // Optional for input, required for output
    user_id: number;        // Links to the logged-in user
    name: string;
    age: number;
    gender: string;
}

// ratingTypes.ts

export interface AddRatingRequest {
    stars: number;
    review_text?: string;
}

export interface RatingResponse {
    success: boolean;
    message: string;
    new_bus_rating: string; // Returning as string (e.g., "4.5") preserves decimal precision
}