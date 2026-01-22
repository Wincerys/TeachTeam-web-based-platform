import express from 'express';
import { submitApplication, getUserApplications, getAllApplications } from '../controllers/applications.controller';
import { authenticateToken } from '../middleware/auth.middleware';

const router = express.Router();

router.post('/submit', authenticateToken, submitApplication);
router.get('/user', authenticateToken, getUserApplications);
router.get('/', authenticateToken, getAllApplications);

export default router;
