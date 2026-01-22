// frontend/src/services/api.ts
import axios, { AxiosResponse } from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle token expiration
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 || error.response?.status === 403) {
      // Token expired or invalid
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/signin';
    }
    return Promise.reject(error);
  }
);

// Types
export interface User {
  id: number;
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  role: 'tutor' | 'lecturer';
  dateJoined: string;
  bio?: string;
  phoneNumber?: string;
  location?: string;
}

export interface SignupData {
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  password: string;
  role: 'tutor' | 'lecturer';
}

export interface SigninData {
  email: string;
  password: string;
}

export interface Course {
  id: number;
  code: string;
  name: string;
  description: string;
  is_active: boolean;
}

export interface Application {
  id: number;
  name: string;
  email: string;
  availability: 'full-time' | 'part-time';
  course_code: string;
  course_name: string;
  role: 'tutor' | 'lab-assistant';
  experience?: number;
  qualifications?: string;
  phone_number: string;
  emergency_contact: string;
  emergency_phone: string;
  preferred_hours: string;
  transport: 'own-car' | 'public-transport' | 'walking' | 'cycling' | 'other';
  previous_institutions: string;
  teaching_areas: string;
  motivation: string;
  references: string;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
}

export interface ApplicationFormData {
  availability: 'full-time' | 'part-time';
  courseCode: string;
  role: 'tutor' | 'lab-assistant';
  experience?: number;
  qualifications?: string;
  phoneNumber: string;
  emergencyContact: string;
  emergencyPhone: string;
  preferredHours: string;
  transport: 'own-car' | 'public-transport' | 'walking' | 'cycling' | 'other';
  previousInstitutions: string;
  teachingAreas: string;
  motivation: string;
  references: string;
}

// Auth API
export const authAPI = {
  signup: async (data: SignupData): Promise<{ user: User; token: string }> => {
    const response: AxiosResponse<{ user: User; token: string }> = await api.post('/auth/signup', data);
    return response.data;
  },

  signin: async (data: SigninData): Promise<{ user: User; token: string }> => {
    const response: AxiosResponse<{ user: User; token: string }> = await api.post('/auth/signin', data);
    return response.data;
  },

  getProfile: async (): Promise<User> => {
    const response: AxiosResponse<User> = await api.get('/auth/profile');
    return response.data;
  },

  updateProfile: async (data: Partial<User>): Promise<User> => {
    const response: AxiosResponse<User> = await api.put('/auth/profile', data);
    return response.data;
  }
};

// Courses API
export const coursesAPI = {
  getAll: async (): Promise<Course[]> => {
    const response: AxiosResponse<{ courses: Course[] }> = await api.get('/courses');
    return response.data.courses;
  }
};

// Applications API
export const applicationsAPI = {
  submit: async (data: ApplicationFormData): Promise<{ message: string }> => {
    const response: AxiosResponse<{ message: string }> = await api.post('/applications/submit', data);
    return response.data;
  },

  getUserApplications: async (): Promise<Application[]> => {
    const response: AxiosResponse<{ applications: Application[] }> = await api.get('/applications/user');
    return response.data.applications;
  },

  getAll: async (): Promise<Application[]> => {
    const response: AxiosResponse<{ applications: Application[] }> = await api.get('/applications');
    return response.data.applications;
  },

  updateStatus: async (id: number, status: 'approved' | 'rejected'): Promise<{ message: string }> => {
    const response: AxiosResponse<{ message: string }> = await api.put(`/applications/${id}/status`, { status });
    return response.data;
  }
};

// Error handling utility
export const handleApiError = (error: any): string => {
  if (error.response?.data?.error) {
    return error.response.data.error;
  }
  if (error.response?.data?.message) {
    return error.response.data.message;
  }
  if (error.message) {
    return error.message;
  }
  return 'An unexpected error occurred';
};

export default api;