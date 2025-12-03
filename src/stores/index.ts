// SPIKE-3: Zustand Store Implementation
// Purpose: Validate state management, persistence, derived state

import create from 'zustand';
import { subscribeWithSelector, persist } from 'zustand/middleware';
import type { Task, Label, Project } from './db';

// ===== TASK STORE =====

interface TaskStore {
  tasks: Task[];
  addTask: (task: Task) => void;
  updateTask: (id: string, updates: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  setTasks: (tasks: Task[]) => void;
  getTaskById: (id: string) => Task | undefined;
  getActiveTaskCount: () => number;
  getOverdueTaskCount: () => number;
}

export const useTaskStore = create<TaskStore>()(
  persist(
    subscribeWithSelector((set, get) => ({
      tasks: [],

      addTask: (task: Task) => {
        set((state) => ({
          tasks: [...state.tasks, task],
        }));
      },

      updateTask: (id: string, updates: Partial<Task>) => {
        set((state) => ({
          tasks: state.tasks.map((task) =>
            task.id === id ? { ...task, ...updates } : task
          ),
        }));
      },

      deleteTask: (id: string) => {
        set((state) => ({
          tasks: state.tasks.filter((task) => task.id !== id),
        }));
      },

      setTasks: (tasks: Task[]) => {
        set({ tasks });
      },

      getTaskById: (id: string) => {
        return get().tasks.find((task) => task.id === id);
      },

      getActiveTaskCount: () => {
        return get().tasks.filter((task) => task.status === 'active').length;
      },

      getOverdueTaskCount: () => {
        // Use UTC date to avoid timezone-related off-by-one errors in tests
        const now = new Date();
        const todayUTC = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());
        const todayStr = new Date(todayUTC).toISOString().split('T')[0];

        return get().tasks.filter(
          (task) => task.dueDate && task.dueDate < todayStr && task.status === 'active'
        ).length;
      },
    })),
    {
      name: 'task-store',
      partialize: (state) => ({ tasks: state.tasks }),
    }
  )
);

// ===== LABEL STORE =====

interface LabelStore {
  labels: Label[];
  addLabel: (label: Label) => void;
  updateLabel: (id: string, updates: Partial<Label>) => void;
  deleteLabel: (id: string) => void;
  setLabels: (labels: Label[]) => void;
  getLabelById: (id: string) => Label | undefined;
  getLabelCount: () => number;
}

export const useLabelStore = create<LabelStore>()(
  persist(
    (set, get) => ({
      labels: [],

      addLabel: (label: Label) => {
        set((state) => ({
          labels: [...state.labels, label],
        }));
      },

      updateLabel: (id: string, updates: Partial<Label>) => {
        set((state) => ({
          labels: state.labels.map((label) =>
            label.id === id ? { ...label, ...updates } : label
          ),
        }));
      },

      deleteLabel: (id: string) => {
        set((state) => ({
          labels: state.labels.filter((label) => label.id !== id),
        }));
      },

      setLabels: (labels: Label[]) => {
        set({ labels });
      },

      getLabelById: (id: string) => {
        return get().labels.find((label) => label.id === id);
      },

      getLabelCount: () => {
        return get().labels.length;
      },
    }),
    {
      name: 'label-store',
      partialize: (state) => ({ labels: state.labels }),
    }
  )
);

// ===== UI STORE =====

interface UIStore {
  sidebarOpen: boolean;
  selectedTaskId: string | null;
  selectedLabelId: string | null;
  sortBy: 'dueDate' | 'priority' | 'created';
  filterStatus: 'all' | 'active' | 'completed' | 'archived';
  toggleSidebar: () => void;
  setSelectedTaskId: (id: string | null) => void;
  setSelectedLabelId: (id: string | null) => void;
  setSortBy: (sort: 'dueDate' | 'priority' | 'created') => void;
  setFilterStatus: (status: 'all' | 'active' | 'completed' | 'archived') => void;
}

export const useUIStore = create<UIStore>()(
  persist(
    (set) => ({
      sidebarOpen: true,
      selectedTaskId: null,
      selectedLabelId: null,
      sortBy: 'dueDate',
      filterStatus: 'all',

      toggleSidebar: () => {
        set((state) => ({
          sidebarOpen: !state.sidebarOpen,
        }));
      },

      setSelectedTaskId: (id: string | null) => {
        set({ selectedTaskId: id });
      },

      setSelectedLabelId: (id: string | null) => {
        set({ selectedLabelId: id });
      },

      setSortBy: (sort) => {
        set({ sortBy: sort });
      },

      setFilterStatus: (status) => {
        set({ filterStatus: status });
      },
    }),
    {
      name: 'ui-store',
    }
  )
);
