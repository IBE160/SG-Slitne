// SPIKE-4 Tests: Heuristic AI Engine
// Tests label suggestion, priority scoring, summarization

import { describe, it, expect } from 'vitest';
import {
  suggestLabels,
  scorePriority,
  generateSummary,
  processTaskWithAI,
  batchProcessTasks,
  evaluateAccuracy,
  type Task,
} from '../src/services/ai-engine';

describe('SPIKE-4: Heuristic AI Engine', () => {
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

  describe('Label Suggester', () => {
    it('should suggest work label for work-related tasks', () => {
      const suggestions = suggestLabels('Meeting with team lead', 'Discuss project deadline', 2);

      expect(suggestions.length).toBeGreaterThan(0);
      expect(suggestions.some((s) => s.label === 'work')).toBe(true);
      expect(suggestions[0].confidence).toBeGreaterThan(0.3);
    });

    it('should suggest shopping label for shopping tasks', () => {
      const suggestions = suggestLabels('Buy groceries at store', 'Shopping for weekly items', 1);

      expect(suggestions.some((s) => s.label === 'shopping')).toBe(true);
    });

    it('should suggest health label for health tasks', () => {
      const suggestions = suggestLabels('Doctor appointment', 'Annual checkup', 2);

      expect(suggestions.some((s) => s.label === 'health')).toBe(true);
    });

    it('should suggest urgent label for urgent tasks', () => {
      const suggestions = suggestLabels('URGENT: Fix critical bug', 'Production issue ASAP', 3);

      expect(suggestions.some((s) => s.label === 'urgent')).toBe(true);
    });

    it('should return top 3 suggestions', () => {
      const suggestions = suggestLabels('Work meeting for urgent personal shopping', '', 3);

      expect(suggestions.length).toBeLessThanOrEqual(3);
    });

    it('should include confidence scores', () => {
      const suggestions = suggestLabels('Work task', '', 2);

      suggestions.forEach((s) => {
        expect(s.confidence).toBeGreaterThanOrEqual(0);
        expect(s.confidence).toBeLessThanOrEqual(1);
      });
    });

    it('should complete label suggestion under 200ms', () => {
      const startTime = performance.now();

      suggestLabels('Work meeting about urgent shopping', 'Description text', 3);

      const duration = performance.now() - startTime;
      expect(duration).toBeLessThan(200);
    });
  });

  describe('Priority Scorer', () => {
    it('should score urgent tasks as high priority', () => {
      const score = scorePriority('URGENT: Fix bug', '2025-12-03', 'Production issue');

      expect(score.score).toBe(3);
    });

    it('should score overdue tasks as high priority', () => {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toISOString().split('T')[0];

      const score = scorePriority('Task', yesterdayStr, 'Description');

      expect(score.score).toBeGreaterThan(1);
    });

    it('should score tasks due tomorrow as high priority', () => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const tomorrowStr = tomorrow.toISOString().split('T')[0];

      const score = scorePriority('Task', tomorrowStr, '');

      expect(score.score).toBe(3);
    });

    it('should score tasks due in 7 days as medium priority', () => {
      const nextWeek = new Date();
      nextWeek.setDate(nextWeek.getDate() + 7);
      const nextWeekStr = nextWeek.toISOString().split('T')[0];

      const score = scorePriority('Task', nextWeekStr, '');

      expect(score.score).toBeGreaterThanOrEqual(1);
    });

    it('should include reasoning in score', () => {
      const score = scorePriority('Task', '2025-12-10', 'Detailed description');

      expect(score.reasoning).toBeDefined();
      expect(score.reasoning.length).toBeGreaterThan(0);
    });

    it('should complete priority scoring under 50ms', () => {
      const startTime = performance.now();

      scorePriority('Task', '2025-12-05', 'Description');

      const duration = performance.now() - startTime;
      expect(duration).toBeLessThan(50);
    });
  });

  describe('Summarizer', () => {
    it('should generate summary from title', () => {
      const summary = generateSummary('Buy groceries', '');

      expect(summary.summary).toContain('Buy groceries');
      expect(summary.summary.length).toBeGreaterThan(0);
      expect(summary.summary.length).toBeLessThanOrEqual(255);
    });

    it('should extract key points from description', () => {
      const summary = generateSummary(
        'Task',
        'First key point. Second key point. Third point.'
      );

      expect(summary.keyPoints.length).toBeGreaterThan(0);
    });

    it('should include generated timestamp', () => {
      const summary = generateSummary('Task', '');

      expect(summary.generatedAt).toBeDefined();
      const date = new Date(summary.generatedAt);
      expect(date.getTime()).toBeGreaterThan(0);
    });

    it('should limit summary to 255 characters', () => {
      const longTitle = 'A'.repeat(300);
      const summary = generateSummary(longTitle, '');

      expect(summary.summary.length).toBeLessThanOrEqual(255);
    });

    it('should complete summarization under 100ms', () => {
      const startTime = performance.now();

      generateSummary('Task Title', 'Description text with details');

      const duration = performance.now() - startTime;
      expect(duration).toBeLessThan(100);
    });
  });

  describe('Batch Processing', () => {
    it('should process single task with AI', async () => {
      const task = createMockTask({
        title: 'Work meeting',
        description: 'Urgent project deadline',
      });

      const result = await processTaskWithAI(task);

      expect(result.taskId).toBe(task.id);
      expect(result.labelSuggestions.length).toBeGreaterThan(0);
      expect(result.priorityScore).toBeDefined();
      expect(result.summary).toBeDefined();
      expect(result.processingTime).toBeGreaterThan(0);
    });

    it('should process 100 tasks in batch', async () => {
      const tasks: Task[] = [];
      for (let i = 0; i < 100; i++) {
        tasks.push(
          createMockTask({
            title: `Task ${i}`,
            description: `Description ${i}`,
          })
        );
      }

      const startTime = performance.now();
      const results = await batchProcessTasks(tasks);
      const duration = performance.now() - startTime;

      expect(results).toHaveLength(100);
      expect(duration).toBeLessThan(30000); // 30 seconds for 100 tasks
    });

    it('should return consistent processing time data', async () => {
      const task = createMockTask();
      const result = await processTaskWithAI(task);

      expect(result.processingTime).toBeGreaterThanOrEqual(0);
      expect(result.processingTime).toBeLessThan(200);
    });
  });

  describe('Accuracy Evaluation', () => {
    it('should evaluate batch accuracy', async () => {
      const tasks = [
        createMockTask({ title: 'Work meeting', priority: 2 }),
        createMockTask({ title: 'Buy groceries', priority: 1 }),
        createMockTask({ title: 'Urgent bug fix', priority: 3 }),
      ];

      const results = await batchProcessTasks(tasks);
      const accuracy = evaluateAccuracy(results);

      expect(accuracy.avgLabelConfidence).toBeGreaterThan(0);
      expect(accuracy.priorityAccuracy).toBeGreaterThan(0);
      expect(accuracy.summaryQuality).toBeGreaterThan(0);
      expect(accuracy.overallScore).toBeGreaterThan(0);
    });

    it('should return zero metrics for empty results', () => {
      const accuracy = evaluateAccuracy([]);

      expect(accuracy.avgLabelConfidence).toBe(0);
      expect(accuracy.priorityAccuracy).toBe(0);
      expect(accuracy.summaryQuality).toBe(0);
      expect(accuracy.overallScore).toBe(0);
    });

    it('should achieve ~80% overall accuracy', async () => {
      const tasks = [
        createMockTask({ title: 'Work', priority: 2 }),
        createMockTask({ title: 'Personal', priority: 1 }),
        createMockTask({ title: 'Urgent', priority: 3 }),
        createMockTask({ title: 'Health appointment', priority: 2 }),
        createMockTask({ title: 'Shopping', priority: 1 }),
      ];

      const results = await batchProcessTasks(tasks);
      const accuracy = evaluateAccuracy(results);

      expect(accuracy.overallScore).toBeGreaterThan(0.75);
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty task title', async () => {
      const task = createMockTask({ title: '', description: 'Only description' });
      const result = await processTaskWithAI(task);

      expect(result).toBeDefined();
      expect(result.summary).toBeDefined();
    });

    it('should handle very long descriptions', async () => {
      const longDesc = 'A'.repeat(10000);
      const task = createMockTask({
        title: 'Task',
        description: longDesc,
      });

      const result = await processTaskWithAI(task);
      expect(result).toBeDefined();
    });

    it('should handle missing due date', async () => {
      const score = scorePriority('Task', undefined, 'Description');

      expect(score).toBeDefined();
      expect(score.score).toBeGreaterThan(0);
    });

    it('should not crash on null values', async () => {
      const task = createMockTask({
        title: 'Task',
        description: '',
      });

      const result = await processTaskWithAI(task);
      expect(result).toBeDefined();
    });
  });
});
