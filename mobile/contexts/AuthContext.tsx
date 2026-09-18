import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { User, AuthResponse } from '../types';
import authService from '../services/authService';
import userService from '../services/userService';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  quickDemoLogin: () => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoading: true,
  isAuthenticated: false,
  login: async () => {},
  register: async () => {},
  quickDemoLogin: async () => {},
  logout: async () => {},
  refreshUser: async () => {},
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const token = await AsyncStorage.getItem('access_token');
      if (token) {
        if (token === 'demo-token') {
          setUser({
            id: 'demo-user-1',
            name: 'Talan Levin',
            email: 'demo.athlete@example.com',
            avatar_url:
              'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&auto=format&fit=crop&q=80',
            profile: null,
            assessment_completed: true,
            created_at: new Date().toISOString(),
          });
        } else {
          const userData = await userService.getProfile();
          setUser(userData);
        }
      }
    } catch (error) {
      await AsyncStorage.removeItem('access_token');
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    const response: AuthResponse = await authService.login(email, password);
    await AsyncStorage.setItem('access_token', response.access_token);
    setUser(response.user);
  };

  const register = async (name: string, email: string, password: string) => {
    const response: AuthResponse = await authService.register(name, email, password);
    await AsyncStorage.setItem('access_token', response.access_token);
    setUser(response.user);
  };

  const quickDemoLogin = async () => {
    try {
      // Attempt login with seeded demo account
      const response = await authService
        .login('demo.athlete@example.com', 'DemoPass123!')
        .catch(async () => {
          return await authService.register(
            'Talan Levin',
            'demo.athlete@example.com',
            'DemoPass123!'
          );
        });
      await AsyncStorage.setItem('access_token', response.access_token);
      setUser(response.user);
    } catch (e) {
      // Seamless fallback
      const fallbackUser: User = {
        id: 'demo-athlete-1',
        name: 'Talan Levin',
        email: 'demo.athlete@example.com',
        avatar_url:
          'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&auto=format&fit=crop&q=80',
        profile: null,
        assessment_completed: true,
        created_at: new Date().toISOString(),
      };
      await AsyncStorage.setItem('access_token', 'demo-token');
      setUser(fallbackUser);
    }
  };

  const logout = async () => {
    await AsyncStorage.removeItem('access_token');
    setUser(null);
  };

  const refreshUser = async () => {
    try {
      const userData = await userService.getProfile();
      setUser(userData);
    } catch (error) {
      console.log('Failed to refresh user:', error);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        register,
        quickDemoLogin,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
