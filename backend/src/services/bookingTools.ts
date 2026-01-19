import { pool } from "../config/config";

export const bookingTools = {
  getBookingDetails: async (bookingId: number) => {
    try {
      const query = `
        SELECT 
          b.booking_id, 
          b.booking_status, 
          b.amount_paid, 
          t.departure_time,   
          bus.bus_number, 
          bus.bus_type,
          r.route_name
        FROM bookings b
        JOIN trips t ON b.trip_id = t.trip_id
        JOIN bus ON t.bus_id = bus.bus_id           
        JOIN route r ON t.path_id = r.path_id       
        WHERE b.booking_id = ?
      `;

      // LOGGING: Print the ID we are searching for (helps debugging)
      console.log(`🔍 SQL: Searching for Booking ID ${bookingId}...`);

      const [rows]: any = await pool.execute(query, [bookingId]);
      
      if (rows.length === 0) {
        console.log("❌ No rows found.");
        return "No booking found with that ID.";
      }

      const row = rows[0];

      // Format the output for the AI
      return `
        Ticket Found:
        - Ticket ID: ${row.booking_id}
        - Status: ${row.booking_status}
        - Route: ${row.route_name}
        - Bus: ${row.bus_number} (${row.bus_type})
        - Date: ${new Date(row.departure_time).toLocaleString()}
        - Fare: ₹${row.amount_paid}
      `;

    } catch (e: any) {
      console.error("❌ SQL Error:", e.message);
      return `Database Error: ${e.message}`;
    }
  },

  /**
   * Book a Ticket (Matched to your Schema)
   */
  bookTicket: async (tripId: number, passengerId: number, pickupId: number, dropId: number, amount: number) => {
    try {
        const query = `
            INSERT INTO bookings 
            (trip_id, passenger_id, pickup_stop_id, drop_stop_id, amount_paid, booking_status, booking_date)
            VALUES (?, ?, ?, ?, ?, 'Confirmed', NOW())
        `;
        const [result]: any = await pool.execute(query, [tripId, passengerId, pickupId, dropId, amount]);
        return `✅ Success! Ticket booked. Booking ID: ${result.insertId}`;
    } catch (e: any) {
        console.error("❌ Booking SQL Error:", e.message);
        return `Booking Failed: ${e.message}`;
    }
  },

  /*SMART SEARCH: Handles "Source to Destination" queries*/
  searchTrips: async (queryText: string) => {
    try {
      // Try to parse "from X to Y" or "X to Y" pattern
      const toPattern = /(?:from\s+)?([a-zA-Z\s]+?)\s+to\s+([a-zA-Z\s]+)/i;
      const match = queryText.match(toPattern);

      let query: string;
      let params: string[];

      if (match) {
        // SOURCE-TO-DESTINATION SEARCH
        const source = match[1].trim();
        const destination = match[2].trim();

        console.log(`🔍 Searching: ${source} → ${destination}`);

        query = `
          SELECT DISTINCT
            t.trip_id, 
            t.departure_time, 
            t.arrival_time, 
            r.route_name,
            b.bus_number, 
            b.bus_type,
            s1.stop_name as source_stop,
            s1.order_id as source_order,
            s2.stop_name as dest_stop,
            s2.order_id as dest_order,
            GROUP_CONCAT(DISTINCT s.stop_name ORDER BY s.order_id SEPARATOR ' → ') as route_stops
          FROM trips t
          JOIN route r ON t.path_id = r.path_id
          JOIN bus b ON t.bus_id = b.bus_id
          JOIN stops s ON s.path_id = r.path_id
          JOIN stops s1 ON s1.path_id = r.path_id AND s1.stop_name LIKE ?
          JOIN stops s2 ON s2.path_id = r.path_id AND s2.stop_name LIKE ?
          WHERE 
            t.status = 'Scheduled'
            AND t.departure_time > NOW()
            AND s1.order_id < s2.order_id  -- Source must come BEFORE destination
          GROUP BY t.trip_id
          ORDER BY t.departure_time ASC
          LIMIT 10
        `;

        params = [`%${source}%`, `%${destination}%`];

      } else {
        // SIMPLE KEYWORD SEARCH (bus type, city name, etc.)
        console.log(`🔍 Keyword search: ${queryText}`);

        query = `
          SELECT DISTINCT
            t.trip_id, 
            t.departure_time, 
            t.arrival_time, 
            r.route_name,
            b.bus_number, 
            b.bus_type,
            GROUP_CONCAT(DISTINCT s.stop_name ORDER BY s.order_id SEPARATOR ' → ') as route_stops
          FROM trips t
          JOIN route r ON t.path_id = r.path_id
          JOIN bus b ON t.bus_id = b.bus_id
          JOIN stops s ON s.path_id = r.path_id
          WHERE 
            t.status = 'Scheduled'
            AND t.departure_time > NOW()
            AND (
              s.stop_name LIKE ? 
              OR b.bus_type LIKE ?
            )
          GROUP BY t.trip_id
          ORDER BY t.departure_time ASC
          LIMIT 10
        `;

        const searchTerm = `%${queryText}%`;
        params = [searchTerm, searchTerm];
      }

      const [rows]: any = await pool.execute(query, params);

      if (rows.length === 0) {
        return `❌ No upcoming trips found matching "${queryText}".\n\n💡 Tips:\n- For route search: "Dindigul to Coimbatore"\n- For bus type: "Sleeper" or "AC"\n- Check if trips are scheduled for future dates`;
      }

      // Format results
      return `🚌 Found ${rows.length} trip(s):\n\n` + 
        rows.map((trip: any, index: number) => 
          `${index + 1}. Trip #${trip.trip_id}\n` +
          `   Route: ${trip.route_stops}\n` +
          `   Bus: ${trip.bus_type} (${trip.bus_number})\n` +
          `   Departs: ${new Date(trip.departure_time).toLocaleString()}\n` +
          `   Arrives: ${new Date(trip.arrival_time).toLocaleString()}`
        ).join("\n\n");

    } catch (e: any) {
      console.error("❌ Search SQL Error:", e.message);
      return `Search failed: ${e.message}`;
    }
  },

  /* SMART CANCELLATION */
  cancelTicket: async (bookingId: number) => {
    try {
      // 1. Fetch Trip Details to check time
      const checkQuery = `
        SELECT b.booking_status, b.amount_paid, t.departure_time 
        FROM bookings b
        JOIN trips t ON b.trip_id = t.trip_id
        WHERE b.booking_id = ?
      `;
      const [rows]: any = await pool.execute(checkQuery, [bookingId]);

      if (rows.length === 0) return "Booking ID not found.";
      const ticket = rows[0];

      if (ticket.booking_status === 'Cancelled') {
        return "This ticket is already cancelled.";
      }

      // 2. Calculate Time Difference (in hours)
      const tripDate = new Date(ticket.departure_time);
      const now = new Date();
      const diffMs = tripDate.getTime() - now.getTime(); // Difference in milliseconds
      const hoursLeft = diffMs / (1000 * 60 * 60); // Convert to hours

      // 3. Calculate Refund Amount
      let refundPercent = 0;
      if (hoursLeft > 24) {
        refundPercent = 100;
      } else if (hoursLeft > 12) {
        refundPercent = 50;
      } else {
        refundPercent = 0;
      }

      const refundAmount = (ticket.amount_paid * refundPercent) / 100;

      // 4. Update Database
      const updateQuery = `
        UPDATE bookings 
        SET booking_status = 'Cancelled' 
        WHERE booking_id = ?
      `;
      await pool.execute(updateQuery, [bookingId]);

      // 5. Return the "Smart" Response
      return `✅ Ticket #${bookingId} Cancelled Successfully.\n` +
             `Time until trip: ${hoursLeft.toFixed(1)} hours.\n` +
             `Refund Policy Applied: ${refundPercent}%.\n` +
             `Refund Amount Processed: ₹${refundAmount}`;

    } catch (e: any) {
      console.error("❌ Cancellation Failed:", e.message);
      return `Cancellation failed: ${e.message}`;
    }
  }
};