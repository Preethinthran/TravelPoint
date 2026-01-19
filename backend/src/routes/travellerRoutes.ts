import { Router } from 'express';
import { addTraveller, getTravellers } from '../controllers/travellerController';
import { authenticateToken } from '../middlewares/authMiddleware';

const router = Router();


router.post('/travellers', authenticateToken, addTraveller);


router.get('/travellers', authenticateToken, getTravellers);

export default router;