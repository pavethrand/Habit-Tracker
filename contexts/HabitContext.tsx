import { DailyHabit, Habit, HabitCompletion, HabitStats } from '@/types/habit';
import { storage } from '@/utils/storage';
import React, { createContext, ReactNode, useContext, useEffect, useReducer } from 'react';

// Sample habit IDs to detect and remove
const SAMPLE_HABIT_IDS = ['1', '2', '3', '4', '5'];

interface HabitState {
  habits: Habit[];
  completions: HabitCompletion[];
  stats: HabitStats[];
}

type HabitAction =
  | { type: 'ADD_HABIT'; payload: Habit }
  | { type: 'UPDATE_HABIT'; payload: Habit }
  | { type: 'DELETE_HABIT'; payload: string }
  | { type: 'TOGGLE_COMPLETION'; payload: { habitId: string; date: string } }
  | { type: 'LOAD_HABITS'; payload: { habits: Habit[]; completions: HabitCompletion[]; stats: HabitStats[] } };

interface HabitContextType {
  state: HabitState;
  dispatch: React.Dispatch<HabitAction>;
  getTodayHabits: () => DailyHabit[];
  toggleHabitCompletion: (habitId: string) => void;
  getHabitStats: (habitId: string) => HabitStats | undefined;
}

const HabitContext = createContext<HabitContextType | undefined>(undefined);

const initialState: HabitState = {
  habits: [],
  completions: [],
  stats: [],
};

function habitReducer(state: HabitState, action: HabitAction): HabitState {
  switch (action.type) {
    case 'ADD_HABIT':
      return {
        ...state,
        habits: [...state.habits, action.payload],
      };
    
    case 'UPDATE_HABIT':
      return {
        ...state,
        habits: state.habits.map(habit => 
          habit.id === action.payload.id ? action.payload : habit
        ),
      };
    
    case 'DELETE_HABIT':
      return {
        ...state,
        habits: state.habits.filter(habit => habit.id !== action.payload),
        completions: state.completions.filter(completion => completion.habitId !== action.payload),
        stats: state.stats.filter(stat => stat.habitId !== action.payload),
      };
    
    case 'TOGGLE_COMPLETION':
      const { habitId, date } = action.payload;
      const existingCompletion = state.completions.find(
        c => c.habitId === habitId && c.date === date
      );
      
      if (existingCompletion) {
        return {
          ...state,
          completions: state.completions.map(completion =>
            completion.habitId === habitId && completion.date === date
              ? { ...completion, completed: !completion.completed, completedAt: !completion.completed ? new Date().toISOString() : undefined }
              : completion
          ),
        };
      } else {
        return {
          ...state,
          completions: [...state.completions, {
            habitId,
            date,
            completed: true,
            completedAt: new Date().toISOString(),
          }],
        };
      }
    
    case 'LOAD_HABITS':
      return {
        habits: action.payload.habits,
        completions: action.payload.completions,
        stats: action.payload.stats,
      };
    
    default:
      return state;
  }
}

export function HabitProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(habitReducer, initialState);

  // Load data from storage on mount
  useEffect(() => {
    const loadData = async () => {
      const [habits, completions] = await Promise.all([
        storage.loadHabits(),
        storage.loadHabitCompletions(),
      ]);
      
      // Filter out any sample habits that might be stored
      const habitsToLoad = habits.filter(habit => !SAMPLE_HABIT_IDS.includes(habit.id));
      const completionsToLoad = completions.filter(completion => !SAMPLE_HABIT_IDS.includes(completion.habitId));
      const statsToLoad: HabitStats[] = []; // Start with empty stats
      
      // If we filtered out sample habits, save the cleaned data
      if (habitsToLoad.length !== habits.length) {
        await storage.saveHabits(habitsToLoad);
        await storage.saveHabitCompletions(completionsToLoad);
      }
      
      dispatch({
        type: 'LOAD_HABITS',
        payload: {
          habits: habitsToLoad,
          completions: completionsToLoad,
          stats: statsToLoad,
        },
      });
    };
    
    loadData();
  }, []);

  // Save data to storage whenever state changes
  useEffect(() => {
    if (state.habits.length > 0 || state.completions.length > 0) {
      storage.saveHabits(state.habits);
      storage.saveHabitCompletions(state.completions);
    }
  }, [state.habits, state.completions]);

  const getTodayHabits = (): DailyHabit[] => {
    const today = new Date().toISOString().split('T')[0];
    
    return state.habits.map(habit => {
      const completion = state.completions.find(
        c => c.habitId === habit.id && c.date === today
      );
      const stats = state.stats.find(s => s.habitId === habit.id);
      
      return {
        habit,
        isCompleted: completion?.completed || false,
        stats: stats || {
          habitId: habit.id,
          currentStreak: 0,
          longestStreak: 0,
          successRate: 0,
          totalDays: 0,
          completedDays: 0,
        },
      };
    });
  };

  const toggleHabitCompletion = (habitId: string) => {
    const today = new Date().toISOString().split('T')[0];
    dispatch({ type: 'TOGGLE_COMPLETION', payload: { habitId, date: today } });
  };

  const getHabitStats = (habitId: string): HabitStats | undefined => {
    return state.stats.find(s => s.habitId === habitId);
  };

  return (
    <HabitContext.Provider value={{
      state,
      dispatch,
      getTodayHabits,
      toggleHabitCompletion,
      getHabitStats,
    }}>
      {children}
    </HabitContext.Provider>
  );
}

export function useHabits() {
  const context = useContext(HabitContext);
  if (context === undefined) {
    throw new Error('useHabits must be used within a HabitProvider');
  }
  return context;
}
