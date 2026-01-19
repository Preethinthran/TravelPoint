"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.bookingTools = void 0;
var promise_1 = __importDefault(require("mysql2/promise"));
var dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
var pool = promise_1.default.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || 'your_password',
    database: process.env.DB_NAME || 'bus_reservation',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});
exports.bookingTools = {
    getBookingDetails: function (bookingId) { return __awaiter(void 0, void 0, void 0, function () {
        var query, rows, row, e_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    query = "\n        SELECT \n          b.booking_id, \n          b.booking_status, \n          b.amount_paid, \n          t.departure_time,   \n          bus.bus_number, \n          bus.bus_type,\n          r.route_name\n        FROM bookings b\n        JOIN trips t ON b.trip_id = t.trip_id\n        JOIN bus ON t.bus_id = bus.bus_id           \n        JOIN route r ON t.path_id = r.path_id       \n        WHERE b.booking_id = ?\n      ";
                    // LOGGING: Print the ID we are searching for (helps debugging)
                    console.log("\uD83D\uDD0D SQL: Searching for Booking ID ".concat(bookingId, "..."));
                    return [4 /*yield*/, pool.execute(query, [bookingId])];
                case 1:
                    rows = (_a.sent())[0];
                    if (rows.length === 0) {
                        console.log("❌ No rows found.");
                        return [2 /*return*/, "No booking found with that ID."];
                    }
                    row = rows[0];
                    // Format the output for the AI
                    return [2 /*return*/, "\n        Ticket Found:\n        - Ticket ID: ".concat(row.booking_id, "\n        - Status: ").concat(row.booking_status, "\n        - Route: ").concat(row.route_name, "\n        - Bus: ").concat(row.bus_number, " (").concat(row.bus_type, ")\n        - Date: ").concat(new Date(row.departure_time).toLocaleString(), "\n        - Fare: \u20B9").concat(row.amount_paid, "\n      ")];
                case 2:
                    e_1 = _a.sent();
                    console.error("❌ SQL Error:", e_1.message);
                    return [2 /*return*/, "Database Error: ".concat(e_1.message)];
                case 3: return [2 /*return*/];
            }
        });
    }); },
    /**
     * Book a Ticket (Matched to your Schema)
     */
    bookTicket: function (tripId, passengerId, pickupId, dropId, amount) { return __awaiter(void 0, void 0, void 0, function () {
        var query, result, e_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    query = "\n            INSERT INTO bookings \n            (trip_id, passenger_id, pickup_stop_id, drop_stop_id, amount_paid, booking_status, booking_date)\n            VALUES (?, ?, ?, ?, ?, 'Confirmed', NOW())\n        ";
                    return [4 /*yield*/, pool.execute(query, [tripId, passengerId, pickupId, dropId, amount])];
                case 1:
                    result = (_a.sent())[0];
                    return [2 /*return*/, "\u2705 Success! Ticket booked. Booking ID: ".concat(result.insertId)];
                case 2:
                    e_2 = _a.sent();
                    console.error("❌ Booking SQL Error:", e_2.message);
                    return [2 /*return*/, "Booking Failed: ".concat(e_2.message)];
                case 3: return [2 /*return*/];
            }
        });
    }); },
    /*NEW: Search for Trips*/
    searchTrips: function (queryText) { return __awaiter(void 0, void 0, void 0, function () {
        var query, searchTerm, rows, e_3;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    query = "\n        SELECT \n          t.trip_id, \n          t.departure_time, \n          t.arrival_time, \n          r.route_name, \n          r.total_distance,\n          b.bus_number, \n          b.bus_type, \n          b.total_seats\n        FROM trips t\n        JOIN route r ON t.path_id = r.path_id\n        JOIN bus b ON t.bus_id = b.bus_id\n        WHERE \n          (r.route_name LIKE ? OR b.bus_type LIKE ?)\n          AND t.status = 'Scheduled'\n        ORDER BY t.departure_time ASC\n        LIMIT 5\n      ";
                    searchTerm = "%".concat(queryText, "%");
                    return [4 /*yield*/, pool.execute(query, [searchTerm, searchTerm])];
                case 1:
                    rows = (_a.sent())[0];
                    if (rows.length === 0) {
                        return [2 /*return*/, "No upcoming trips found matching \"".concat(queryText, "\".")];
                    }
                    // Format the list of buses into a readable string for the AI
                    return [2 /*return*/, rows.map(function (trip) {
                            return "Trip ID: ".concat(trip.trip_id, " | Route: ").concat(trip.route_name, " | Bus: ").concat(trip.bus_type, " (").concat(trip.bus_number, ") | Departs: ").concat(new Date(trip.departure_time).toLocaleString());
                        }).join("\n")];
                case 2:
                    e_3 = _a.sent();
                    console.error("❌ Search SQL Error:", e_3.message);
                    return [2 /*return*/, "Search failed: ".concat(e_3.message)];
                case 3: return [2 /*return*/];
            }
        });
    }); },
    /* SMART CANCELLATION */
    cancelTicket: function (bookingId) { return __awaiter(void 0, void 0, void 0, function () {
        var checkQuery, rows, ticket, tripDate, now, diffMs, hoursLeft, refundPercent, refundAmount, updateQuery, e_4;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 3, , 4]);
                    checkQuery = "\n        SELECT b.booking_status, b.amount_paid, t.departure_time \n        FROM bookings b\n        JOIN trips t ON b.trip_id = t.trip_id\n        WHERE b.booking_id = ?\n      ";
                    return [4 /*yield*/, pool.execute(checkQuery, [bookingId])];
                case 1:
                    rows = (_a.sent())[0];
                    if (rows.length === 0)
                        return [2 /*return*/, "Booking ID not found."];
                    ticket = rows[0];
                    if (ticket.booking_status === 'Cancelled') {
                        return [2 /*return*/, "This ticket is already cancelled."];
                    }
                    tripDate = new Date(ticket.departure_time);
                    now = new Date();
                    diffMs = tripDate.getTime() - now.getTime();
                    hoursLeft = diffMs / (1000 * 60 * 60);
                    refundPercent = 0;
                    if (hoursLeft > 24) {
                        refundPercent = 100;
                    }
                    else if (hoursLeft > 12) {
                        refundPercent = 50;
                    }
                    else {
                        refundPercent = 0;
                    }
                    refundAmount = (ticket.amount_paid * refundPercent) / 100;
                    updateQuery = "\n        UPDATE bookings \n        SET booking_status = 'Cancelled' \n        WHERE booking_id = ?\n      ";
                    return [4 /*yield*/, pool.execute(updateQuery, [bookingId])];
                case 2:
                    _a.sent();
                    // 5. Return the "Smart" Response
                    return [2 /*return*/, "\u2705 Ticket #".concat(bookingId, " Cancelled Successfully.\n") +
                            "Time until trip: ".concat(hoursLeft.toFixed(1), " hours.\n") +
                            "Refund Policy Applied: ".concat(refundPercent, "%.\n") +
                            "Refund Amount Processed: \u20B9".concat(refundAmount)];
                case 3:
                    e_4 = _a.sent();
                    console.error("❌ Cancellation Failed:", e_4.message);
                    return [2 /*return*/, "Cancellation failed: ".concat(e_4.message)];
                case 4: return [2 /*return*/];
            }
        });
    }); }
};
