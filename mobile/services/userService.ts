import api from './api';
import { User } from '../types';

export const userService = {
  async getProfile(): Promise<User> {
    return api.get<User>('/users/profile');
  },

  async updateProfile(data: any): Promise<User> {
    return api.put<User>('/users/profile', data);
  },

  async submitAssessment(data: any): Promise<User> {
    return api.post<User>('/users/assessment', data);
  },
};

export default userService;
