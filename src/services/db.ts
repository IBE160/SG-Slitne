// SPIKE-1: IndexedDB Service
// Purpose: Complete CRUD operations, query performance, transaction handling

import { v4 as uuidv4 } from 'uuid';

export interface Task {
  id: string;
  title: string;
  description: string;
  projectId?: string;
  labels: string[];
  priority: 1 | 2 | 3;
  status: 'active' | 'completed' | 'archived';
  dueDate?: string;
  summary: string;
  aiMetadata: {
    labelConfidence: Array<{ label: string; confidence: number; accepted?: boolean }>;
    priorityScore: number;
    summarizedAt: string;
    userFeedback: 'accepted' | 'rejected' | 'edited' | null;
  };
  createdAt: string;
  updatedAt: string;
}

export interface Label {
  id: string;
  name: string;
  color?: string;
  description?: string;
  isSystemLabel: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface Project {
  id: string;
  name: string;
  description?: string;
  color?: string;
  status: 'active' | 'archived' | 'completed';
  taskCount?: number;
  createdAt: string;
  updatedAt?: string;
}

const DB_NAME = 'smart-todo-db';
const DB_VERSION = 1;

let dbInstance: IDBDatabase | null = null;

export async function initializeDatabase(): Promise<IDBDatabase> {
  if (dbInstance) return dbInstance;

  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => {
      dbInstance = request.result;
      resolve(request.result);
    };

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;

      // Create tasks store
      if (!db.objectStoreNames.contains('tasks')) {
        const taskStore = db.createObjectStore('tasks', { keyPath: 'id' });
        taskStore.createIndex('dueDate', 'dueDate', { unique: false });
        taskStore.createIndex('priority', 'priority', { unique: false });
        taskStore.createIndex('status', 'status', { unique: false });
        taskStore.createIndex('labels', 'labels', { unique: false, multiEntry: true });
        taskStore.createIndex('projectId', 'projectId', { unique: false });
        taskStore.createIndex('createdAt', 'createdAt', { unique: false });
      }

      // Create labels store
      if (!db.objectStoreNames.contains('labels')) {
        const labelStore = db.createObjectStore('labels', { keyPath: 'id' });
        labelStore.createIndex('name', 'name', { unique: true });
      }

      // Create projects store
      if (!db.objectStoreNames.contains('projects')) {
        const projectStore = db.createObjectStore('projects', { keyPath: 'id' });
        projectStore.createIndex('name', 'name', { unique: true });
      }
    };
  });
}

// ===== TASK CRUD OPERATIONS =====

