import{ prisma } from "../prisma";
import { CreateBookingRequest, CreateBookingResponse, CancelBookingResponse } from "../types/bookingTypes";
import { createBooking, cancelBooking } from "../repositories/bookingRepository";
import { Prisma } from "@prisma/client";

export const createBookingService = async (
    data: CreateBookingRequest
): Promise<CreateBookingResponse> => {
    const stopsCheck = await prisma.$queryRaw<{stop_id: Number, order_id:number}[]>`
        Select stop_id, order_id
        From stops 
        where stop_id in (${data.pickup_stop_id}, ${data.drop_stop_id})
    `;

    if (stopsCheck.length !==2 ){
        throw new Error("Invalid Stops");
    }
    const pickup = stopsCheck.find(stop => stop.stop_id === data.pickup_stop_id);
    const drop = stopsCheck.find(stop => stop.stop_id === data.drop_stop_id);
    if (!pickup || !drop || pickup.order_id >= drop.order_id){
        throw new Error("Dropping stops should be after Pickup stops");
    }


   const result = await createBooking(data.user_id,data);
    return {
        success: true,
        booking_id: result.booking_id,
        ticket_id: `TKT-${result.booking_id}`,
        status: "Confirmed",
        total_amount: result.total_amount,
        message: "Booking Confirmed Successfully!"
    };
}

export const cancelBookingService = async (
    bookingId: number, 
    userId: number
): Promise<CancelBookingResponse> => {
    const result = await cancelBooking(bookingId, userId);
    return result;
};