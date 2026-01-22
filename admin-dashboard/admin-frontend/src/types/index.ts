// src/types/index.ts

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  role: string;
  isBlocked: boolean;
  createdAt: string;
}

export interface Course {
  id: string;
  code: string;
  name: string;
  description?: string;
  isActive: boolean;
  lecturer?: User;
  lecturerId?: string;
  createdAt: string;
}

export interface Assignment {
  id: string;
  course: Course;
  lecturer: User;
  semester: string;
  year: number;
  createdAt: string;
}

export interface Application {
  id: string;
  user: User;
  name: string;
  email: string;
  availability: string;
  courseCode: string;
  courseName: string;
  role: string;
  experience?: number;
  qualifications?: string;
  phoneNumber: string;
  emergencyContact: string;
  emergencyPhone: string;
  preferredHours: string;
  transport: string;
  previousInstitutions: string;
  teachingAreas: string;
  motivation: string;
  references: string;
  status: string;
  createdAt: string;
}

export interface CourseReport {
  course: Course;
  chosenCandidates: Application[];
  totalApplicants: number;
  chosenCount: number;
}

export interface CourseInput {
  code: string;
  name: string;
  description?: string;
  isActive: boolean;
}

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface AuthPayload {
  token: string;
  user: User;
}