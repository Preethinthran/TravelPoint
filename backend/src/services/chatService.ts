import ChatMessage from "../models/ChatMessage";

// 1. Save a new message
export const saveMessageService = async (room: string, message: string, senderRole: string) => {
    try {
        const newMsg = new ChatMessage({
            booking_id: Number(room), // Convert back to Number for DB if schema expects Number
            sender_role: senderRole,
            message: message,
            is_read: false
        });
        await newMsg.save();
        return newMsg;
    } catch (error) {
        console.error("Error in saveMessageService:", error);
        throw error;
    }
};

// 2. Get Chat History
export const getChatHistoryService = async (bookingId: string) => {
    try {
        // Convert string ID back to number for querying
        const id = Number(bookingId);
        return await ChatMessage.find({ booking_id: id }).sort({ created_at: 1 });
    } catch (error) {
        console.error("Error in getChatHistoryService:", error);
        return [];
    }
};

export const getActiveConversationsService = async () => {
    try {
        const conversations = await ChatMessage.aggregate([
            // 1. Sort all messages by new to old
            { $sort: { created_at: -1 } },

            // 2. Group by booking_id (This makes the list unique)
            {
                $group: {
                    _id: "$booking_id", // The Booking ID
                    lastMessage: { $first: "$message" }, // The newest message
                    lastSender: { $first: "$sender_role" },
                    lastTime: { $first: "$created_at" },
                    // Count how many messages are unread (optional, if you track is_read)
                    unreadCount: { 
                        $sum: { 
                            $cond: [
                                { 
                                    $and: [
                                        { $eq: ["$is_read", false] },
                                        { $eq: ["$sender_role", "passenger"] } // <--- ADD THIS
                                    ]
                                }, 
                                1, 
                                0
                            ] 
                        } 
                    }
                }
            },

            // 3. Sort the final list by the most recent activity
            { $sort: { lastTime: -1 } }
        ]);

        return conversations;
    } catch (error) {
        console.error("Error fetching active conversations:", error);
        return [];
    }
};

// ... existing imports ...

export const markMessagesAsReadService = async (bookingId: string | number, readerRole: string) => {
    try {
        const idParam = Number(bookingId);
        
        // Logic: If I am the Operator, mark all 'passenger' messages as read.
        // If I am the Passenger, mark all 'operator' messages as read.
        const senderRoleToTarget = readerRole.toLowerCase() === 'operator' ? 'passenger' : 'operator';

        await ChatMessage.updateMany(
            { 
                booking_id: idParam, 
                sender_role: senderRoleToTarget, // Only mark the OTHER person's messages
                is_read: false 
            },
            { 
                $set: { is_read: true } 
            }
        );
        console.log(`✅ Marked messages as read for Room ${idParam} by ${readerRole}`);
    } catch (error) {
        console.error("Error marking messages as read:", error);
    }
};