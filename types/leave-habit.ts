export type LeavePriority = 'critical' | 'normal' | 'minor';

export interface LeaveHabit {
  id: string;
  name: string;
  description?: string;
  category?: string;
  priority: LeavePriority;
  streak: number;
  createdAt: string;
  lastCheckedDate?: string; // ISO date string
}

export interface LeaveHabitCompletion {
  leaveHabitId: string;
  date: string; // ISO date string (YYYY-MM-DD)
  checked: boolean;
  checkedAt?: string; // ISO timestamp
}
