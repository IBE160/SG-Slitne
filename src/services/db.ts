// SPIKE-1: IndexedDB Service
// Purpose: Complete CRUD operations, query performance, transaction handling
/**
 * Database Service Module - IndexedDB operations for offline persistence
 * 
 * Provides complete CRUD operations for tasks, labels, and projects with
 * transaction support, indexing for performance, and full offline capability.
 * 
 * Stores:
 * - tasks: Main task storage with indexes on dueDate, priority, status, labels, projectId
 * - labels: Tag/category definitions with unique name constraint
 * - projects: Project organization with unique name constraint
 * 
 * @module db
 */

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

/**
 * Initialize the IndexedDB database with required stores
 * Creates object stores for tasks, labels, and projects with indexes
 * Safe to call multiple times - returns existing instance if already initialized
 * 
 * @returns {Promise<IDBDatabase>} The initialized database instance
 * @throws {Error} If database initialization fails
 */
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
/**
 * Create a new task in the database
 * Automatically generates UUID and timestamps
 * 
 * @param {Partial<Task>} taskData - Task data (title required, other fields optional)
 * @returns {Promise<Task>} The created task with generated id and timestamps
 * @throws {Error} If task creation fails (e.g., duplicate ID)
 * @example
 * const task = await createTask({ title: 'Buy milk', priority: 2 });
 */
export async function createTask(taskData: Partial<Task>): Promise<Task> {
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

/**
 * Retrieve all tasks from the database
 * @returns {Promise<Task[]>} Array of all tasks
 */
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

/**
 * Update an existing task in the database
 * Preserves creation timestamp and updates modification timestamp
 * 
 * @param {string} id - Task ID to update
 * @param {Partial<Task>} updates - Fields to update
 * @returns {Promise<Task>} The updated task
 * @throws {Error} If task not found
 */
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

/**
 * Delete a task from the database
 * 
 * @param {string} id - Task ID to delete
 * @returns {Promise<void>} Resolves when deletion is complete
 */
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

// ===== PROJECT CRUD OPERATIONS =====

export async function createProject(projectData: Partial<Project>): Promise<Project> {
  const db = await initializeDatabase();
  const transaction = db.transaction(['projects'], 'readwrite');
  const projectStore = transaction.objectStore('projects');

  const project: Project = {
    id: uuidv4(),
    name: projectData.name || 'Untitled Project',
    description: projectData.description || '',
    color: projectData.color || '#3B82F6', // Default blue
    status: projectData.status || 'active',
    taskCount: 0,
    createdAt: new Date().toISOString(),
  };

  return new Promise((resolve, reject) => {
    const request = projectStore.add(project);
    request.onsuccess = () => resolve(project);
    request.onerror = () => reject(request.error);
  });
}

export async function getProjectById(id: string): Promise<Project | null> {
  const db = await initializeDatabase();
  const transaction = db.transaction(['projects'], 'readonly');
  const projectStore = transaction.objectStore('projects');

  return new Promise((resolve, reject) => {
    const request = projectStore.get(id);
    request.onsuccess = () => resolve(request.result || null);
    request.onerror = () => reject(request.error);
  });
}

export async function getAllProjects(): Promise<Project[]> {
  const db = await initializeDatabase();
  const transaction = db.transaction(['projects'], 'readonly');
  const projectStore = transaction.objectStore('projects');

  return new Promise((resolve, reject) => {
    const request = projectStore.getAll();
    request.onsuccess = () => {
      const projects = request.result || [];
      resolve(projects);
    };
    request.onerror = () => reject(request.error);
  });
}

export async function updateProject(id: string, updates: Partial<Project>): Promise<Project> {
  const db = await initializeDatabase();
  const transaction = db.transaction(['projects'], 'readwrite');
  const projectStore = transaction.objectStore('projects');

  return new Promise((resolve, reject) => {
    const getRequest = projectStore.get(id);
    getRequest.onsuccess = () => {
      const project = getRequest.result;
      if (!project) {
        reject(new Error('Project not found'));
        return;
      }

      const updatedProject: Project = {
        ...project,
        ...updates,
        id,
        updatedAt: new Date().toISOString(),
      };

      const putRequest = projectStore.put(updatedProject);
      putRequest.onsuccess = () => resolve(updatedProject);
      putRequest.onerror = () => reject(putRequest.error);
    };
    getRequest.onerror = () => reject(getRequest.error);
  });
}

export async function deleteProject(id: string): Promise<void> {
  const db = await initializeDatabase();
  const transaction = db.transaction(['projects', 'tasks'], 'readwrite');
  const projectStore = transaction.objectStore('projects');
  const taskStore = transaction.objectStore('tasks');

  // First, unassign tasks from this project
  const tasksRequest = taskStore.index('projectId').getAll(id);
  
  return new Promise((resolve, reject) => {
    tasksRequest.onsuccess = () => {
      const tasks = tasksRequest.result || [];
      
      // Update all tasks to remove projectId
      const updatePromises = tasks.map((task) => {
        const updatedTask = { ...task, projectId: undefined };
        return new Promise<void>((res, rej) => {
          const updateRequest = taskStore.put(updatedTask);
          updateRequest.onsuccess = () => res();
          updateRequest.onerror = () => rej(updateRequest.error);
        });
      });

      Promise.all(updatePromises)
        .then(() => {
          // Now delete the project
          const deleteRequest = projectStore.delete(id);
          deleteRequest.onsuccess = () => resolve();
          deleteRequest.onerror = () => reject(deleteRequest.error);
        })
        .catch(reject);
    };
    tasksRequest.onerror = () => reject(tasksRequest.error);
  });
}

export async function getProjectTaskCount(projectId: string): Promise<number> {
  const db = await initializeDatabase();
  const transaction = db.transaction(['tasks'], 'readonly');
  const taskStore = transaction.objectStore('tasks');

  return new Promise((resolve, reject) => {
    const index = taskStore.index('projectId');
    const request = index.getAll(projectId);
    request.onsuccess = () => {
      const tasks = request.result || [];
      resolve(tasks.filter(t => t.status === 'active').length);
    };
    request.onerror = () => reject(request.error);
  });
}

export async function getProjectStats(projectId: string): Promise<{
  total: number;
  active: number;
  completed: number;
  completionRate: number;
}> {
  const db = await initializeDatabase();
  const transaction = db.transaction(['tasks'], 'readonly');
  const taskStore = transaction.objectStore('tasks');

  return new Promise((resolve, reject) => {
    const index = taskStore.index('projectId');
    const request = index.getAll(projectId);
    request.onsuccess = () => {
      const tasks = request.result || [];
      const active = tasks.filter(t => t.status === 'active').length;
      const completed = tasks.filter(t => t.status === 'completed').length;
      const total = active + completed;
      const completionRate = total > 0 ? (completed / total) * 100 : 0;
      
      resolve({ total, active, completed, completionRate });
    };
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
