import express from 'express';
import cors from 'cors';
import { authRoutes } from './routes/auth.routes';
import { applicationRoutes } from './routes/application.routes';
import { courseRoutes } from './routes/course.routes';
import { profileRoutes } from './routes/profile.routes';
import { errorMiddleware } from './middleware/error.middleware';

const app = express();

app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/applications', applicationRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/profile', profileRoutes);

// Error handling
app.use(errorMiddleware);

export default app;