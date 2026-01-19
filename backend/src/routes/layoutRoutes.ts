import { Router } from 'express';
import { getTripLayout } from '../controllers/layoutController';

const router = Router();

// Define the route: GET /api/trips/:trip_id/layout
router.get('/:trip_id/layout', getTripLayout);

export default router;