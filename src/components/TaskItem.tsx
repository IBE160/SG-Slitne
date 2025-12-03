import React from 'react';
import type { Task } from '../services/db';
import { useTaskStore } from '../stores';

interface TaskItemProps {
  task: Task;
}

export default function TaskItem({ task }: TaskItemProps) {
  const { updateTask, deleteTask } = useTaskStore();

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
    <div className={`border-l-4 rounded-lg p-4 shadow-sm ${getPriorityColor(task.priority)}`}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={task.status === 'completed'}
              onChange={handleToggleComplete}
              className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
            />
            <div>
              <h3 className={`font-medium ${task.status === 'completed' ? 'line-through text-gray-500' : 'text-gray-900'}`}>
                {task.title}
              </h3>
              {task.description && (
                <p className="text-sm text-gray-600 mt-1">{task.description}</p>
              )}
              {task.dueDate && (
                <p className="text-xs text-gray-500 mt-2">
                  Due: {new Date(task.dueDate).toLocaleDateString()}
                </p>
              )}
            </div>
          </div>
        </div>
        <button
          onClick={handleDelete}
          className="text-gray-400 hover:text-red-600 ml-4"
          aria-label="Delete task"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
      </div>
    </div>
  );
}
