import express from 'express';
import { getProfile } from '../controllers/auth.controller';
import { authenticateToken } from '../middleware/auth.middleware';

const router = express.Router();

router.get('/profile', authenticateToken, getProfile);

export default router;
