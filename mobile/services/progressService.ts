import api from './api';
import { ProgressStats, WeeklyProgress } from '../types';

export const progressService = {
  async getStats(): Promise<ProgressStats> {
    return api.get<ProgressStats>('/progress/stats');
  },

  async getWeeklyProgress(): Promise<WeeklyProgress> {
    return api.get<WeeklyProgress>('/progress/weekly');
  },
};

export default progressService;
