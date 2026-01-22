// src/types/index.ts

export interface User {
  id: number;
  first_name: string;
  last_name: string;
  username: string;
  email: string;
  password: string;
  role: 'tutor' | 'lecturer' | 'admin';
  is_blocked: boolean;
  created_at: string;
}

export interface Course {
  id: number;
  code: string;
  name: string;
  description?: string;
  is_active: boolean;
  created_at: string;
}

export interface Assignment {
  id: number;
  course_id: number;
  lecturer_id: number;
  semester: string;
  year: number;
  created_at: string;
}

export interface CourseInput {
  code: string;
  name: string;
  description?: string;
  isActive?: boolean;
}

export interface LoginInput {
  username: string;
  password: string;
}

export interface AuthPayload {
  token: string;
  user: UserResponse;
}

export interface UserResponse {
  id: string;
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  role: string;
  isBlocked: boolean;
  createdAt: string;
}

export interface CourseResponse {
  id: string;
  code: string;
  name: string;
  description?: string;
  isActive: boolean;
  lecturer?: UserResponse;
  lecturerId?: string;
  createdAt: string;
}

export interface AssignmentResponse {
  id: string;
  course: CourseResponse;
  lecturer: UserResponse;
  semester: string;
  year: number;
  createdAt: string;
}