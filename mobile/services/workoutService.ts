import api from './api';
import { WorkoutPlan } from '../types';

export const workoutService = {
  async getTodayWorkout(): Promise<WorkoutPlan> {
    return api.get<WorkoutPlan>('/workouts/today');
  },

  async generateWorkout(data?: any): Promise<WorkoutPlan> {
    return api.post<WorkoutPlan>('/workouts/generate', data);
  },

  async getWorkoutHistory(limit = 30, skip = 0): Promise<WorkoutPlan[]> {
    return api.get<WorkoutPlan[]>(`/workouts/history?limit=${limit}&skip=${skip}`);
  },

  async getWorkoutById(id: string): Promise<WorkoutPlan> {
    return api.get<WorkoutPlan>(`/workouts/${id}`);
  },
};

export default workoutService;
