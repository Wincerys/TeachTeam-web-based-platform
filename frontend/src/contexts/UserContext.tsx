import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authAPI, handleApiError } from '../services/api';

interface User {
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

interface UserContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  setUser: (user: User | null) => void;
  login: (email: string, password: string) => Promise<User>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

interface UserProviderProps {
  children: ReactNode;
}

export const UserProvider: React.FC<UserProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check authentication status on mount
  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setUser(null);
        setIsLoading(false);
        return;
      }

      // Try to get user profile from backend
      const userData = await authAPI.getProfile();
      setUser(userData);
    } catch (error: any) {
      console.error('Auth check failed:', error);
      
      // If user is blocked, show specific message
      if (error.response?.status === 403) {
        alert('Your account has been blocked. Please contact the administrator.');
      }
      
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string): Promise<User> => {
    try {
      const { user, token } = await authAPI.signin({ email, password });
      
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      setUser(user);
      
      return user;
    } catch (error: any) {
      // Handle blocked user error specifically
      if (error.response?.status === 403) {
        throw new Error('Your account has been blocked. Please contact the administrator.');
      }
      
      const errorMessage = handleApiError(error);
      throw new Error(errorMessage);
    }
  };

  const logout = async () => {
    try {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      setUser(null);
    } catch (error) {
      console.error('Logout failed:', error);
      // Still clear user state even if request fails
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      setUser(null);
    }
  };

  const refreshUser = async () => {
    await checkAuthStatus();
  };

  const value: UserContextType = {
    user,
    isLoading,
    isAuthenticated: !!user,
    setUser,
    login,
    logout,
    refreshUser,
  };

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = (): UserContextType => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};
