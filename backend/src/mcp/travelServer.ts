import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { pool } from "../config/config"; 
import { bookingTools } from "../services/bookingTools";

const server = new McpServer({
  name: "TravelPoint-Agent",
  version: "1.0.0",
});

// --- HELPER: AUTHENTICATION CHECK ---
// --- HELPER: AUTHENTICATION CHECK ---
async function getAuthenticatedUser() {
  const apiKey = process.env.TRAVEL_API_KEY;

  if (!apiKey) {
    throw new Error("❌ Configuration Error: TRAVEL_API_KEY is missing.");
  }

  // --- NEW: EXPIRATION CHECK (Pure Logic) ---
  // 1. Check if it matches our new format (trv_timestamp_random)
  const parts = apiKey.split('_');
  
  // If it has 3 parts (trv, timestamp, random), we check the date
  if (parts.length === 3) {
    const expiryTimestamp = parseInt(parts[1], 10);
    const currentTimestamp = Math.floor(Date.now() / 1000);

    if (!isNaN(expiryTimestamp)) {
      if (currentTimestamp > expiryTimestamp) {
        throw new Error(`❌ Access Denied: Your API Key expired on ${new Date(expiryTimestamp * 1000).toLocaleString()}. Please generate a new one.`);
      }
    }
  }
  // (If it doesn't match the format, we assume it's an old permanent key and skip date check)

  // --- EXISTING: DATABASE CHECK ---
  // 2. If date is okay, check if it exists in DB
  const query = "SELECT * FROM users WHERE api_key = ?";
  const [rows]: any = await pool.execute(query, [apiKey]);

  if (rows.length === 0) {
    throw new Error("❌ Access Denied: API Key is invalid.");
  }

  return rows[0]; 
}

// --- TOOL 1: GET BOOKING (FIXED) ---
server.tool(
  "get_booking_details",
  { bookingId: z.number() },
  async ({ bookingId }) => {
    try {
      // 1. Silent Auth
      const user = await getAuthenticatedUser();

      // 2. FIXED QUERY: Using correct column names from schema
      const query = `
        SELECT 
          b.booking_id, 
          b.booking_status,
          b.amount_paid,
          b.booking_date,
          t.departure_time, 
          t.arrival_time, 
          t.status as trip_status,
          GROUP_CONCAT(bs.seat_number) as seat_numbers
        FROM bookings b
        JOIN trips t ON b.trip_id = t.trip_id
        LEFT JOIN booked_seats bs ON bs.booking_id = b.booking_id
        WHERE b.booking_id = ? AND b.passenger_id = ?
        GROUP BY b.booking_id
      `;
      
      const [rows]: any = await pool.execute(query, [bookingId, user.user_id]);

      if (rows.length === 0) {
        return { content: [{ type: "text", text: `❌ Ticket #${bookingId} not found under your account.` }] };
      }

      // 3. Format the result
      const ticket = rows[0];
      const resultText = `
🎫 Ticket Details:
- Booking ID: ${ticket.booking_id}
- Status: ${ticket.booking_status}
- Seats: ${ticket.seat_numbers || 'N/A'}
- Amount Paid: ₹${ticket.amount_paid}
- Booked On: ${new Date(ticket.booking_date).toLocaleString()}
- Departure: ${new Date(ticket.departure_time).toLocaleString()}
- Arrival: ${new Date(ticket.arrival_time).toLocaleString()}
- Trip Status: ${ticket.trip_status}
      `;

      return { content: [{ type: "text", text: resultText }] };

    } catch (error: any) {
      return { content: [{ type: "text", text: "❌ Database Error: " + error.message }] };
    }
  }
);

// --- TOOL 2: SEARCH TRIPS (PUBLIC) ---
server.tool(
  "search_trips",
  { 
    query: z.string().describe("The city name or bus type") 
  },
  async ({ query }) => {
    const result = await bookingTools.searchTrips(query);
    return { content: [{ type: "text", text: result }] };
  }
);

// --- TOOL 3: BOOK TICKET (AUTHENTICATED) ---
server.tool(
  "book_ticket",
  { 
    tripId: z.number().describe("The trip ID to book"),
    pickupId: z.number().describe("The pickup stop ID"),
    dropId: z.number().describe("The drop stop ID"),
    amount: z.number().describe("The amount to pay")
  },
  async ({ tripId, pickupId, dropId, amount }) => {
    try {
      // 1. Authenticate the user
      const user = await getAuthenticatedUser();

      // 2. Call the booking function
      const result = await bookingTools.bookTicket(
        tripId,
        user.user_id,
        pickupId,
        dropId,
        amount
      );
      
      return { content: [{ type: "text", text: result }] };

    } catch (error: any) {
      return { content: [{ type: "text", text: "❌ Booking Error: " + error.message }] };
    }
  }
);

// --- TOOL 4: CANCEL BOOKING (AUTHENTICATED) ---
server.tool(
  "cancel_booking",
  { 
    bookingId: z.number().describe("The booking ID to cancel")
  },
  async ({ bookingId }) => {
    try {
      // 1. Authenticate the user
      const user = await getAuthenticatedUser();

      // 2. Verify the booking belongs to this user
      const checkQuery = "SELECT passenger_id FROM bookings WHERE booking_id = ?";
      const [rows]: any = await pool.execute(checkQuery, [bookingId]);

      if (rows.length === 0) {
        return { content: [{ type: "text", text: `❌ Booking #${bookingId} not found.` }] };
      }

      if (rows[0].passenger_id !== user.user_id) {
        return { content: [{ type: "text", text: `❌ Access denied. This booking doesn't belong to you.` }] };
      }

      // 3. Call the existing cancelTicket function with smart refund logic
      const result = await bookingTools.cancelTicket(bookingId);
      
      return { content: [{ type: "text", text: result }] };

    } catch (error: any) {
      return { content: [{ type: "text", text: "❌ Cancellation Error: " + error.message }] };
    }
  }
);

async function run() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("MCP Server running with 4 tools (get_booking_details, search_trips, book_ticket, cancel_booking)...");
}

run().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});