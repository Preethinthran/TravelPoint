import { addRatingRepo } from "../repositories/ratingRepository";
import { AddRatingRequest, RatingResponse } from "../types/index";

export const addRatingService = async (
    bookingId: number, 
    userId: number, 
    data: AddRatingRequest
): Promise<RatingResponse> => {
    
    // 1. Basic Input Validation
    if (!data.stars) {
        throw new Error("Star rating is required");
    }

    if (data.stars < 1 || data.stars > 5) {
        throw new Error("Stars must be between 1 and 5");
    }

    // 2. Call the Repository
    return await addRatingRepo(bookingId, userId, data.stars, data.review_text);
};