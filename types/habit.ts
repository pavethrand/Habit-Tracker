export type HabitPriority = 'important' | 'normal' | 'low';

export interface Habit {
  id: string;
  name: string;
  description?: string;
  frequency: 'daily' | 'weekly' | 'monthly' | 'custom';
  customDays?: number[]; // 0-6 (Sunday-Saturday)
  startDate: string; // ISO date string
  category: string;
  priority: HabitPriority;
  createdAt: string;
  color: string;
  icon?: string;
}

export interface HabitCompletion {
  habitId: string;
  date: string; // ISO date string (YYYY-MM-DD)
  completed: boolean;
  completedAt?: string; // ISO timestamp
}

export interface HabitStats {
  habitId: string;
  currentStreak: number;
  longestStreak: number;
  successRate: number; // percentage (0-100)
  totalDays: number;
  completedDays: number;
}

export interface DailyHabit {
  habit: Habit;
  isCompleted: boolean;
  stats: HabitStats;
}
