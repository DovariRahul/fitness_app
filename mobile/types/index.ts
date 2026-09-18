/**
 * TypeScript interfaces for the entire application.
 */

// === User Types ===
export interface UserProfile {
  age: number | null;
  height_cm: number | null;
  weight_kg: number | null;
  fitness_level: FitnessLevel | null;
  fitness_goal: FitnessGoal | null;
  workout_experience_months: number;
  available_time_minutes: number;
  available_equipment: Equipment[];
  preferred_workout_days: WorkoutDay[];
  has_medical_concerns: boolean;
  medical_notes: string | null;
}

export interface User {
  id: string;
  name: string;
  email: string;
  avatar_url: string | null;
  profile: UserProfile | null;
  assessment_completed: boolean;
  created_at: string | null;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  user: User;
}

// === Exercise Types ===
export interface Exercise {
  id: string;
  name: string;
  description: string;
  target_muscle: string;
  secondary_muscles: string[];
  difficulty: string;
  equipment: string;
  category: string;
  default_sets: number;
  default_reps: number | null;
  default_duration_sec: number | null;
  rest_time_sec: number;
  instructions: string[];
  common_mistakes: string[];
  video_url: string | null;
  thumbnail_url: string | null;
  beginner_alternative_id: string | null;
  advanced_alternative_id: string | null;
  calories_per_minute: number;
}

// === Workout Types ===
export interface WorkoutExercise {
  exercise_id: string;
  exercise_name: string;
  sets: number;
  reps: number | null;
  duration_sec: number | null;
  rest_time_sec: number;
  order: number;
}

export interface WorkoutPlan {
  id: string;
  user_id: string;
  date: string;
  title: string;
  description: string;
  estimated_duration_min: number;
  difficulty: string;
  exercises: WorkoutExercise[];
  is_completed: boolean;
  created_at: string | null;
}

// === Session Types ===
export interface SessionExercise {
  exercise_id: string;
  exercise_name: string;
  sets_completed: number;
  sets_total: number;
  reps_completed: number[];
  completed: boolean;
}

export interface WorkoutSession {
  id: string;
  user_id: string;
  plan_id: string;
  date: string | null;
  exercises: SessionExercise[];
  total_duration_sec: number;
  completion_percentage: number;
  calories_burned: number;
  started_at: string | null;
  finished_at: string | null;
}

// === Feedback Types ===
export interface FeedbackData {
  session_id: string;
  plan_id: string;
  completion_percentage: number;
  reason: FeedbackReason;
  reason_details?: string;
  difficulty_rating: number;
}

// === Progress Types ===
export interface ProgressStats {
  total_workouts: number;
  completed_workouts: number;
  completion_rate: number;
  streak: number;
  total_calories: number;
  total_duration_minutes: number;
}

export interface DayProgress {
  day: string;
  date: string;
  completion: number;
  is_today: boolean;
}

export interface WeeklyProgress {
  days: DayProgress[];
  average_completion: number;
  workouts_this_week: number;
}

// === Enums ===
export type FitnessLevel = 'beginner' | 'intermediate' | 'advanced';
export type FitnessGoal = 'weight_loss' | 'muscle_gain' | 'strength' | 'endurance' | 'general_fitness';
export type Equipment = 'none' | 'dumbbells' | 'barbell' | 'resistance_bands' | 'pull_up_bar' | 'bench' | 'kettlebell';
export type WorkoutDay = 'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat' | 'sun';
export type FeedbackReason = 'too_difficult' | 'no_time' | 'low_energy' | 'no_equipment' | 'pain' | 'busy' | 'other';
export type ExerciseCategory = 'strength' | 'cardio' | 'flexibility' | 'balance';
