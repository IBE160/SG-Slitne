// SPIKE-1 Tests: IndexedDB CRUD & Queries
// Tests database operations, performance, and constraints

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  initializeDatabase,
  createTask,
  getTask,
  getAllTasks,
  updateTask,
  deleteTask,
  getTasksByStatus,
  getTasksByPriority,
  getTasksByLabel,
  getUpcomingTasks,
  getOverdueTasks,
  bulkUpdateTasks,
  getTaskStats,
  searchTasks,
  sortTasksByDueDate,
  sortTasksByPriority,
  clearDatabase,
  type Task,
} from '../src/services/db';

describe('SPIKE-1: IndexedDB CRUD & Queries', () => {
  beforeEach(async () => {
    // Clear database before each test
    await clearDatabase();
  });

  describe('Database Initialization', () => {
    it('should initialize database successfully', async () => {
      const db = await initializeDatabase();
      expect(db).toBeDefined();
      expect(db.name).toBe('smart-todo-db');
    });

    it('should create required object stores', async () => {
      const db = await initializeDatabase();
      const storeNames = Array.from(db.objectStoreNames);
      expect(storeNames).toContain('tasks');
      expect(storeNames).toContain('labels');
      expect(storeNames).toContain('projects');
    });
  });

  describe('Task CRUD Operations', () => {
    it('should create a new task', async () => {
      const task = await createTask({
        title: 'Test Task',
        description: 'Test Description',
        priority: 2,
      });

      expect(task.id).toBeDefined();
      expect(task.title).toBe('Test Task');
      expect(task.status).toBe('active');
      expect(task.createdAt).toBeDefined();
    });

    it('should retrieve a task by ID', async () => {
      const created = await createTask({ title: 'Get Task' });
      const retrieved = await getTask(created.id);

      expect(retrieved).toBeDefined();
      expect(retrieved?.title).toBe('Get Task');
      expect(retrieved?.id).toBe(created.id);
    });

    it('should retrieve all tasks', async () => {
      await createTask({ title: 'Task 1' });
      await createTask({ title: 'Task 2' });
      await createTask({ title: 'Task 3' });

      const tasks = await getAllTasks();
      expect(tasks).toHaveLength(3);
    });

    it('should update a task', async () => {
      const created = await createTask({ title: 'Original Title', priority: 1 });
      const updated = await updateTask(created.id, {
        title: 'Updated Title',
        priority: 3,
      });

      expect(updated.title).toBe('Updated Title');
      expect(updated.priority).toBe(3);
      expect(updated.id).toBe(created.id);
      expect(updated.createdAt).toBe(created.createdAt);
    });

    it('should delete a task', async () => {
      const task = await createTask({ title: 'Task to Delete' });
      await deleteTask(task.id);

      const retrieved = await getTask(task.id);
      expect(retrieved).toBeNull();
    });
  });

  describe('Task Queries & Indexes', () => {
    beforeEach(async () => {
      // Create test data
      await createTask({ title: 'Active Task', status: 'active' as any });
      await createTask({ title: 'Completed Task', status: 'completed' as any });
      await createTask({ title: 'High Priority', priority: 3 });
      await createTask({ title: 'Low Priority', priority: 1 });
      await createTask({ title: 'Task with Label', labels: ['label-work'] });
    });

    it('should query tasks by status', async () => {
      const activeTasks = await getTasksByStatus('active');
      expect(activeTasks.length).toBeGreaterThan(0);
      expect(activeTasks.every((t) => t.status === 'active')).toBe(true);
    });

    it('should query tasks by priority', async () => {
      const highPriority = await getTasksByPriority(3);
      expect(highPriority.length).toBeGreaterThan(0);
      expect(highPriority.every((t) => t.priority === 3)).toBe(true);
    });

    it('should query tasks by label (multi-entry index)', async () => {
      const tasks = await getTasksByLabel('label-work');
      expect(tasks.length).toBeGreaterThan(0);
      expect(tasks.every((t) => t.labels.includes('label-work'))).toBe(true);
    });

    it('should query upcoming tasks', async () => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const tomorrowStr = tomorrow.toISOString().split('T')[0];

      await createTask({ title: 'Tomorrow Task', dueDate: tomorrowStr });

      const upcoming = await getUpcomingTasks(7);
      expect(upcoming.length).toBeGreaterThan(0);
    });
  });

  describe('Bulk Operations', () => {
    it('should bulk update multiple tasks', async () => {
      const task1 = await createTask({ title: 'Task 1', priority: 1 });
      const task2 = await createTask({ title: 'Task 2', priority: 1 });

      const updated = await bulkUpdateTasks([task1.id, task2.id], {
        priority: 3 as const,
      });

      expect(updated).toHaveLength(2);
      expect(updated.every((t) => t.priority === 3)).toBe(true);
    });
  });

  describe('Statistics & Search', () => {
    beforeEach(async () => {
      await createTask({ title: 'Active 1', status: 'active' as any });
      await createTask({ title: 'Active 2', status: 'active' as any });
      await createTask({ title: 'Completed 1', status: 'completed' as any });
      await createTask({ title: 'High Priority', priority: 3 });
    });

    it('should calculate task statistics', async () => {
      const stats = await getTaskStats();

      expect(stats.total).toBeGreaterThan(0);
      expect(stats.active).toBeGreaterThan(0);
      expect(stats.completed).toBeGreaterThan(0);
      expect(stats.highPriority).toBeGreaterThan(0);
    });

    it('should search tasks by text', async () => {
      const results = await searchTasks('Active');
      expect(results.length).toBeGreaterThan(0);
      expect(results.some((t) => t.title.includes('Active'))).toBe(true);
    });
  });

  describe('Sorting', () => {
    it('should sort tasks by due date', async () => {
      const today = new Date();
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      const task1 = await createTask({
        title: 'Today',
        dueDate: today.toISOString().split('T')[0],
      });
      const task2 = await createTask({
        title: 'Tomorrow',
        dueDate: tomorrow.toISOString().split('T')[0],
      });

      const tasks = [task2, task1];
      const sorted = sortTasksByDueDate(tasks);

      expect(sorted[0].title).toBe('Today');
      expect(sorted[1].title).toBe('Tomorrow');
    });

    it('should sort tasks by priority', async () => {
      const task1 = await createTask({ title: 'Low', priority: 1 });
      const task2 = await createTask({ title: 'High', priority: 3 });

      const tasks = [task1, task2];
      const sorted = sortTasksByPriority(tasks);

      expect(sorted[0].priority).toBe(3);
      expect(sorted[1].priority).toBe(1);
    });
  });

  describe('Performance Tests', () => {
    it('should create 100 tasks in reasonable time', async () => {
      const startTime = performance.now();

      for (let i = 0; i < 100; i++) {
        await createTask({ title: `Task ${i}`, priority: (i % 3) as any });
      }

      const duration = performance.now() - startTime;
      expect(duration).toBeLessThan(5000); // 5 seconds for 100 tasks
    });

    it('should query 100 tasks in under 500ms', async () => {
      for (let i = 0; i < 100; i++) {
        await createTask({ title: `Task ${i}` });
      }

      const startTime = performance.now();
      await getAllTasks();
      const duration = performance.now() - startTime;

      expect(duration).toBeLessThan(500);
    });

    it('should handle concurrent updates without data corruption', async () => {
      const task = await createTask({ title: 'Concurrent Test', priority: 1 });

      const updates = await Promise.all([
        updateTask(task.id, { priority: 2 }),
        updateTask(task.id, { priority: 3 }),
        updateTask(task.id, { priority: 2 }),
      ]);

      expect(updates).toHaveLength(3);
      const final = await getTask(task.id);
      expect(final?.priority).toBeDefined();
      expect([1, 2, 3]).toContain(final?.priority);
    });
  });
});
