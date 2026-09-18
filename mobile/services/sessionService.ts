import api from './api';
import { WorkoutSession } from '../types';

export const sessionService = {
  async startSession(planId: string): Promise<WorkoutSession> {
    return api.post<WorkoutSession>('/sessions/start', { plan_id: planId });
  },

  async updateExercise(
    sessionId: string,
    exerciseId: string,
    setsCompleted: number,
    repsCompleted: number[],
    completed: boolean
  ): Promise<WorkoutSession> {
    return api.put<WorkoutSession>(`/sessions/${sessionId}/update`, {
      exercise_id: exerciseId,
      sets_completed: setsCompleted,
      reps_completed: repsCompleted,
      completed,
    });
  },

  async completeSession(sessionId: string): Promise<WorkoutSession> {
    return api.post<WorkoutSession>(`/sessions/${sessionId}/complete`);
  },
};

export default sessionService;
