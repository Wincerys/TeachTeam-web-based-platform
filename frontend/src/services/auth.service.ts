import api from './api';

export interface User {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  username: string;
  role: 'tutor' | 'lecturer';
  dateJoined: string;
}

export const authService = {
  signin: async (email: string, password: string) => {
    const response = await api.post('/auth/signin', { email, password });
    return response.data;
  },

  signup: async (data: {
    firstName: string;
    lastName: string;
    username: string;
    email: string;
    password: string;
    role: string;
  }) => {
    const response = await api.post('/auth/signup', data);
    return response.data;
  },

  logout: async () => {
    await api.post('/auth/logout');
  },

  getMe: async () => {
    const response = await api.get('/auth/me');
    return response.data;
  }
};