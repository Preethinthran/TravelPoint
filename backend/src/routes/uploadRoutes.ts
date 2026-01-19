import express from 'express';
import { uploadRouteCSV } from '../controllers/uploadController';
import { authenticateToken, authorizeOperator } from '../middlewares/authMiddleware'; // Check your path (middleware vs middlewares)
import { upload } from '../middlewares/uploadMiddleware';

const router = express.Router();

router.post(
  '/upload-csv', 
  authenticateToken,   
  authorizeOperator,   
  upload.single('file'), 
  uploadRouteCSV      
);

export default router;