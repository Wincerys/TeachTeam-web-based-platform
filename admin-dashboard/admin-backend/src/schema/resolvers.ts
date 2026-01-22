// src/schema/resolvers.ts
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { db } from '../config/database.js';
import { Context } from '../server.js';
import { 
  User, 
  Course, 
  Assignment, 
  CourseInput, 
  LoginInput,
  UserResponse,
  CourseResponse,
  AssignmentResponse 
} from '../types/index.js';
import { RowDataPacket, ResultSetHeader } from 'mysql2';

const JWT_SECRET = process.env.JWT_SECRET || 'admin-secret-key';

// Helper function to require authentication
const requireAuth = (user?: Context['user']): void => {
  if (!user) {
    throw new Error('Authentication required');
  }
  if (user.role !== 'admin') {
    throw new Error('Admin access required');
  }
};

// Helper function to convert database user to response format
const formatUser = (user: User): UserResponse => ({
  id: user.id.toString(),
  firstName: user.first_name,
  lastName: user.last_name,
  username: user.username,
  email: user.email,
  role: user.role,
  isBlocked: user.is_blocked,
  createdAt: user.created_at
});

// Helper function to convert database course to response format
const formatCourse = (course: Course, lecturer?: User): CourseResponse => ({
  id: course.id.toString(),
  code: course.code,
  name: course.name,
  description: course.description,
  isActive: course.is_active,
  lecturer: lecturer ? formatUser(lecturer) : undefined,
  lecturerId: lecturer ? lecturer.id.toString() : undefined,
  createdAt: course.created_at
});

