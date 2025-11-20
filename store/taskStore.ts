import { create } from 'zustand';
import { Task } from '../types';

interface TaskState {
  tasks: Task[];
  addTask: (text: string) => void;
  toggleTask: (id: string) => void;
  deleteTask: (id: string) => void;
}

export const useTaskStore = create<TaskState>((set) => ({
  tasks: [],
  addTask: (text) => set((state) => ({
    tasks: [
      { 
        id: Math.random().toString(36).substr(2, 9), 
        text, 
        completed: false, 
        createdAt: new Date() 
      },
      ...state.tasks
    ]
  })),
  toggleTask: (id) => set((state) => ({
    tasks: state.tasks.map(t => t.id === id ? { ...t, completed: !t.completed } : t)
  })),
  deleteTask: (id) => set((state) => ({
    tasks: state.tasks.filter(t => t.id !== id)
  }))
}));