import React, { useMemo } from 'react';
import type { Task } from '../services/db';
import { useTaskStore } from '../stores';
import { isOffline } from '../services/offline';
import { generateSummary, scorePriority } from '../services/ai-engine';

interface TaskItemProps {
  task: Task;
}

export default function TaskItem({ task }: TaskItemProps) {
  const { updateTask, deleteTask } = useTaskStore();
  const aiAnalysisEnabled = useTaskStore((s) => s.aiAnalysisEnabled);
  const offline = useMemo(() => isOffline(), []);
  const summaryText = useMemo(() => {
    if (!aiAnalysisEnabled) return null;
    const s = generateSummary(task.title, task.description || '');
    return s.summary;
  }, [aiAnalysisEnabled, task.title, task.description]);

  const aiPriorityText = useMemo(() => {
    if (!aiAnalysisEnabled) return null;
    const p = scorePriority(task.title, task.dueDate, task.description || '');
    const label = p.score === 3 ? 'High' : p.score === 2 ? 'Medium' : 'Low';
    return `AI priority: ${label}`;
  }, [aiAnalysisEnabled, task.title, task.dueDate, task.description]);

  const handleToggleComplete = async () => {
    try {
      await updateTask(task.id, {
        status: task.status === 'active' ? 'completed' : 'active',
        completedAt: task.status === 'active' ? new Date().toISOString() : undefined,
      });
    } catch (error) {
      console.error('Failed to update task:', error);
      alert('Failed to update task. Please try again.');
    }
  };

  const handleDelete = async () => {
    if (confirm('Delete this task?')) {
      try {
        await deleteTask(task.id);
      } catch (error) {
        console.error('Failed to delete task:', error);
        alert('Failed to delete task. Please try again.');
      }
    }
  };

  const getPriorityColor = (priority: number) => {
    if (priority === 3) return 'border-red-500 bg-red-50';
    if (priority === 2) return 'border-yellow-500 bg-yellow-50';
    return 'border-gray-300 bg-white';
  };

  return (
    <div className={`border-l-4 rounded-lg p-3 sm:p-4 shadow-sm ${getPriorityColor(task.priority)}`}>
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-start gap-2 sm:gap-3">
            <input
              type="checkbox"
              checked={task.status === 'completed'}
              onChange={handleToggleComplete}
              aria-label={`Mark "${task.title}" as ${task.status === 'completed' ? 'incomplete' : 'complete'}`}
              className="w-4 h-4 sm:w-5 sm:h-5 mt-0.5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500 flex-shrink-0 cursor-pointer"
            />
            {offline && (
              <span
                className="px-2 py-0.5 text-[11px] rounded-md bg-orange-100 text-orange-800 border border-orange-200 flex-shrink-0"
                title="Status change will be queued for cloud sync while offline"
              >
                queued
              </span>
            )}
            <div className="flex-1 min-w-0">
              <h3 className={`text-sm sm:text-base font-medium break-words ${task.status === 'completed' ? 'line-through text-gray-500' : 'text-gray-900'}`}>
                {task.title}
              </h3>
              {task.description && (
                <p className="text-xs sm:text-sm text-gray-600 mt-1 break-words">{task.description}</p>
              )}
              {summaryText && (
                <p className="text-xs text-gray-500 mt-1" title="AI-generated local summary">
                  Summary: {summaryText}
                </p>
              )}
              {task.labels && task.labels.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {task.labels.map((label) => (
                    <span
                      key={label}
                      className="inline-block px-2 py-0.5 text-xs bg-blue-100 text-blue-800 rounded-full"
                    >
                      {label}
                    </span>
                  ))}
                </div>
              )}
              {(task.dueDate || aiPriorityText) && (
                <p className="text-xs text-gray-500 mt-2 flex items-center gap-2">
                  {task.dueDate && (
                    <span>
                      Due: {new Date(task.dueDate).toLocaleDateString()}
                    </span>
                  )}
                  {aiPriorityText && (
                    <span title="AI-estimated based on urgency, due date proximity, and context">
                      {aiPriorityText}
                    </span>
                  )}
                </p>
              )}
            </div>
          </div>
        </div>
        <button
          onClick={handleDelete}
          className="text-gray-400 hover:text-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 rounded flex-shrink-0 p-1 transition-colors"
          aria-label={`Delete task "${task.title}"`}
          title="Delete this task"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
        {offline && (
          <span className="ml-2 px-2 py-0.5 text-[11px] rounded-md bg-orange-100 text-orange-800 border border-orange-200 flex-shrink-0" title="Action will be queued for cloud sync while offline">
            queued
          </span>
        )}
      </div>
    </div>
  );
}
