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

/**
 * TaskService manages all task-related database operations
 * and serves as the bridge between the Zustand store and IndexedDB.
 * 
 * @class TaskService
 * @example
 * const tasks = await taskService.initialize();
 * const newTask = await taskService.createTask(taskData);
 */
class TaskService {
  private initialized = false;

  /**
   * Initialize the task service and load all tasks from storage
   * @returns {Promise<Task[]>} Array of all tasks in storage
   * @throws {Error} If database initialization fails
   */
  async initialize(): Promise<Task[]> {
    if (this.initialized) {
      return await getAllTasks();
    }

    await initializeDatabase();
    this.initialized = true;
    return await getAllTasks();
  }

  /**
   * Create a new task in the database
   * @param {Task} task - The task object to create (must have id and createdAt)
   * @returns {Promise<Task>} The created task with all fields populated
   * @throws {Error} If task creation fails or violates constraints
   */
  async createTask(task: Task): Promise<Task> {
    return await dbCreateTask(task);
  }

  /**
   * Update an existing task in the database
   * @param {string} id - The unique identifier of the task to update
   * @param {Partial<Task>} updates - Object containing fields to update
   * @returns {Promise<Task>} The updated task object
   * @throws {Error} If task not found or update fails
   */
  async updateTask(id: string, updates: Partial<Task>): Promise<Task> {
    return await dbUpdateTask(id, updates);
  }

  /**
   * Delete a task from the database
   * @param {string} id - The unique identifier of the task to delete
   * @returns {Promise<void>} Resolves when task is deleted
   * @throws {Error} If task not found or deletion fails
   */
  async deleteTask(id: string): Promise<void> {
    await dbDeleteTask(id);
  }

  /**
   * Retrieve all tasks from the database
   * @returns {Promise<Task[]>} Array of all tasks
   */
  async getAllTasks(): Promise<Task[]> {
    return await getAllTasks();
  }
}

export const taskService = new TaskService();
