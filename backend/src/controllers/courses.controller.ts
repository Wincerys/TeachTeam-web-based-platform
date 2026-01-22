import { Request, Response } from 'express';
import pool from '../config/database';
import { RowDataPacket } from 'mysql2';

interface Course extends RowDataPacket {
  id: number;
  code: string;
  name: string;
  description: string;
  is_active: boolean;
}

export const getAllCourses = async (req: Request, res: Response) => {
  try {
    const [courses] = await pool.query<Course[]>(
      'SELECT id, code, name, description, is_active FROM courses WHERE is_active = 1 ORDER BY code'
    );

    res.json({
      courses: courses.map(course => ({
        id: course.id,
        code: course.code,
        name: course.name,
        description: course.description,
        is_active: course.is_active
      }))
    });
  } catch (error) {
    console.error('Get courses error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
