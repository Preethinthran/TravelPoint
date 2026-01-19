import { Router } from "express";
import { getBookingsInfo, getOperatorTrips, updateTripStatus, getOperatorInbox } from "../controllers/operatorController";
import { getOperatorBuses } from "../controllers/addBusController";
import { authenticateToken } from "../middlewares/authMiddleware";
import { getTripPassengers } from "../controllers/tripController";

const router = Router();

router.get("/getBookingsInfo",authenticateToken, getBookingsInfo);
router.get("/operator/buses", authenticateToken, getOperatorBuses);
router.get('/operator/trips', authenticateToken, getOperatorTrips);
router.patch('/operator/trips/:trip_id/status', authenticateToken, updateTripStatus);
router.get('/operator/trips/:trip_id/passengers',authenticateToken,getTripPassengers);

router.get('/operator/inbox', authenticateToken, getOperatorInbox);

export default router;