import { Server, Socket } from "socket.io";
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client'; 
import { saveMessageService, getChatHistoryService, markMessagesAsReadService } from "../services/chatService";
import { updateBusLocationService, getLastKnownLocationService } from "../services/trackingService";

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'your_super_secret_key';

interface AuthSocket extends Socket {
    user?: {
        id: number;
        role: string;
    }
}

export const setupSocketIO = (io: Server) => {

    // ---------------------------------------------------------
    // 1. MIDDLEWARE: The "Bouncer" (Authentication)
    // ---------------------------------------------------------
    io.use((socket: AuthSocket, next) => {
        const token = socket.handshake.auth.token;

        if (!token) {
            return next(new Error("Authentication error: No token provided"));
        }

        try {
            const decoded = jwt.verify(token, JWT_SECRET) as any;
            
            // --- DEBUG LOG: SEE WHAT IS IN THE TOKEN ---
            console.log("🔑 Decoded Token Data:", decoded);

            // Attach user info to the socket session
            socket.user = {
                // Check all common ID fields
                id: decoded.id || decoded.userId || decoded.user_id, 
                
                // FIX: Check all common Role fields. 
                // If none found, fallback to 'passenger' ONLY if you are sure.
                role: decoded.role || decoded.user_role || decoded.UserRole || 'passenger'
            };
            
            next();
        } catch (err) {
            return next(new Error("Authentication error: Invalid token"));
        }
    });

    // ---------------------------------------------------------
    // 2. CONNECTION HANDLER
    // ---------------------------------------------------------
    io.on('connection', (socket: AuthSocket) => {
        console.log(`⚡ Client Connected: ${socket.id} (User ID: ${socket.user?.id}, Role: ${socket.user?.role})`);

        // EVENT: JOIN ROOM
        socket.on('join_room', async (bookingId) => {
            const roomName = String(bookingId);
            const userId = socket.user?.id;
            const userRole = socket.user?.role;

            if (!userId) return;

            try {
                let isAuthorized = false;

                // FIX: Loosened check to allow 'admin' or 'operator'
                if (userRole === 'operator' || userRole === 'admin') {
                    isAuthorized = true; 
                } else {
                    const booking = await prisma.bookings.findFirst({
                        where: {
                            booking_id: Number(bookingId),
                            passenger_id: userId 
                        }
                    });

                    if (booking) isAuthorized = true;
                }

                if (!isAuthorized) {
                    console.log(`⛔ Unauthorized join attempt by User ${userId} (${userRole}) for Room ${roomName}`);
                    socket.emit('error', 'You are not authorized to join this chat.');
                    return;
                }

                socket.join(roomName);
                console.log(`✅ User ${userId} (${userRole}) joined Room: ${roomName}`);

                const history = await getChatHistoryService(roomName);
                socket.emit('load_chat_history', history);

            } catch (error) {
                console.error("Authorization check failed:", error);
                socket.emit('error', 'Internal server error verifying access');
            }
        });

        // EVENT: SEND MESSAGE
        socket.on('send_message', async (data) => {
            // FIX: Trust the socket.user.role we extracted in middleware
            const realRole = data.sender_role || socket.user?.role || 'passenger';

            console.log(`Message in Room ${data.room} from ${realRole}: ${data.message}`);

            const savedMsg = await saveMessageService(data.room, data.message, realRole);

            io.to(String(data.room)).emit('receive_message', savedMsg);
        });

        socket.on('mark_messages_as_read', async (bookingId) => {
            const userId = socket.user?.id;
            // Ensure we use the correct role logic we fixed earlier
            const userRole = socket.user?.role || 'passenger';

            if (userId) {
                await markMessagesAsReadService(bookingId, userRole);
                
                // Optional: Tell the room "Messages were read" (for blue ticks in future)
                // io.to(String(bookingId)).emit('messages_were_read');
            }
        });

        socket.on('join_tracking', async (tripId) => {
            const roomName = `tracking_${tripId}`;
            socket.join(roomName);
            
            // Send immediate update so map isn't blank
            const lastLocation = await getLastKnownLocationService(Number(tripId));
            if (lastLocation) {
                socket.emit('receive_location', lastLocation);
            }
        });

        socket.on('send_location', async (data) => {
            // Security: Only Operator can drive the bus
            if (socket.user?.role !== 'operator') return;

            const { tripId, lat, lng, heading, speed } = data;
            
            if (tripId && lat && lng) {
                // A. Save to DB
                await updateBusLocationService(tripId, lat, lng, heading, speed);
                
                // B. Broadcast to Passengers
                io.to(`tracking_${tripId}`).emit('receive_location', {
                    trip_id: tripId,
                    latitude: lat,
                    longitude: lng,
                    heading: heading,
                    speed: speed
                });
            }
        });

        socket.on('disconnect', () => {
            console.log(`User Disconnected ${socket.id}`);
        });
    });
};