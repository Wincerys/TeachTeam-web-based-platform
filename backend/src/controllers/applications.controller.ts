import { Request, Response } from 'express';
import pool from '../config/database';
import { RowDataPacket, ResultSetHeader } from 'mysql2';

interface Application extends RowDataPacket {
  id: number;
  user_id: number;
  name: string;
  email: string;
  availability: string;
  course_code: string;
  role: string;
  experience?: number;
  qualifications?: string;
  phone_number: string;
  emergency_contact: string;
  emergency_phone: string;
  preferred_hours: string;
  // transport: string; // REMOVED
  previous_institutions: string;
  teaching_areas: string;
  motivation: string;
  references: string;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
}

export const submitApplication = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId; // From auth middleware
    const {
      availability,
      courseCode,
      role,
      experience,
      qualifications,
      phoneNumber,
      emergencyContact,
      emergencyPhone,
      preferredHours,
      // transport, // REMOVED
      previousInstitutions,
      teachingAreas,
      motivation,
      references
    } = req.body;

    // Get user info
    const [users] = await pool.query<RowDataPacket[]>(
      'SELECT first_name, last_name, email FROM users WHERE id = ?',
      [userId]
    );

    if (users.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const user = users[0];
    const name = `${user.first_name} ${user.last_name}`;

    // Check for existing application
    const [existing] = await pool.query<Application[]>(
      'SELECT id FROM applications WHERE user_id = ? AND course_code = ?',
      [userId, courseCode]
    );

    if (existing.length > 0) {
      return res.status(400).json({ error: 'You have already applied for this course' });
    }

    // Insert application (removed transport from query)
    const [result] = await pool.query<ResultSetHeader>(
    `INSERT INTO applications (
      user_id, name, email, availability, course_code, role, experience, qualifications,
      phone_number, emergency_contact, emergency_phone, preferred_hours,
      previous_institutions, teaching_areas, motivation, \`references\`
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        userId, name, user.email, availability, courseCode, role, experience || null, qualifications || null,
        phoneNumber, emergencyContact, emergencyPhone, preferredHours,
        previousInstitutions, teachingAreas, motivation, references
      ]
    );

    res.status(201).json({
      message: 'Application submitted successfully',
      applicationId: result.insertId
    });
  } catch (error) {
    console.error('Submit application error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getUserApplications = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;

    const [applications] = await pool.query<Application[]>(
      `SELECT a.*, c.name as course_name 
       FROM applications a 
       JOIN courses c ON a.course_code = c.code
       WHERE a.user_id = ? 
       ORDER BY a.created_at DESC`,
      [userId]
    );

    res.json({
      applications: applications.map(app => ({
        id: app.id,
        name: app.name,
        email: app.email,
        availability: app.availability,
        course_code: app.course_code,
        course_name: app.course_name,
        role: app.role,
        experience: app.experience,
        qualifications: app.qualifications,
        phone_number: app.phone_number,
        emergency_contact: app.emergency_contact,
        emergency_phone: app.emergency_phone,
        preferred_hours: app.preferred_hours,
        // transport: app.transport, // REMOVED
        previous_institutions: app.previous_institutions,
        teaching_areas: app.teaching_areas,
        motivation: app.motivation,
        references: app.references,
        status: app.status,
        created_at: app.created_at
      }))
    });
  } catch (error) {
    console.error('Get user applications error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getAllApplications = async (req: Request, res: Response) => {
  try {
    const [applications] = await pool.query<Application[]>(
      `SELECT a.*, c.name as course_name 
       FROM applications a 
       JOIN courses c ON a.course_code = c.code
       ORDER BY a.created_at DESC`
    );

    res.json({
      applications: applications.map(app => ({
        id: app.id,
        name: app.name,
        email: app.email,
        availability: app.availability,
        course_code: app.course_code,
        course_name: app.course_name,
        role: app.role,
        experience: app.experience,
        qualifications: app.qualifications,
        phone_number: app.phone_number,
        emergency_contact: app.emergency_contact,
        emergency_phone: app.emergency_phone,
        preferred_hours: app.preferred_hours,
        // transport: app.transport, // REMOVED
        previous_institutions: app.previous_institutions,
        teaching_areas: app.teaching_areas,
        motivation: app.motivation,
        references: app.references,
        status: app.status,
        created_at: app.created_at
      }))
    });
  } catch (error) {
    console.error('Get all applications error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};