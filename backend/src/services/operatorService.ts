import { prisma } from "../prisma";
import { fetchBookingsInfoRaw, getOperatorTripsRepo, updateTripStatusRepo } from "../repositories/operatorRepository";
import { getActiveConversationsService } from "./chatService"; 
import { getTripDetailsForInbox, getPassengerNamesForInbox } from "../repositories/bookingRepository";

export const getBookingsInfoService = async (operatorId: number) => {
    const rawData = await fetchBookingsInfoRaw(operatorId);
    if(!rawData || rawData.length === 0 || !rawData[0].result){
        return {bus: []};
    }
    return rawData;
};

export const getOperatorTripsService = async (operatorId: number) => {
    const trips = await getOperatorTripsRepo(operatorId);
    return {
        success: true,
        data: trips
    };
};

export const updateTripStatusService = async (tripId: number, operatorId: number, status: string) => {
    // Basic validation of status strings
    const validStatuses = ['Scheduled', 'Live', 'Completed', 'Cancelled'];
    if (!validStatuses.includes(status)) {
        throw new Error("Invalid Status. Allowed: Scheduled, Live, Completed, Cancelled");
    }

    return await updateTripStatusRepo(tripId, operatorId, status);
};


export const getOperatorInboxService = async (operatorId: number) => {
    
    // 1. Ask ChatService for the raw conversations (MongoDB)
    const chats = await getActiveConversationsService();

    if (!chats || chats.length === 0) {
        return [];
    }

    // 2. Extract the IDs we need to look up
    const bookingIds = chats.map((c: any) => c._id);

    // 3. Ask BookingRepository for the details (MySQL)
    // We run these in parallel because they don't depend on each other
    const [passengerRecords, tripDetails] = await Promise.all([
        getPassengerNamesForInbox(bookingIds),
        getTripDetailsForInbox(bookingIds)
    ]);

    // 4. Merge the data (The "Business Logic")
    const enrichedChats = chats.map((chat: any) => {
        // A. Match Passenger Name
        const nameRecord = passengerRecords.find(p => p.booking_id === chat._id);
        const passengerName = nameRecord?.passenger_name || `Booking #${chat._id}`;

        // B. Match Trip Details
        const tripRecord = tripDetails.find((t: any) => t.booking_id === chat._id);
        
        // C. Format Route Name
        const routeName = (tripRecord?.start_loc && tripRecord?.end_loc) 
            ? `${tripRecord.start_loc} - ${tripRecord.end_loc}`
            : "Unknown Route";

        return {
            bookingId: chat._id,       
            lastMessage: chat.lastMessage,
            lastSender: chat.lastSender,
            lastTime: chat.lastTime,
            unreadCount: chat.unreadCount,
            passengerName: passengerName,
            tripDate: tripRecord?.departure_time || null,
            routeName: routeName
        };
    });

    return enrichedChats;
};