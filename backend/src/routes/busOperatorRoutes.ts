import { Router } from 'express';
import { createRoute, getMyRoutes } from '../controllers/routeController';
import { updateSeatLayout, getBusLayout } from '../controllers/seatController';
import {createTrip, getOperatorTrips} from '../controllers/tripController';
import { authenticateToken, authorizeOperator } from '../middlewares/authMiddleware';
const router = Router();

// Route: PUT /api/operator/buses/:bus_id/seats
// Secured: Only Operators can access
router.put('/buses/:bus_id/seats', authenticateToken, authorizeOperator, updateSeatLayout);

router.get('/buses/:bus_id/seats', authenticateToken, authorizeOperator, getBusLayout);

router.post('/routes',authenticateToken,authorizeOperator,createRoute);

router.get('/routes',authenticateToken,authorizeOperator,getMyRoutes);

router.post('/trips',authenticateToken,authorizeOperator,createTrip);

router.get('/trips',authenticateToken,authorizeOperator,getOperatorTrips);


export default router;