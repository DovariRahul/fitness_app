import api from './api';
import { WorkoutPlan } from '../types';

export interface AIGenerateRequest {
  goal: string;
  fitness_level: string;
  duration_minutes: number;
  equipment: string[];
  focus_areas?: string[];
  medical_notes?: string;
}

export const workoutService = {
  async getTodayWorkout(): Promise<WorkoutPlan> {
    return api.get<WorkoutPlan>('/workouts/today');
  },

  async generateWorkout(data?: any): Promise<WorkoutPlan> {
    return api.post<WorkoutPlan>('/workouts/generate', data);
  },

  async generateAIWorkout(data: AIGenerateRequest): Promise<any> {
    return api.post<any>('/workouts/generate-ai', data);
  },

  async getWorkoutHistory(limit = 30, skip = 0): Promise<WorkoutPlan[]> {
    return api.get<WorkoutPlan[]>(`/workouts/history?limit=${limit}&skip=${skip}`);
  },

  async getWorkoutById(id: string): Promise<WorkoutPlan> {
    return api.get<WorkoutPlan>(`/workouts/${id}`);
  },

  async deleteWorkout(id: string): Promise<{ message: string; id: string }> {
    return api.delete<{ message: string; id: string }>(`/workouts/${id}`);
  },
};

export default workoutService;
