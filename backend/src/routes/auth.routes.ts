import express from 'express';
import { signup, signin, getProfile } from '../controllers/auth.controller';
import { authenticateToken } from '../middleware/auth.middleware';

const router = express.Router();

router.post('/signup', signup);
router.post('/signin', signin);
router.get('/profile', authenticateToken, getProfile);
router.get('/me', authenticateToken, getProfile); // ADD THIS LINE - missing /me endpoint

export default router;