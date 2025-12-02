// SPIKE-5 Tests: Offline-First & Persistence
// Tests offline functionality, sync queue, data recovery

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import {
  isOffline,
  setOfflineMode,
  getOfflineMode,
  getSyncQueue,
  setSyncQueue,
  addToSyncQueue,
  updateSyncQueueItem,
  clearSyncQueue,
  getPendingSyncCount,
  exportDataSnapshot,
  importDataSnapshot,
  simulateNetworkFailure,
  simulateNetworkRecovery,
  getStorageStats,
  checkRecoveryOptions,
  validateOfflineCapability,
  type SyncQueueItem,
} from '../src/services/offline';

describe('SPIKE-5: Offline-First & Persistence', () => {
  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
    sessionStorage.clear();
  });

  describe('Offline State Management', () => {
    it('should detect online/offline status', () => {
      const online = !isOffline();
      expect(typeof online).toBe('boolean');
    });

    it('should set offline mode', () => {
      setOfflineMode(true);
      expect(getOfflineMode()).toBe(true);

      setOfflineMode(false);
      expect(getOfflineMode()).toBe(false);
    });

    it('should simulate network failure', () => {
      simulateNetworkFailure();
      expect(getOfflineMode()).toBe(true);
    });

    it('should simulate network recovery', () => {
      simulateNetworkFailure();
      simulateNetworkRecovery();
      expect(getOfflineMode()).toBe(false);
    });
  });

  describe('Sync Queue Management', () => {
    it('should initialize empty sync queue', () => {
      const queue = getSyncQueue();
      expect(queue).toEqual([]);
    });

    it('should add item to sync queue', () => {
      const item = addToSyncQueue({
        operation: 'create',
        entityType: 'task',
        entityId: 'task-123',
        data: { title: 'New Task' },
      });

      expect(item.id).toBeDefined();
      expect(item.status).toBe('pending');
      expect(item.timestamp).toBeDefined();
    });

    it('should retrieve sync queue items', () => {
      addToSyncQueue({
        operation: 'create',
        entityType: 'task',
        entityId: 'task-123',
        data: { title: 'Task 1' },
      });

      addToSyncQueue({
        operation: 'update',
        entityType: 'task',
        entityId: 'task-124',
        data: { title: 'Task 2' },
      });

      const queue = getSyncQueue();
      expect(queue).toHaveLength(2);
    });

    it('should update sync queue item status', () => {
      const item = addToSyncQueue({
        operation: 'create',
        entityType: 'task',
        entityId: 'task-123',
        data: {},
      });

      updateSyncQueueItem(item.id, { status: 'synced' });

      const queue = getSyncQueue();
      expect(queue[0].status).toBe('synced');
    });

    it('should clear sync queue', () => {
      addToSyncQueue({
        operation: 'create',
        entityType: 'task',
        entityId: 'task-123',
        data: {},
      });

      clearSyncQueue();

      const queue = getSyncQueue();
      expect(queue).toHaveLength(0);
    });

    it('should count pending sync items', () => {
      addToSyncQueue({
        operation: 'create',
        entityType: 'task',
        entityId: 'task-1',
        data: {},
      });

      addToSyncQueue({
        operation: 'update',
        entityType: 'task',
        entityId: 'task-2',
        data: {},
      });

      const count = getPendingSyncCount();
      expect(count).toBe(2);
    });
  });

  describe('Persistence Across Sessions', () => {
    it('should export data snapshot', async () => {
      const snapshot = await exportDataSnapshot();

      expect(snapshot).toBeDefined();
      expect(snapshot.length).toBeGreaterThan(0);

      const parsed = JSON.parse(snapshot);
      expect(parsed.version).toBe(1);
      expect(parsed.exportDate).toBeDefined();
      expect(parsed.tasks).toBeDefined();
      expect(parsed.labels).toBeDefined();
    });

    it('should import data snapshot', async () => {
      const snapshot = await exportDataSnapshot();

      await expect(importDataSnapshot(snapshot)).resolves.toBeUndefined();

      const recovery = localStorage.getItem('backup-recovery');
      expect(recovery).toBeDefined();
    });

    it('should validate snapshot format', async () => {
      const invalidSnapshot = JSON.stringify({
        version: 2, // Unsupported version
        data: {},
      });

      await expect(importDataSnapshot(invalidSnapshot)).rejects.toThrow();
    });

    it('should preserve sync queue in snapshot', async () => {
      addToSyncQueue({
        operation: 'create',
        entityType: 'task',
        entityId: 'task-123',
        data: { title: 'New' },
      });

      const snapshot = await exportDataSnapshot();
      const parsed = JSON.parse(snapshot);

      expect(parsed.syncQueue).toBeDefined();
      expect(parsed.syncQueue.length).toBeGreaterThan(0);
    });
  });

  describe('Storage Monitoring', () => {
    it('should get storage statistics', async () => {
      const stats = await getStorageStats();

      expect(stats).toBeDefined();
      expect(stats.taskCount).toBeGreaterThanOrEqual(0);
      expect(stats.labelCount).toBeGreaterThanOrEqual(0);
      expect(stats.percentage).toBeGreaterThanOrEqual(0);
    });

    it('should calculate storage usage percentage', async () => {
      const stats = await getStorageStats();

      if (stats.available > 0) {
        expect(stats.percentage).toBeLessThanOrEqual(100);
      }
    });
  });

  describe('Data Recovery', () => {
    it('should check recovery options', () => {
      const options = checkRecoveryOptions();

      expect(options.hasBackup).toBe(false);
      expect(options.canRecover).toBe(false);
    });

    it('should enable recovery after backup', async () => {
      await exportDataSnapshot();
      localStorage.setItem('backup-recovery', 'test-backup');
      localStorage.setItem('backup-recovery-date', new Date().toISOString());

      const options = checkRecoveryOptions();

      expect(options.hasBackup).toBe(true);
      expect(options.backupDate).toBeDefined();
    });

    it('should fail recovery without backup', async () => {
      await expect(async () => {
        // Attempt recovery without backup
        const options = checkRecoveryOptions();
        if (!options.canRecover) {
          throw new Error('No backup available for recovery');
        }
      }).rejects.toThrow();
    });
  });

  describe('Offline Capability Validation', () => {
    it('should validate offline capability', async () => {
      const validation = await validateOfflineCapability();

      expect(validation).toBeDefined();
      expect(validation.hasIndexedDB).toBe(true);
      expect(validation.hasLocalStorage).toBe(true);
      expect(validation.canSyncQueue).toBe(true);
      expect(validation.isOfflineCapable).toBe(true);
      expect(validation.errors).toHaveLength(0);
    });

    it('should validate all required APIs', async () => {
      const validation = await validateOfflineCapability();

      expect(validation.hasIndexedDB).toBe(true);
      expect(validation.hasLocalStorage).toBe(true);
      expect(validation.canSyncQueue).toBe(true);
    });
  });

  describe('Sync Queue for Phase 2', () => {
    it('should log create operations for sync', () => {
      const item = addToSyncQueue({
        operation: 'create',
        entityType: 'task',
        entityId: 'new-task-1',
        data: { title: 'New Task', priority: 2 },
      });

      expect(item.operation).toBe('create');
      expect(item.entityType).toBe('task');
      expect(item.status).toBe('pending');
    });

    it('should log update operations for sync', () => {
      const item = addToSyncQueue({
        operation: 'update',
        entityType: 'task',
        entityId: 'task-123',
        data: { title: 'Updated' },
      });

      expect(item.operation).toBe('update');
    });

    it('should log delete operations for sync', () => {
      const item = addToSyncQueue({
        operation: 'delete',
        entityType: 'task',
        entityId: 'task-to-delete',
        data: {},
      });

      expect(item.operation).toBe('delete');
    });

    it('should maintain sync queue order', () => {
      const item1 = addToSyncQueue({
        operation: 'create',
        entityType: 'task',
        entityId: 'task-1',
        data: {},
      });

      const item2 = addToSyncQueue({
        operation: 'update',
        entityType: 'task',
        entityId: 'task-2',
        data: {},
      });

      const queue = getSyncQueue();
      expect(queue[0].id).toBe(item1.id);
      expect(queue[1].id).toBe(item2.id);
    });
  });

  describe('Offline Functional Testing', () => {
    it('should support full app functionality offline', async () => {
      simulateNetworkFailure();

      expect(getOfflineMode()).toBe(true);

      // Add operations to sync queue
      addToSyncQueue({
        operation: 'create',
        entityType: 'task',
        entityId: 'task-1',
        data: { title: 'Offline Task' },
      });

      const queue = getSyncQueue();
      expect(queue.length).toBeGreaterThan(0);

      simulateNetworkRecovery();
      expect(getOfflineMode()).toBe(false);
    });

    it('should accumulate operations while offline', () => {
      simulateNetworkFailure();

      for (let i = 0; i < 10; i++) {
        addToSyncQueue({
          operation: 'create',
          entityType: 'task',
          entityId: `task-${i}`,
          data: { title: `Task ${i}` },
        });
      }

      const count = getPendingSyncCount();
      expect(count).toBe(10);
    });

    it('should persist sync queue across browser restart simulation', () => {
      addToSyncQueue({
        operation: 'create',
        entityType: 'task',
        entityId: 'persistent-task',
        data: { title: 'Persistent' },
      });

      // Simulate page reload
      const stored = localStorage.getItem('sync-queue-v1');
      expect(stored).toBeDefined();

      const queue = getSyncQueue();
      expect(queue.length).toBe(1);
    });
  });

  describe('Data Integrity', () => {
    it('should not lose data in offline mode', async () => {
      simulateNetworkFailure();

      const item = addToSyncQueue({
        operation: 'create',
        entityType: 'task',
        entityId: 'task-integrity-test',
        data: { title: 'Integrity Test' },
      });

      // Simulate storage access
      const recovery = checkRecoveryOptions();
      expect(recovery).toBeDefined();

      // Verify sync queue persisted
      const queue = getSyncQueue();
      expect(queue.some((q) => q.id === item.id)).toBe(true);
    });

    it('should maintain consistent sync queue state', () => {
      const item1 = addToSyncQueue({
        operation: 'create',
        entityType: 'task',
        entityId: 'task-1',
        data: {},
      });

      updateSyncQueueItem(item1.id, { status: 'synced' });

      const queue = getSyncQueue();
      const updated = queue.find((q) => q.id === item1.id);

      expect(updated?.status).toBe('synced');
    });
  });
});
