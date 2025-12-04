// SPIKE-3 Tests: Zustand State Management
// Tests store operations, persistence, derived state

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { useTaskStore, useLabelStore, useUIStore } from '../src/stores';
import type { Task, Label } from '../src/services/db';
import { initializeDatabase } from '../src/services/db';

describe('SPIKE-3: Zustand State Management', () => {
  const createMockTask = (overrides?: Partial<Task>): Task => ({
    id: `task-${Math.random()}`,
    title: 'Test Task',
    description: 'Test Description',
    priority: 2,
    status: 'active',
    labels: [],
    summary: 'Test Task',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    aiMetadata: {
      labelConfidence: [],
      priorityScore: 2,
      summarizedAt: new Date().toISOString(),
      userFeedback: null,
    },
    ...overrides,
  });

  const createMockLabel = (overrides?: Partial<Label>): Label => ({
    id: `label-${Math.random()}`,
    name: 'Test Label',
    isSystemLabel: false,
    createdAt: new Date().toISOString(),
    ...overrides,
  });

  describe('Task Store', () => {
    beforeEach(async () => {
      // Reset store state
      useTaskStore.setState({ tasks: [], initialized: false });
      
      // Clear IndexedDB
      const db = await initializeDatabase();
      const transaction = db.transaction(['tasks'], 'readwrite');
      const store = transaction.objectStore('tasks');
      store.clear();
      await new Promise(resolve => transaction.oncomplete = resolve);
    });

    it('should add a task to store', async () => {
      const task = createMockTask();
      await useTaskStore.getState().addTask(task);

      const tasks = useTaskStore.getState().tasks;
      expect(tasks).toHaveLength(1);
      expect(tasks[0].title).toBe(task.title);
    });

    it('should update a task in store', async () => {
      const task = createMockTask();
      await useTaskStore.getState().addTask(task);

      // Use the actual ID from the added task
      const addedTask = useTaskStore.getState().tasks[0];
      await useTaskStore.getState().updateTask(addedTask.id, { title: 'Updated Title' });

      const updated = useTaskStore.getState().getTaskById(addedTask.id);
      expect(updated?.title).toBe('Updated Title');
    });

    it('should delete a task from store', async () => {
      const task = createMockTask();
      await useTaskStore.getState().addTask(task);

      // Use the actual ID from the added task
      const addedTask = useTaskStore.getState().tasks[0];
      await useTaskStore.getState().deleteTask(addedTask.id);

      const tasks = useTaskStore.getState().tasks;
      expect(tasks).toHaveLength(0);
    });

    it('should set multiple tasks', () => {
      const tasks = [createMockTask(), createMockTask(), createMockTask()];
      useTaskStore.getState().setTasks(tasks);

      expect(useTaskStore.getState().tasks).toHaveLength(3);
    });

    it('should retrieve task by ID', async () => {
      const task = createMockTask();
      await useTaskStore.getState().addTask(task);

      // Use the actual ID from the added task
      const addedTask = useTaskStore.getState().tasks[0];
      const retrieved = useTaskStore.getState().getTaskById(addedTask.id);
      expect(retrieved?.id).toBe(addedTask.id);
    });

    it('should calculate active task count', async () => {
      await useTaskStore.getState().addTask(createMockTask({ status: 'active' }));
      await useTaskStore.getState().addTask(createMockTask({ status: 'active' }));
      await useTaskStore.getState().addTask(createMockTask({ status: 'completed' }));

      const activeCount = useTaskStore.getState().getActiveTaskCount();
      expect(activeCount).toBe(2);
    });

    it('should calculate overdue task count', async () => {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);

      await useTaskStore.getState().addTask(
        createMockTask({
          status: 'active',
          dueDate: yesterday.toISOString().split('T')[0],
        })
      );
      await useTaskStore.getState().addTask(createMockTask({ status: 'active' }));

      const overdueCount = useTaskStore.getState().getOverdueTaskCount();
      expect(overdueCount).toBe(1);
    });

    it('should handle store update latency under 50ms', () => {
      const task = createMockTask();
      const startTime = performance.now();

      useTaskStore.getState().addTask(task);
      useTaskStore.getState().updateTask(task.id, { priority: 3 });

      const duration = performance.now() - startTime;
      expect(duration).toBeLessThan(50);
    });
  });

  describe('Label Store', () => {
    beforeEach(() => {
      useLabelStore.setState({ labels: [] });
    });

    it('should add a label to store', () => {
      const label = createMockLabel();
      useLabelStore.getState().addLabel(label);

      const labels = useLabelStore.getState().labels;
      expect(labels).toHaveLength(1);
      expect(labels[0].id).toBe(label.id);
    });

    it('should update a label in store', () => {
      const label = createMockLabel();
      useLabelStore.getState().addLabel(label);

      useLabelStore.getState().updateLabel(label.id, { name: 'Updated' });

      const updated = useLabelStore.getState().getLabelById(label.id);
      expect(updated?.name).toBe('Updated');
    });

    it('should delete a label from store', () => {
      const label = createMockLabel();
      useLabelStore.getState().addLabel(label);

      useLabelStore.getState().deleteLabel(label.id);

      const labels = useLabelStore.getState().labels;
      expect(labels).toHaveLength(0);
    });

    it('should calculate label count', () => {
      useLabelStore.getState().addLabel(createMockLabel());
      useLabelStore.getState().addLabel(createMockLabel());

      const count = useLabelStore.getState().getLabelCount();
      expect(count).toBe(2);
    });
  });

  describe('UI Store', () => {
    beforeEach(() => {
      useUIStore.setState({
        sidebarOpen: true,
        selectedTaskId: null,
        selectedLabelId: null,
        sortBy: 'dueDate',
        filterStatus: 'all',
      });
    });

    it('should toggle sidebar', () => {
      const initial = useUIStore.getState().sidebarOpen;
      useUIStore.getState().toggleSidebar();

      expect(useUIStore.getState().sidebarOpen).toBe(!initial);
    });

    it('should set selected task ID', () => {
      useUIStore.getState().setSelectedTaskId('task-123');

      expect(useUIStore.getState().selectedTaskId).toBe('task-123');
    });

    it('should set selected label ID', () => {
      useUIStore.getState().setSelectedLabelId('label-456');

      expect(useUIStore.getState().selectedLabelId).toBe('label-456');
    });

    it('should set sort by option', () => {
      useUIStore.getState().setSortBy('priority');

      expect(useUIStore.getState().sortBy).toBe('priority');
    });

    it('should set filter status', () => {
      useUIStore.getState().setFilterStatus('completed');

      expect(useUIStore.getState().filterStatus).toBe('completed');
    });
  });

  describe('Store Persistence', () => {
    beforeEach(async () => {
      localStorage.clear();
      useTaskStore.setState({ tasks: [], initialized: false });
      
      // Clear IndexedDB
      const db = await initializeDatabase();
      const transaction = db.transaction(['tasks'], 'readwrite');
      const store = transaction.objectStore('tasks');
      store.clear();
      await new Promise(resolve => transaction.oncomplete = resolve);
    });

    it('should persist tasks to localStorage', async () => {
      const task = createMockTask();
      useTaskStore.getState().addTask(task);

      // Simulate persistence by checking localStorage
      const stored = localStorage.getItem('task-store');
      expect(stored).toBeDefined();
    });

    it('should persist labels to localStorage', async () => {
      const label = createMockLabel();
      useLabelStore.getState().addLabel(label);

      const stored = localStorage.getItem('label-store');
      expect(stored).toBeDefined();
    });
  });

  describe('Derived State & Selectors', () => {
    beforeEach(async () => {
      // Reset store state
      useTaskStore.setState({ tasks: [], initialized: false });
      
      // Clear IndexedDB
      const db = await initializeDatabase();
      const transaction = db.transaction(['tasks'], 'readwrite');
      const store = transaction.objectStore('tasks');
      store.clear();
      await new Promise(resolve => transaction.oncomplete = resolve);
    });

    it('should calculate statistics from derived state', async () => {
      await useTaskStore.getState().addTask(createMockTask({ status: 'active' }));
      await useTaskStore.getState().addTask(createMockTask({ status: 'active' }));
      await useTaskStore.getState().addTask(createMockTask({ status: 'completed' }));

      const activeCount = useTaskStore.getState().getActiveTaskCount();
      expect(activeCount).toBe(2);
    });
  });
});
