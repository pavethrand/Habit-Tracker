import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEYS = {
  TASKS: '@habit_tracker_tasks',
  CATEGORIES: '@habit_tracker_categories',
  HABITS: '@habit_tracker_habits',
  HABIT_COMPLETIONS: '@habit_tracker_habit_completions',
  LEAVE_HABITS: '@habit_tracker_leave_habits',
  LEAVE_HABIT_COMPLETIONS: '@habit_tracker_leave_habit_completions',
} as const;

export const storage = {
  // Tasks
  async saveTasks(tasks: any[]) {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(tasks));
    } catch (error) {
      console.error('Error saving tasks:', error);
    }
  },

  async loadTasks(): Promise<any[]> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.TASKS);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error loading tasks:', error);
      return [];
    }
  },

  // Categories
  async saveCategories(categories: any[]) {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(categories));
    } catch (error) {
      console.error('Error saving categories:', error);
    }
  },

  async loadCategories(): Promise<any[]> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.CATEGORIES);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error loading categories:', error);
      return [];
    }
  },

  // Habits
  async saveHabits(habits: any[]) {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.HABITS, JSON.stringify(habits));
    } catch (error) {
      console.error('Error saving habits:', error);
    }
  },

  async loadHabits(): Promise<any[]> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.HABITS);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error loading habits:', error);
      return [];
    }
  },

  // Habit Completions
  async saveHabitCompletions(completions: any[]) {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.HABIT_COMPLETIONS, JSON.stringify(completions));
    } catch (error) {
      console.error('Error saving habit completions:', error);
    }
  },

  async loadHabitCompletions(): Promise<any[]> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.HABIT_COMPLETIONS);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error loading habit completions:', error);
      return [];
    }
  },

  // Leave Habits
  async saveLeaveHabits(leaveHabits: any[]) {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.LEAVE_HABITS, JSON.stringify(leaveHabits));
    } catch (error) {
      console.error('Error saving leave habits:', error);
    }
  },

  async loadLeaveHabits(): Promise<any[]> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.LEAVE_HABITS);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error loading leave habits:', error);
      return [];
    }
  },

  // Leave Habit Completions
  async saveLeaveHabitCompletions(completions: any[]) {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.LEAVE_HABIT_COMPLETIONS, JSON.stringify(completions));
    } catch (error) {
      console.error('Error saving leave habit completions:', error);
    }
  },

  async loadLeaveHabitCompletions(): Promise<any[]> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.LEAVE_HABIT_COMPLETIONS);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error loading leave habit completions:', error);
      return [];
    }
  },

  // Clear all data
  async clearAllData() {
    try {
      await AsyncStorage.multiRemove(Object.values(STORAGE_KEYS));
    } catch (error) {
      console.error('Error clearing all data:', error);
    }
  },

  // Clear specific habits data
  async clearHabits() {
    try {
      await AsyncStorage.removeItem(STORAGE_KEYS.HABITS);
      await AsyncStorage.removeItem(STORAGE_KEYS.HABIT_COMPLETIONS);
    } catch (error) {
      console.error('Error clearing habits:', error);
    }
  },
};
