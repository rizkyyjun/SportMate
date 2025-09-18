import React, { createContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { api } from '../services/api';
import { User } from '../types';
import { socketService } from '../services/socket.service';

export interface AuthContextType {
  userToken: string | null;
  user: User | null;
  login: (token: string, userData: User) => Promise<void>; // Modified login to accept user data
  logout: () => void;
  isLoading: boolean;
  updateUser: (data: { name?: string; profilePicture?: string }) => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [userToken, setUserToken] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchUser = async (token: string) => {
    try {
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      const response = await api.get('/auth/me');
      setUser(response.data.data.user);
      api.defaults.headers.common['x-user-id'] = response.data.data.user.id; // Set x-user-id
    } catch (error) {
      console.error('Failed to fetch user data:', error);
      setUserToken(null);
      await AsyncStorage.removeItem('token');
    }
  };

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = await AsyncStorage.getItem('token');
        if (token) {
          setUserToken(token);
          await fetchUser(token);
          socketService.connect(token); // Connect socket on initial auth check
        }
      } catch (error) {
        console.error('Failed to check auth status:', error);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = async (token: string, userData: User) => {
    try {
      await AsyncStorage.setItem('token', token);
      setUserToken(token);
      setUser(userData);
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      api.defaults.headers.common['x-user-id'] = userData.id;
      socketService.connect(token); // Connect socket on login
    } catch (error) {
      console.error('Failed to save token or user data:', error);
    }
  };

  const logout = async () => {
    try {
      await AsyncStorage.removeItem('token');
      setUser(null);
      setUserToken(null);
      delete api.defaults.headers.common['Authorization'];
      delete api.defaults.headers.common['x-user-id'];
      socketService.disconnect(); // Disconnect socket on logout
    } catch (error) {
      console.error('Failed to remove token:', error);
    }
  };

  const updateUser = async (data: { name?: string; profilePicture?: string }) => {
    try {
      const response = await api.put('/users/profile', data);
      setUser(response.data);
    } catch (error) {
      console.error('Failed to update user:', error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{ userToken, user, login, logout, isLoading, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};