export const resolvers = {
  Query: {
    me: async (_: any, __: any, { user }: Context): Promise<UserResponse | null> => {
      requireAuth(user);
      const [rows] = await db.query<(User & RowDataPacket)[]>(
        'SELECT id, first_name, last_name, username, email, role, is_blocked, created_at FROM users WHERE id = ?',
        [user!.userId]
      );
      return rows[0] ? formatUser(rows[0]) : null;
    },

    users: async (_: any, __: any, { user }: Context): Promise<UserResponse[]> => {
      requireAuth(user);
      const [rows] = await db.query<(User & RowDataPacket)[]>(
        'SELECT id, first_name, last_name, username, email, role, is_blocked, created_at FROM users WHERE role != "admin" ORDER BY created_at DESC'
      );
      return rows.map(formatUser);
    },

    user: async (_: any, { id }: { id: string }, { user }: Context): Promise<UserResponse | null> => {
      requireAuth(user);
      const [rows] = await db.query<(User & RowDataPacket)[]>(
        'SELECT id, first_name, last_name, username, email, role, is_blocked, created_at FROM users WHERE id = ?',
        [id]
      );
      return rows[0] ? formatUser(rows[0]) : null;
    },

    courses: async (_: any, __: any, { user }: Context): Promise<CourseResponse[]> => {
      requireAuth(user);
      const [rows] = await db.query<(Course & User & RowDataPacket)[]>(`
        SELECT c.*, u.id as lecturer_id, u.first_name, u.last_name, u.username, u.email, u.role, u.is_blocked, u.created_at as lecturer_created_at
        FROM courses c 
        LEFT JOIN course_assignments ca ON c.id = ca.course_id 
        LEFT JOIN users u ON ca.lecturer_id = u.id 
        ORDER BY c.code
      `);
      
      return rows.map(row => {
        const course: Course = {
          id: row.id,
          code: row.code,
          name: row.name,
          description: row.description,
          is_active: row.is_active,
          created_at: row.created_at
        };

        const lecturer = row.lecturer_id ? {
          id: row.lecturer_id,
          first_name: row.first_name,
          last_name: row.last_name,
          username: row.username,
          email: row.email,
          role: row.role as 'lecturer',
          is_blocked: row.is_blocked,
          created_at: row.lecturer_created_at
        } : undefined;

        return formatCourse(course, lecturer);
      });
    },

    course: async (_: any, { id }: { id: string }, { user }: Context): Promise<CourseResponse | null> => {
      requireAuth(user);
      const [rows] = await db.query<(Course & RowDataPacket)[]>(
        'SELECT * FROM courses WHERE id = ?',
        [id]
      );
      return rows[0] ? formatCourse(rows[0]) : null;
    },

    assignments: async (_: any, __: any, { user }: Context): Promise<AssignmentResponse[]> => {
      requireAuth(user);
      const [rows] = await db.query<(Assignment & Course & User & RowDataPacket)[]>(`
        SELECT ca.*, c.code, c.name, c.description, c.is_active,
               u.first_name, u.last_name, u.username, u.email, u.role, u.is_blocked
        FROM course_assignments ca
        JOIN courses c ON ca.course_id = c.id
        JOIN users u ON ca.lecturer_id = u.id
        ORDER BY ca.year DESC, ca.semester, c.code
      `);
      
      return rows.map(row => ({
        id: row.id.toString(),
        course: {
          id: row.course_id.toString(),
          code: row.code,
          name: row.name,
          description: row.description,
          isActive: row.is_active,
          createdAt: row.created_at
        },
        lecturer: {
          id: row.lecturer_id.toString(),
          firstName: row.first_name,
          lastName: row.last_name,
          username: row.username,
          email: row.email,
          role: row.role,
          isBlocked: row.is_blocked,
          createdAt: row.created_at
        },
        semester: row.semester,
        year: row.year,
        createdAt: row.created_at
      }));
    },

    // Reports
    courseReports: async (_: any, __: any, { user }: Context) => {
      requireAuth(user);
      
      // Get all courses with their applications
      const [courseRows] = await db.query<(Course & RowDataPacket)[]>(`
        SELECT * FROM courses ORDER BY code
      `);
      
      const reports = [];
      
      for (const course of courseRows) {
        // Get all applications for this course
        const [applicationRows] = await db.query<(any & RowDataPacket)[]>(`
          SELECT a.*, u.first_name, u.last_name, u.username, u.email, u.role, u.is_blocked, u.created_at as user_created_at,
                 c.name as course_name
          FROM applications a
          JOIN users u ON a.user_id = u.id
          JOIN courses c ON a.course_code = c.code
          WHERE a.course_code = ?
          ORDER BY a.created_at DESC
        `, [course.code]);
        
        // Filter approved applications
        const chosenCandidates = applicationRows
          .filter(app => app.status === 'approved')
          .map(app => ({
            id: app.id.toString(),
            user: {
              id: app.user_id.toString(),
              firstName: app.first_name,
              lastName: app.last_name,
              username: app.username,
              email: app.email,
              role: app.role,
              isBlocked: app.is_blocked,
              createdAt: app.user_created_at
            },
            name: app.name,
            email: app.email,
            availability: app.availability,
            courseCode: app.course_code,
            courseName: app.course_name,
            role: app.role,
            experience: app.experience,
            qualifications: app.qualifications,
            phoneNumber: app.phone_number,
            emergencyContact: app.emergency_contact,
            emergencyPhone: app.emergency_phone,
            preferredHours: app.preferred_hours,
            transport: app.transport,
            previousInstitutions: app.previous_institutions,
            teachingAreas: app.teaching_areas,
            motivation: app.motivation,
            references: app.references,
            status: app.status,
            createdAt: app.created_at
          }));
        
        reports.push({
          course: formatCourse(course),
          chosenCandidates,
          totalApplicants: applicationRows.length,
          chosenCount: chosenCandidates.length
        });
      }
      
      return reports;
    },

    chosenCandidatesReport: async (_: any, __: any, { user }: Context) => {
      requireAuth(user);
      
      const [rows] = await db.query<(any & RowDataPacket)[]>(`
        SELECT a.*, u.first_name, u.last_name, u.username, u.email, u.role, u.is_blocked, u.created_at as user_created_at,
               c.name as course_name
        FROM applications a
        JOIN users u ON a.user_id = u.id
        JOIN courses c ON a.course_code = c.code
        WHERE a.status = 'approved'
        ORDER BY a.course_code, a.created_at DESC
      `);
      
      return rows.map(app => ({
        id: app.id.toString(),
        user: {
          id: app.user_id.toString(),
          firstName: app.first_name,
          lastName: app.last_name,
          username: app.username,
          email: app.email,
          role: app.role,
          isBlocked: app.is_blocked,
          createdAt: app.user_created_at
        },
        name: app.name,
        email: app.email,
        availability: app.availability,
        courseCode: app.course_code,
        courseName: app.course_name,
        role: app.role,
        experience: app.experience,
        qualifications: app.qualifications,
        phoneNumber: app.phone_number,
        emergencyContact: app.emergency_contact,
        emergencyPhone: app.emergency_phone,
        preferredHours: app.preferred_hours,
        transport: app.transport,
        previousInstitutions: app.previous_institutions,
        teachingAreas: app.teaching_areas,
        motivation: app.motivation,
        references: app.references,
        status: app.status,
        createdAt: app.created_at
      }));
    },

    unchosenCandidatesReport: async (_: any, __: any, { user }: Context) => {
      requireAuth(user);
      
      // Get users who have applied but have no approved applications
      const [rows] = await db.query<(any & RowDataPacket)[]>(`
        SELECT DISTINCT u.id as user_id, u.first_name, u.last_name, u.username, u.email, u.role, u.is_blocked, u.created_at as user_created_at,
               a.id, a.name, a.email as app_email, a.availability, a.course_code, a.role as app_role,
               a.experience, a.qualifications, a.phone_number, a.emergency_contact, a.emergency_phone,
               a.preferred_hours, a.transport, a.previous_institutions, a.teaching_areas, a.motivation,
               a.references, a.status, a.created_at,
               c.name as course_name
        FROM users u
        JOIN applications a ON u.id = a.user_id
        JOIN courses c ON a.course_code = c.code
        WHERE u.id NOT IN (
          SELECT DISTINCT user_id 
          FROM applications 
          WHERE status = 'approved'
        )
        ORDER BY u.last_name, u.first_name, a.course_code
      `);
      
      return rows.map(app => ({
        id: app.id.toString(),
        user: {
          id: app.user_id.toString(),
          firstName: app.first_name,
          lastName: app.last_name,
          username: app.username,
          email: app.email,
          role: app.role,
          isBlocked: app.is_blocked,
          createdAt: app.user_created_at
        },
        name: app.name,
        email: app.app_email,
        availability: app.availability,
        courseCode: app.course_code,
        courseName: app.course_name,
        role: app.app_role,
        experience: app.experience,
        qualifications: app.qualifications,
        phoneNumber: app.phone_number,
        emergencyContact: app.emergency_contact,
        emergencyPhone: app.emergency_phone,
        preferredHours: app.preferred_hours,
        transport: app.transport,
        previousInstitutions: app.previous_institutions,
        teachingAreas: app.teaching_areas,
        motivation: app.motivation,
        references: app.references,
        status: app.status,
        createdAt: app.created_at
      }));
    },

    applications: async (_: any, __: any, { user }: Context) => {
      requireAuth(user);
      
      const [rows] = await db.query<(any & RowDataPacket)[]>(`
        SELECT a.*, u.first_name, u.last_name, u.username, u.email, u.role, u.is_blocked, u.created_at as user_created_at,
               c.name as course_name
        FROM applications a
        JOIN users u ON a.user_id = u.id
        JOIN courses c ON a.course_code = c.code
        ORDER BY a.created_at DESC
      `);
      
      return rows.map(app => ({
        id: app.id.toString(),
        user: {
          id: app.user_id.toString(),
          firstName: app.first_name,
          lastName: app.last_name,
          username: app.username,
          email: app.email,
          role: app.role,
          isBlocked: app.is_blocked,
          createdAt: app.user_created_at
        },
        name: app.name,
        email: app.email,
        availability: app.availability,
        courseCode: app.course_code,
        courseName: app.course_name,
        role: app.role,
        experience: app.experience,
        qualifications: app.qualifications,
        phoneNumber: app.phone_number,
        emergencyContact: app.emergency_contact,
        emergencyPhone: app.emergency_phone,
        preferredHours: app.preferred_hours,
        transport: app.transport,
        previousInstitutions: app.previous_institutions,
        teachingAreas: app.teaching_areas,
        motivation: app.motivation,
        references: app.references,
        status: app.status,
        createdAt: app.created_at
      }));
    }
  },

  Mutation: {
    login: async (_: any, { username, password }: LoginInput) => {
      // Check for admin credentials
      if (username === 'admin' && password === 'admin') {
        const adminUser: UserResponse = {
          id: '1',
          firstName: 'Admin',
          lastName: 'User',
          username: 'admin',
          email: 'admin@teachteam.com',
          role: 'admin',
          isBlocked: false,
          createdAt: new Date().toISOString()
        };

        const token = jwt.sign(
          { userId: 1, username: 'admin', role: 'admin' },
          JWT_SECRET,
          { expiresIn: '24h' }
        );

        return {
          token,
          user: adminUser
        };
      }

      throw new Error('Invalid credentials');
    },

    blockUser: async (_: any, { id }: { id: string }, { user }: Context): Promise<UserResponse> => {
      requireAuth(user);
      await db.query('UPDATE users SET is_blocked = 1 WHERE id = ?', [id]);
      const [rows] = await db.query<(User & RowDataPacket)[]>(
        'SELECT id, first_name, last_name, username, email, role, is_blocked, created_at FROM users WHERE id = ?',
        [id]
      );
      return formatUser(rows[0]);
    },

    unblockUser: async (_: any, { id }: { id: string }, { user }: Context): Promise<UserResponse> => {
      requireAuth(user);
      await db.query('UPDATE users SET is_blocked = 0 WHERE id = ?', [id]);
      const [rows] = await db.query<(User & RowDataPacket)[]>(
        'SELECT id, first_name, last_name, username, email, role, is_blocked, created_at FROM users WHERE id = ?',
        [id]
      );
      return formatUser(rows[0]);
    },

    createCourse: async (_: any, { input }: { input: CourseInput }, { user }: Context): Promise<CourseResponse> => {
      requireAuth(user);
      const [result] = await db.query<ResultSetHeader>(
        'INSERT INTO courses (code, name, description, is_active) VALUES (?, ?, ?, ?)',
        [input.code, input.name, input.description || null, input.isActive]
      );
      
      const [rows] = await db.query<(Course & RowDataPacket)[]>('SELECT * FROM courses WHERE id = ?', [result.insertId]);
      return formatCourse(rows[0]);
    },

    updateCourse: async (_: any, { id, input }: { id: string; input: CourseInput }, { user }: Context): Promise<CourseResponse> => {
      requireAuth(user);
      await db.query(
        'UPDATE courses SET code = ?, name = ?, description = ?, is_active = ? WHERE id = ?',
        [input.code, input.name, input.description || null, input.isActive, id]
      );
      
      const [rows] = await db.query<(Course & RowDataPacket)[]>('SELECT * FROM courses WHERE id = ?', [id]);
      return formatCourse(rows[0]);
    },

    deleteCourse: async (_: any, { id }: { id: string }, { user }: Context): Promise<boolean> => {
      requireAuth(user);
      await db.query('DELETE FROM course_assignments WHERE course_id = ?', [id]);
      await db.query('DELETE FROM courses WHERE id = ?', [id]);
      return true;
    },

    assignLecturerToCourse: async (
      _: any, 
      { courseId, lecturerId, semester, year }: { courseId: string; lecturerId: string; semester: string; year: number }, 
      { user }: Context
    ): Promise<AssignmentResponse> => {
      requireAuth(user);
      
      // Check if assignment already exists
      const [existing] = await db.query<RowDataPacket[]>(
        'SELECT id FROM course_assignments WHERE course_id = ? AND lecturer_id = ? AND semester = ? AND year = ?',
        [courseId, lecturerId, semester, year]
      );
      
      if (existing.length > 0) {
        throw new Error('Assignment already exists for this semester');
      }
      
      const [result] = await db.query<ResultSetHeader>(
        'INSERT INTO course_assignments (course_id, lecturer_id, semester, year) VALUES (?, ?, ?, ?)',
        [courseId, lecturerId, semester, year]
      );
      
      // Fetch the created assignment with related data
      const [rows] = await db.query<(Assignment & Course & User & RowDataPacket)[]>(`
        SELECT ca.*, c.code, c.name, c.description, c.is_active,
               u.first_name, u.last_name, u.username, u.email, u.role, u.is_blocked
        FROM course_assignments ca
        JOIN courses c ON ca.course_id = c.id
        JOIN users u ON ca.lecturer_id = u.id
        WHERE ca.id = ?
      `, [result.insertId]);
      
      const row = rows[0];
      return {
        id: row.id.toString(),
        course: {
          id: row.course_id.toString(),
          code: row.code,
          name: row.name,
          description: row.description,
          isActive: row.is_active,
          createdAt: row.created_at
        },
        lecturer: {
          id: row.lecturer_id.toString(),
          firstName: row.first_name,
          lastName: row.last_name,
          username: row.username,
          email: row.email,
          role: row.role,
          isBlocked: row.is_blocked,
          createdAt: row.created_at
        },
        semester: row.semester,
        year: row.year,
        createdAt: row.created_at
      };
    },

    removeAssignment: async (_: any, { id }: { id: string }, { user }: Context): Promise<boolean> => {
      requireAuth(user);
      await db.query('DELETE FROM course_assignments WHERE id = ?', [id]);
      return true;
    }
  }
};