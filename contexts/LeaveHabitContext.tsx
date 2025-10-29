import { LeaveHabit, LeaveHabitCompletion } from '@/types/leave-habit';
import { storage } from '@/utils/storage';
import React, { createContext, ReactNode, useContext, useEffect, useReducer } from 'react';

interface LeaveHabitState {
  leaveHabits: LeaveHabit[];
  completions: LeaveHabitCompletion[];
}

type LeaveHabitAction =
  | { type: 'ADD_LEAVE_HABIT'; payload: LeaveHabit }
  | { type: 'UPDATE_LEAVE_HABIT'; payload: LeaveHabit }
  | { type: 'DELETE_LEAVE_HABIT'; payload: string }
  | { type: 'CHECK_LEAVE_HABIT'; payload: string }
  | { type: 'LOAD_LEAVE_HABITS'; payload: { leaveHabits: LeaveHabit[]; completions: LeaveHabitCompletion[] } };

interface LeaveHabitContextType {
  state: LeaveHabitState;
  dispatch: React.Dispatch<LeaveHabitAction>;
  addLeaveHabit: (leaveHabit: Omit<LeaveHabit, 'id' | 'createdAt' | 'streak'>) => void;
  updateLeaveHabit: (leaveHabit: LeaveHabit) => void;
  deleteLeaveHabit: (leaveHabitId: string) => void;
  checkLeaveHabit: (leaveHabitId: string) => void;
  getLeaveHabitsByPriority: (priority: string) => LeaveHabit[];
}

const LeaveHabitContext = createContext<LeaveHabitContextType | undefined>(undefined);

const initialState: LeaveHabitState = {
  leaveHabits: [],
  completions: [],
};

function leaveHabitReducer(state: LeaveHabitState, action: LeaveHabitAction): LeaveHabitState {
  switch (action.type) {
    case 'ADD_LEAVE_HABIT':
      return {
        ...state,
        leaveHabits: [...state.leaveHabits, action.payload],
      };
    
    case 'UPDATE_LEAVE_HABIT':
      return {
        ...state,
        leaveHabits: state.leaveHabits.map(leaveHabit =>
          leaveHabit.id === action.payload.id ? action.payload : leaveHabit
        ),
      };
    
    case 'DELETE_LEAVE_HABIT':
      return {
        ...state,
        leaveHabits: state.leaveHabits.filter(leaveHabit => leaveHabit.id !== action.payload),
        completions: state.completions.filter(completion => completion.leaveHabitId !== action.payload),
      };
    
    case 'CHECK_LEAVE_HABIT':
      const today = new Date().toISOString().split('T')[0];
      const leaveHabitId = action.payload;
      
      // Check if already checked today
      const existingCompletion = state.completions.find(
        c => c.leaveHabitId === leaveHabitId && c.date === today
      );
      
      if (existingCompletion) {
        return state; // Already checked today
      }
      
      // Update streak and add completion
      const updatedLeaveHabits = state.leaveHabits.map(leaveHabit => {
        if (leaveHabit.id === leaveHabitId) {
          const newStreak = leaveHabit.streak + 1;
          
          // Auto-remove if streak reaches 7 days
          if (newStreak >= 7) {
            return null; // Will be filtered out
          }
          
          return {
            ...leaveHabit,
            streak: newStreak,
            lastCheckedDate: today,
          };
        }
        return leaveHabit;
      }).filter(Boolean) as LeaveHabit[];
      
      return {
        ...state,
        leaveHabits: updatedLeaveHabits,
        completions: [
          ...state.completions,
          {
            leaveHabitId,
            date: today,
            checked: true,
            checkedAt: new Date().toISOString(),
          },
        ],
      };
    
    case 'LOAD_LEAVE_HABITS':
      return {
        leaveHabits: action.payload.leaveHabits,
        completions: action.payload.completions,
      };
    
    default:
      return state;
  }
}

export function LeaveHabitProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(leaveHabitReducer, initialState);

  // Load data from storage on mount
  useEffect(() => {
    const loadData = async () => {
      const [leaveHabits, completions] = await Promise.all([
        storage.loadLeaveHabits(),
        storage.loadLeaveHabitCompletions(),
      ]);
      
      dispatch({
        type: 'LOAD_LEAVE_HABITS',
        payload: {
          leaveHabits,
          completions,
        },
      });
    };
    
    loadData();
  }, []);

  // Save data to storage whenever state changes
  useEffect(() => {
    if (state.leaveHabits.length > 0 || state.completions.length > 0) {
      storage.saveLeaveHabits(state.leaveHabits);
      storage.saveLeaveHabitCompletions(state.completions);
    }
  }, [state.leaveHabits, state.completions]);

  const addLeaveHabit = (leaveHabitData: Omit<LeaveHabit, 'id' | 'createdAt' | 'streak'>) => {
    const newLeaveHabit: LeaveHabit = {
      ...leaveHabitData,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      streak: 0,
    };
    dispatch({ type: 'ADD_LEAVE_HABIT', payload: newLeaveHabit });
  };

  const updateLeaveHabit = (leaveHabit: LeaveHabit) => {
    dispatch({ type: 'UPDATE_LEAVE_HABIT', payload: leaveHabit });
  };

  const deleteLeaveHabit = (leaveHabitId: string) => {
    dispatch({ type: 'DELETE_LEAVE_HABIT', payload: leaveHabitId });
  };

  const checkLeaveHabit = (leaveHabitId: string) => {
    dispatch({ type: 'CHECK_LEAVE_HABIT', payload: leaveHabitId });
  };

  const getLeaveHabitsByPriority = (priority: string): LeaveHabit[] => {
    return state.leaveHabits.filter(leaveHabit => leaveHabit.priority === priority);
  };

  return (
    <LeaveHabitContext.Provider value={{
      state,
      dispatch,
      addLeaveHabit,
      updateLeaveHabit,
      deleteLeaveHabit,
      checkLeaveHabit,
      getLeaveHabitsByPriority,
    }}>
      {children}
    </LeaveHabitContext.Provider>
  );
}

export function useLeaveHabits() {
  const context = useContext(LeaveHabitContext);
  if (context === undefined) {
    throw new Error('useLeaveHabits must be used within a LeaveHabitProvider');
  }
  return context;
}
