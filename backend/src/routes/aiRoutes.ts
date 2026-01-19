import express from 'express';
import { chatWithAI, generateApiKey } from '../controllers/aiController';
import { authenticateToken } from '../middlewares/authMiddleware';

const router = express.Router();

router.post('/chat', authenticateToken, chatWithAI);
router.post('/generate-key', authenticateToken, generateApiKey);

export default router;