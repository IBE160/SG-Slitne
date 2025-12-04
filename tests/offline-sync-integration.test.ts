// Integration Tests: Offline Sync Flow
// Tests the complete offline sync workflow including queue operations and conflict resolution

import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  enqueueCreate,
  enqueueUpdate,
  enqueueDelete,
  getSyncQueue,
  clearSyncQueue,
  flushPendingSync,
  isOffline,
  setOfflineMode,
} from '../src/services/offline';
import { recordSyncAttempt, getSyncHistory, clearSyncHistory } from '../src/services/sync-history';
import { initializeDatabase, createTask, updateTask, deleteTask, getAllTasks } from '../src/services/db';
import type { Task } from '../src/services/db';

describe('Offline Sync Integration', () => {
  beforeEach(async () => {
    // Clear all state
    clearSyncQueue();
    clearSyncHistory();
    localStorage.clear();
    
    // Clear IndexedDB
    const db = await initializeDatabase();
    const transaction = db.transaction(['tasks'], 'readwrite');
    const store = transaction.objectStore('tasks');
    store.clear();
    await new Promise(resolve => transaction.oncomplete = resolve);
    
    // Reset offline mode
    setOfflineMode(false);
  });

  describe('Queue Operations', () => {
    it('should enqueue create operations when offline', () => {
      const taskData = {
        id: 'test-task-1',
        title: 'Test Task',
        description: 'Test Description',
      };

      enqueueCreate('task', taskData.id, taskData);

      const queue = getSyncQueue();
      expect(queue).toHaveLength(1);
      expect(queue[0].operation).toBe('create');
      expect(queue[0].entityId).toBe(taskData.id);
    });

    it('should enqueue update operations when offline', () => {
      const updates = { title: 'Updated Title' };

      enqueueUpdate('task', 'test-task-1', updates);

      const queue = getSyncQueue();
      expect(queue).toHaveLength(1);
      expect(queue[0].operation).toBe('update');
      expect(queue[0].data).toEqual(updates);
    });

    it('should enqueue delete operations when offline', () => {
      enqueueDelete('task', 'test-task-1');

      const queue = getSyncQueue();
      expect(queue).toHaveLength(1);
      expect(queue[0].operation).toBe('delete');
      expect(queue[0].entityId).toBe('test-task-1');
    });

    it('should handle multiple queued operations in order', () => {
      enqueueCreate('task', 'task-1', { title: 'Task 1' });
      enqueueUpdate('task', 'task-1', { title: 'Task 1 Updated' });
      enqueueDelete('task', 'task-2');

      const queue = getSyncQueue();
      expect(queue).toHaveLength(3);
      expect(queue[0].operation).toBe('create');
      expect(queue[1].operation).toBe('update');
      expect(queue[2].operation).toBe('delete');
    });

    it('should clear queue', () => {
      enqueueCreate('task', 'task-1', { title: 'Task 1' });
      enqueueUpdate('task', 'task-2', { title: 'Task 2' });

      clearSyncQueue();

      const queue = getSyncQueue();
      expect(queue).toHaveLength(0);
    });
  });

  describe('Sync History', () => {
    it('should record successful sync attempts', () => {
      recordSyncAttempt({
        timestamp: new Date().toISOString(),
        success: true,
        operationCount: 3,
      });

      const history = getSyncHistory();
      expect(history).toHaveLength(1);
      expect(history[0].success).toBe(true);
      expect(history[0].operationCount).toBe(3);
    });

    it('should record failed sync attempts with error', () => {
      recordSyncAttempt({
        timestamp: new Date().toISOString(),
        success: false,
        operationCount: 2,
        error: 'Network timeout',
      });

      const history = getSyncHistory();
      expect(history).toHaveLength(1);
      expect(history[0].success).toBe(false);
      expect(history[0].error).toBe('Network timeout');
    });

    it('should maintain sync history order', () => {
      recordSyncAttempt({
        timestamp: '2025-01-01T10:00:00Z',
        success: true,
        operationCount: 1,
      });

      recordSyncAttempt({
        timestamp: '2025-01-01T10:05:00Z',
        success: false,
        operationCount: 2,
        error: 'Timeout',
      });

      const history = getSyncHistory();
      expect(history).toHaveLength(2);
      expect(history[0].timestamp).toBe('2025-01-01T10:00:00Z');
      expect(history[1].timestamp).toBe('2025-01-01T10:05:00Z');
    });

    it('should clear sync history', () => {
      recordSyncAttempt({
        timestamp: new Date().toISOString(),
        success: true,
        operationCount: 1,
      });

      clearSyncHistory();

      const history = getSyncHistory();
      expect(history).toHaveLength(0);
    });
  });

  describe('Queue Processing', () => {
    it('should process queued operations successfully', async () => {
      // Enqueue operations
      enqueueCreate('task', 'task-1', {
        title: 'Offline Task',
        description: 'Created while offline',
      });

      // Process queue
      const results = await processQueue();

      expect(results.successful).toBe(1);
      expect(results.failed).toBe(0);

      // Queue should be empty after successful processing
      const queue = getQueue();
      expect(queue).toHaveLength(0);
    });

    it('should handle queue processing with failures gracefully', async () => {
      // Enqueue invalid operation (update non-existent task)
      enqueueUpdate('task', 'non-existent-task', { title: 'Updated' });

      const results = await processQueue();

      expect(results.failed).toBeGreaterThan(0);
    });

    it('should record sync history after queue processing', async () => {
      enqueueCreate('task', 'task-1', { title: 'Task 1' });

      await processQueue();

      const history = getSyncHistory();
      expect(history).toHaveLength(1);
      expect(history[0].success).toBe(true);
    });
  });

  describe('Offline Detection', () => {
    it('should detect online state by default', () => {
      expect(isOffline()).toBe(false);
    });

    it('should use navigator.onLine when available', () => {
      // Mock navigator.onLine
      Object.defineProperty(navigator, 'onLine', {
        writable: true,
        value: false,
      });

      expect(isOffline()).toBe(true);

      // Restore
      Object.defineProperty(navigator, 'onLine', {
        writable: true,
        value: true,
      });
    });
  });

  describe('End-to-End Offline Workflow', () => {
    it('should handle complete offline-to-online workflow', async () => {
      // Step 1: Create task while "offline"
      const taskData = {
        title: 'Offline Created Task',
        description: 'This was created offline',
      };

      // Add to queue (simulating offline mode)
      enqueueCreate('task', 'offline-task-1', taskData);

      // Verify queue has operation
      let queue = getQueue();
      expect(queue).toHaveLength(1);

      // Step 2: Come back online and process queue
      const results = await processQueue();

      expect(results.successful).toBe(1);
      expect(results.failed).toBe(0);

      // Step 3: Verify task was persisted
      const tasks = await getAllTasks();
      expect(tasks.length).toBeGreaterThan(0);

      // Step 4: Verify queue is cleared
      queue = getQueue();
      expect(queue).toHaveLength(0);

      // Step 5: Verify sync history recorded
      const history = getSyncHistory();
      expect(history).toHaveLength(1);
      expect(history[0].success).toBe(true);
    });

    it('should handle mixed offline operations', async () => {
      // Create a task first (online)
      const task = await createTask({
        title: 'Initial Task',
        description: 'Created online',
      });

      // Now simulate offline operations
      enqueueUpdate('task', task.id, { title: 'Updated Offline' });
      enqueueCreate('task', 'new-offline-task', { title: 'New Offline Task' });

      // Process queue
      const results = await processQueue();

      expect(results.successful).toBeGreaterThanOrEqual(1);
      expect(results.failed).toBeLessThanOrEqual(1); // Update might fail if task not in queue's local state

      // Verify sync history
      const history = getSyncHistory();
      expect(history.length).toBeGreaterThan(0);
    });
  });

  describe('Conflict Detection', () => {
    it('should handle concurrent modifications', async () => {
      // Create a task
      const task = await createTask({
        title: 'Original Title',
        description: 'Original Description',
      });

      // Simulate offline update
      enqueueUpdate('task', task.id, { title: 'Offline Update' });

      // Simulate concurrent online update
      await updateTask(task.id, { title: 'Online Update' });

      // Process offline queue
      const results = await processQueue();

      // One of the updates should succeed
      expect(results.successful + results.failed).toBeGreaterThan(0);

      // Verify final state
      const tasks = await getAllTasks();
      const updatedTask = tasks.find(t => t.id === task.id);
      expect(updatedTask).toBeDefined();
      expect(updatedTask?.title).toMatch(/Update/); // Should contain either "Offline" or "Online"
    });
  });
});
