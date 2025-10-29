export type Priority = 'important' | 'normal' | 'low';

export interface Task {
  id: string;
  name: string;
  description?: string;
  category: string;
  deadline?: string; // ISO date string
  priority: Priority;
  completed: boolean;
  createdAt: string;
  completedAt?: string;
}

export interface Category {
  id: string;
  name: string;
  color: string;
  icon?: string;
  createdAt: string;
}
