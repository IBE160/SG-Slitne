// TaskService: Bridge between Zustand store and IndexedDB
// Handles persistence and sync logic

import {
  initializeDatabase,
  createTask as dbCreateTask,
  updateTask as dbUpdateTask,
  deleteTask as dbDeleteTask,
  getAllTasks,
  type Task,
} from './db';

class TaskService {
  private initialized = false;

  async initialize(): Promise<Task[]> {
    if (this.initialized) {
      return await getAllTasks();
    }

    await initializeDatabase();
    this.initialized = true;
    return await getAllTasks();
  }

  async createTask(task: Task): Promise<Task> {
    return await dbCreateTask(task);
  }

  async updateTask(id: string, updates: Partial<Task>): Promise<Task> {
    return await dbUpdateTask(id, updates);
  }

  async deleteTask(id: string): Promise<void> {
    await dbDeleteTask(id);
  }

  async getAllTasks(): Promise<Task[]> {
    return await getAllTasks();
  }
}

export const taskService = new TaskService();
