import { Category, Task } from '@/types/task';
import { storage } from '@/utils/storage';
import React, { createContext, ReactNode, useContext, useEffect, useReducer } from 'react';

interface TaskState {
  tasks: Task[];
  categories: Category[];
}

type TaskAction =
  | { type: 'ADD_TASK'; payload: Task }
  | { type: 'UPDATE_TASK'; payload: Task }
  | { type: 'DELETE_TASK'; payload: string }
  | { type: 'TOGGLE_TASK_COMPLETION'; payload: string }
  | { type: 'ADD_CATEGORY'; payload: Category }
  | { type: 'UPDATE_CATEGORY'; payload: Category }
  | { type: 'DELETE_CATEGORY'; payload: string }
  | { type: 'LOAD_DATA'; payload: { tasks: Task[]; categories: Category[] } };

interface TaskContextType {
  state: TaskState;
  dispatch: React.Dispatch<TaskAction>;
  addTask: (task: Omit<Task, 'id' | 'createdAt'>) => void;
  updateTask: (task: Task) => void;
  deleteTask: (taskId: string) => void;
  toggleTaskCompletion: (taskId: string) => void;
  addCategory: (category: Omit<Category, 'id' | 'createdAt'>) => void;
  updateCategory: (category: Category) => void;
  deleteCategory: (categoryId: string) => void;
  getTasksByCategory: (category: string) => Task[];
  getTasksByPriority: (priority: string) => Task[];
}

const TaskContext = createContext<TaskContextType | undefined>(undefined);

const initialState: TaskState = {
  tasks: [],
  categories: [
    {
      id: '1',
      name: 'Work',
      color: '#4A90E2',
      icon: 'briefcase.fill',
      createdAt: new Date().toISOString(),
    },
    {
      id: '2',
      name: 'Health',
      color: '#7ED321',
      icon: 'heart.fill',
      createdAt: new Date().toISOString(),
    },
    {
      id: '3',
      name: 'Study',
      color: '#F5A623',
      icon: 'book.fill',
      createdAt: new Date().toISOString(),
    },
    {
      id: '4',
      name: 'Fitness',
      color: '#D0021B',
      icon: 'figure.run',
      createdAt: new Date().toISOString(),
    },
  ],
};

function taskReducer(state: TaskState, action: TaskAction): TaskState {
  switch (action.type) {
    case 'ADD_TASK':
      return {
        ...state,
        tasks: [...state.tasks, action.payload],
      };
    
    case 'UPDATE_TASK':
      return {
        ...state,
        tasks: state.tasks.map(task => 
          task.id === action.payload.id ? action.payload : task
        ),
      };
    
    case 'DELETE_TASK':
      return {
        ...state,
        tasks: state.tasks.filter(task => task.id !== action.payload),
      };
    
    case 'TOGGLE_TASK_COMPLETION':
      return {
        ...state,
        tasks: state.tasks.map(task =>
          task.id === action.payload
            ? {
                ...task,
                completed: !task.completed,
                completedAt: !task.completed ? new Date().toISOString() : undefined,
              }
            : task
        ),
      };
    
    case 'ADD_CATEGORY':
      return {
        ...state,
        categories: [...state.categories, action.payload],
      };
    
    case 'UPDATE_CATEGORY':
      return {
        ...state,
        categories: state.categories.map(category =>
          category.id === action.payload.id ? action.payload : category
        ),
      };
    
    case 'DELETE_CATEGORY':
      return {
        ...state,
        categories: state.categories.filter(category => category.id !== action.payload),
        tasks: state.tasks.map(task =>
          task.category === state.categories.find(c => c.id === action.payload)?.name
            ? { ...task, category: 'Uncategorized' }
            : task
        ),
      };
    
    case 'LOAD_DATA':
      return {
        tasks: action.payload.tasks,
        categories: action.payload.categories,
      };
    
    default:
      return state;
  }
}

export function TaskProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(taskReducer, initialState);

  // Load data from storage on mount
  useEffect(() => {
    const loadData = async () => {
      const [tasks, categories] = await Promise.all([
        storage.loadTasks(),
        storage.loadCategories(),
      ]);
      
      dispatch({
        type: 'LOAD_DATA',
        payload: {
          tasks: tasks.length > 0 ? tasks : [],
          categories: categories.length > 0 ? categories : initialState.categories,
        },
      });
    };
    
    loadData();
  }, []);

  // Save data to storage whenever state changes
  useEffect(() => {
    if (state.tasks.length > 0 || state.categories.length > 0) {
      storage.saveTasks(state.tasks);
      storage.saveCategories(state.categories);
    }
  }, [state.tasks, state.categories]);

  const addTask = (taskData: Omit<Task, 'id' | 'createdAt'>) => {
    const newTask: Task = {
      ...taskData,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
    };
    dispatch({ type: 'ADD_TASK', payload: newTask });
  };

  const updateTask = (task: Task) => {
    dispatch({ type: 'UPDATE_TASK', payload: task });
  };

  const deleteTask = (taskId: string) => {
    dispatch({ type: 'DELETE_TASK', payload: taskId });
  };

  const toggleTaskCompletion = (taskId: string) => {
    dispatch({ type: 'TOGGLE_TASK_COMPLETION', payload: taskId });
  };

  const addCategory = (categoryData: Omit<Category, 'id' | 'createdAt'>) => {
    const newCategory: Category = {
      ...categoryData,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
    };
    dispatch({ type: 'ADD_CATEGORY', payload: newCategory });
  };

  const updateCategory = (category: Category) => {
    dispatch({ type: 'UPDATE_CATEGORY', payload: category });
  };

  const deleteCategory = (categoryId: string) => {
    dispatch({ type: 'DELETE_CATEGORY', payload: categoryId });
  };

  const getTasksByCategory = (category: string): Task[] => {
    return state.tasks.filter(task => task.category === category);
  };

  const getTasksByPriority = (priority: string): Task[] => {
    return state.tasks.filter(task => task.priority === priority);
  };

  return (
    <TaskContext.Provider value={{
      state,
      dispatch,
      addTask,
      updateTask,
      deleteTask,
      toggleTaskCompletion,
      addCategory,
      updateCategory,
      deleteCategory,
      getTasksByCategory,
      getTasksByPriority,
    }}>
      {children}
    </TaskContext.Provider>
  );
}

export function useTasks() {
  const context = useContext(TaskContext);
  if (context === undefined) {
    throw new Error('useTasks must be used within a TaskProvider');
  }
  return context;
}
