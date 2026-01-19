import { Router } from 'express';
import { addOperator, getOperators } from '../controllers/adminController';
import { addBus } from '../controllers/addBusController';
import { authenticateToken, authorizeAdmin } from '../middlewares/authMiddleware';

const router = Router();


router.post('/add-operator', authenticateToken, authorizeAdmin, addOperator);
router.get('/operators', authenticateToken, authorizeAdmin, getOperators);
router.post('/add-bus', authenticateToken, authorizeAdmin, addBus);

export default router;