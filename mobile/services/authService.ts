import api from './api';
import { AuthResponse } from '../types';

export const authService = {
  async register(name: string, email: string, password: string): Promise<AuthResponse> {
    return api.post<AuthResponse>('/auth/register', { name, email, password });
  },

  async login(email: string, password: string): Promise<AuthResponse> {
    return api.post<AuthResponse>('/auth/login', { email, password });
  },
};

export default authService;