export async function createTask(taskData: Partial<Task>): Promise<Task> {
  const db = await initializeDatabase();
  const transaction = db.transaction(['tasks'], 'readwrite');
  const taskStore = transaction.objectStore('tasks');

  const task: Task = {
    id: uuidv4(),
    title: taskData.title || 'Untitled',
    description: taskData.description || '',
    projectId: taskData.projectId,
    labels: taskData.labels || [],
    priority: taskData.priority || 1,
    status: (taskData.status as any) || 'active',
    dueDate: taskData.dueDate,
    summary: taskData.summary || taskData.title || 'Untitled',
    aiMetadata: {
      labelConfidence: [],
      priorityScore: taskData.priority || 1,
      summarizedAt: new Date().toISOString(),
      userFeedback: null,
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  return new Promise((resolve, reject) => {
    const request = taskStore.add(task);
    request.onsuccess = () => resolve(task);
    request.onerror = () => reject(request.error);
  });
}

export async function getTask(id: string): Promise<Task | null> {
  const db = await initializeDatabase();
  const transaction = db.transaction(['tasks'], 'readonly');
  const taskStore = transaction.objectStore('tasks');

  return new Promise((resolve, reject) => {
    const request = taskStore.get(id);
    request.onsuccess = () => resolve(request.result || null);
    request.onerror = () => reject(request.error);
  });
}

export async function getAllTasks(): Promise<Task[]> {
  const db = await initializeDatabase();
  const transaction = db.transaction(['tasks'], 'readonly');
  const taskStore = transaction.objectStore('tasks');

  return new Promise((resolve, reject) => {
    const request = taskStore.getAll();
    request.onsuccess = () => resolve(request.result || []);
    request.onerror = () => reject(request.error);
  });
}

export async function updateTask(id: string, updates: Partial<Task>): Promise<Task> {
  const db = await initializeDatabase();
  const transaction = db.transaction(['tasks'], 'readwrite');
  const taskStore = transaction.objectStore('tasks');

  const currentTask = await new Promise<Task>((resolve, reject) => {
    const request = taskStore.get(id);
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });

  if (!currentTask) throw new Error(`Task ${id} not found`);

  const updatedTask: Task = {
    ...currentTask,
    ...updates,
    id: currentTask.id,
    createdAt: currentTask.createdAt,
    updatedAt: new Date().toISOString(),
  };

  return new Promise((resolve, reject) => {
    const request = taskStore.put(updatedTask);
    request.onsuccess = () => resolve(updatedTask);
    request.onerror = () => reject(request.error);
  });
}

export async function deleteTask(id: string): Promise<void> {
  const db = await initializeDatabase();
  const transaction = db.transaction(['tasks'], 'readwrite');
  const taskStore = transaction.objectStore('tasks');

  return new Promise((resolve, reject) => {
    const request = taskStore.delete(id);
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

// ===== QUERY OPERATIONS =====

export async function getTasksByStatus(status: 'active' | 'completed' | 'archived'): Promise<Task[]> {
  const db = await initializeDatabase();
  const transaction = db.transaction(['tasks'], 'readonly');
  const taskStore = transaction.objectStore('tasks');
  const index = taskStore.index('status');

  return new Promise((resolve, reject) => {
    const request = index.getAll(status);
    request.onsuccess = () => resolve(request.result || []);
    request.onerror = () => reject(request.error);
  });
}

export async function getTasksByPriority(priority: 1 | 2 | 3): Promise<Task[]> {
  const db = await initializeDatabase();
  const transaction = db.transaction(['tasks'], 'readonly');
  const taskStore = transaction.objectStore('tasks');
  const index = taskStore.index('priority');

  return new Promise((resolve, reject) => {
    const request = index.getAll(priority);
    request.onsuccess = () => resolve(request.result || []);
    request.onerror = () => reject(request.error);
  });
}

export async function getTasksByLabel(labelId: string): Promise<Task[]> {
  const db = await initializeDatabase();
  const transaction = db.transaction(['tasks'], 'readonly');
  const taskStore = transaction.objectStore('tasks');
  const index = taskStore.index('labels');

  return new Promise((resolve, reject) => {
    const request = index.getAll(labelId);
    request.onsuccess = () => resolve(request.result || []);
    request.onerror = () => reject(request.error);
  });
}

export async function getTasksByProject(projectId: string): Promise<Task[]> {
  const db = await initializeDatabase();
  const transaction = db.transaction(['tasks'], 'readonly');
  const taskStore = transaction.objectStore('tasks');
  const index = taskStore.index('projectId');

  return new Promise((resolve, reject) => {
    const request = index.getAll(projectId);
    request.onsuccess = () => resolve(request.result || []);
    request.onerror = () => reject(request.error);
  });
}

export async function getUpcomingTasks(daysAhead = 7): Promise<Task[]> {
  const db = await initializeDatabase();
  const transaction = db.transaction(['tasks'], 'readonly');
  const taskStore = transaction.objectStore('tasks');
  const index = taskStore.index('dueDate');

  // Use UTC-normalized dates to keep behavior stable across timezones
  const now = new Date();
  const todayUTC = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());
  const today = new Date(todayUTC);
  const futureDate = new Date(today);
  futureDate.setUTCDate(today.getUTCDate() + daysAhead);

  const todayStr = today.toISOString().split('T')[0];
  const futureStr = futureDate.toISOString().split('T')[0];

  return new Promise((resolve, reject) => {
    const request = index.getAll(IDBKeyRange.bound(todayStr, futureStr));
    request.onsuccess = () => resolve(request.result || []);
    request.onerror = () => reject(request.error);
  });
}

export async function getOverdueTasks(): Promise<Task[]> {
  // Use UTC-normalized date string for stable comparisons
  const now = new Date();
  const todayUTC = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());
  const today = new Date(todayUTC);
  const todayStr = today.toISOString().split('T')[0];

  const db = await initializeDatabase();
  const transaction = db.transaction(['tasks'], 'readonly');
  const taskStore = transaction.objectStore('tasks');
  const index = taskStore.index('dueDate');

  return new Promise((resolve, reject) => {
    const request = index.getAll(IDBKeyRange.upperBound(todayStr, true));
    request.onsuccess = () => {
      const overdueTasks = (request.result || []).filter(
        (task) => task.status === 'active'
      );
      resolve(overdueTasks);
    };
    request.onerror = () => reject(request.error);
  });
}

// ===== BULK OPERATIONS =====

export async function bulkUpdateTasks(ids: string[], updates: Partial<Task>): Promise<Task[]> {
  const db = await initializeDatabase();
  const transaction = db.transaction(['tasks'], 'readwrite');
  const taskStore = transaction.objectStore('tasks');

  const updatedTasks: Task[] = [];

  for (const id of ids) {
    const task = await new Promise<Task>((resolve, reject) => {
      const request = taskStore.get(id);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });

    if (task) {
      const updatedTask = {
        ...task,
        ...updates,
        updatedAt: new Date().toISOString(),
      };

      await new Promise<void>((resolve, reject) => {
        const request = taskStore.put(updatedTask);
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      });

      updatedTasks.push(updatedTask);
    }
  }

  return updatedTasks;
}

export async function bulkDeleteTasks(ids: string[]): Promise<void> {
  const db = await initializeDatabase();
  const transaction = db.transaction(['tasks'], 'readwrite');
  const taskStore = transaction.objectStore('tasks');

  for (const id of ids) {
    await new Promise<void>((resolve, reject) => {
      const request = taskStore.delete(id);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }
}

// ===== LABEL CRUD =====

export async function createLabel(labelData: Partial<Label>): Promise<Label> {
  const db = await initializeDatabase();
  const transaction = db.transaction(['labels'], 'readwrite');
  const labelStore = transaction.objectStore('labels');

  const label: Label = {
    id: uuidv4(),
    name: labelData.name || 'Untitled Label',
    color: labelData.color,
    description: labelData.description,
    isSystemLabel: labelData.isSystemLabel || false,
    createdAt: new Date().toISOString(),
  };

  return new Promise((resolve, reject) => {
    const request = labelStore.add(label);
    request.onsuccess = () => resolve(label);
    request.onerror = () => reject(request.error);
  });
}

export async function getAllLabels(): Promise<Label[]> {
  const db = await initializeDatabase();
  const transaction = db.transaction(['labels'], 'readonly');
  const labelStore = transaction.objectStore('labels');

  return new Promise((resolve, reject) => {
    const request = labelStore.getAll();
    request.onsuccess = () => resolve(request.result || []);
    request.onerror = () => reject(request.error);
  });
}

export async function deleteLabel(id: string): Promise<void> {
  const db = await initializeDatabase();
  const transaction = db.transaction(['labels'], 'readwrite');
  const labelStore = transaction.objectStore('labels');

  return new Promise((resolve, reject) => {
    const request = labelStore.delete(id);
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

// ===== STATISTICS =====

export async function getTaskStats(): Promise<{
  total: number;
  active: number;
  completed: number;
  archived: number;
  overdue: number;
  highPriority: number;
}> {
  const allTasks = await getAllTasks();
  // Normalize to UTC date string for consistency in tests and storage
  const now = new Date();
  const todayUTC = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());
  const today = new Date(todayUTC);
  const todayStr = today.toISOString().split('T')[0];

  return {
    total: allTasks.length,
    active: allTasks.filter((t) => t.status === 'active').length,
    completed: allTasks.filter((t) => t.status === 'completed').length,
    archived: allTasks.filter((t) => t.status === 'archived').length,
    overdue: allTasks.filter(
      (t) => t.dueDate && t.dueDate < todayStr && t.status === 'active'
    ).length,
    highPriority: allTasks.filter((t) => t.priority === 3).length,
  };
}

// ===== SEARCH & FILTER =====

export async function searchTasks(query: string): Promise<Task[]> {
  const allTasks = await getAllTasks();
  const lowerQuery = query.toLowerCase();

  return allTasks.filter((task) => {
    return (
      task.title.toLowerCase().includes(lowerQuery) ||
      task.description.toLowerCase().includes(lowerQuery) ||
      task.summary.toLowerCase().includes(lowerQuery)
    );
  });
}

export function sortTasksByDueDate(tasks: Task[]): Task[] {
  return [...tasks].sort((a, b) => {
    if (!a.dueDate && !b.dueDate) return 0;
    if (!a.dueDate) return 1;
    if (!b.dueDate) return -1;
    return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
  });
}

export function sortTasksByPriority(tasks: Task[]): Task[] {
  return [...tasks].sort((a, b) => b.priority - a.priority);
}

// ===== DATABASE EXPORT/IMPORT =====

export async function clearDatabase(): Promise<void> {
  const db = await initializeDatabase();
  const transaction = db.transaction(['tasks', 'labels', 'projects'], 'readwrite');

  ['tasks', 'labels', 'projects'].forEach((store) => {
    const request = transaction.objectStore(store).clear();
    return new Promise<void>((resolve, reject) => {
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  });
}
