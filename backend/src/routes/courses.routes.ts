import express from 'express';
import { getAllCourses } from '../controllers/courses.controller';

const router = express.Router();

router.get('/', getAllCourses);

export default router;
