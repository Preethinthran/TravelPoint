import {Router} from "express";
import { createBooking, cancelBooking } from "../controllers/bookingController";
import { getUserHistoryController } from "../controllers/historyController";
import { addRating } from "../controllers/ratingController";
import { authenticateToken } from "../middlewares/authMiddleware";
const router = Router();

router.post("/", createBooking);
router.get("/user/:user_id", getUserHistoryController);
router.patch('/:booking_id/cancel', authenticateToken, cancelBooking);
router.post('/:booking_id/rate', authenticateToken, addRating);

export default router;
