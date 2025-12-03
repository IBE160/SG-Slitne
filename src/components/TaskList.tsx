import React, { useState, useMemo } from 'react';
import { useTaskStore } from '../stores';
import TaskItem from './TaskItem';
import type { Task } from '../services/db';

type SortOption = 'priority' | 'dueDate' | 'created';
type FilterOption = 'all' | '1' | '2' | '3';

export default function TaskList() {
  const tasks = useTaskStore((state) => state.tasks);
  const [sortBy, setSortBy] = useState<SortOption>('priority');
  const [filterPriority, setFilterPriority] = useState<FilterOption>('all');

  // Filter and sort tasks
  const displayedTasks = useMemo(() => {
    let filtered = tasks.filter((task) => task.status === 'active');

    // Filter by priority
    if (filterPriority !== 'all') {
      const priority = Number(filterPriority) as 1 | 2 | 3;
      filtered = filtered.filter((task) => task.priority === priority);
    }

    // Sort tasks
    const sorted = [...filtered].sort((a, b) => {
      if (sortBy === 'priority') {
        return b.priority - a.priority; // High to low
      } else if (sortBy === 'dueDate') {
        if (!a.dueDate) return 1;
        if (!b.dueDate) return -1;
        return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
      } else {
        // created
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
    });

    return sorted;
  }, [tasks, sortBy, filterPriority]);

  if (displayedTasks.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        <p className="text-lg mb-2">No tasks found</p>
        <p className="text-sm">
          {filterPriority !== 'all' 
            ? 'Try adjusting your filters' 
            : 'Add your first task to get started!'}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Sort and Filter Controls */}
      <div className="flex flex-wrap gap-3 items-center justify-between bg-gray-50 p-4 rounded-lg">
        <div className="flex items-center gap-2">
          <label htmlFor="sortBy" className="text-sm font-medium text-gray-700">
            Sort by:
          </label>
          <select
            id="sortBy"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortOption)}
            className="px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="priority">Priority</option>
            <option value="dueDate">Due Date</option>
            <option value="created">Created Date</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-gray-700">Filter:</label>
          <div className="flex gap-1">
            <button
              onClick={() => setFilterPriority('all')}
              className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
                filterPriority === 'all'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilterPriority('3')}
              className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
                filterPriority === '3'
                  ? 'bg-red-600 text-white'
                  : 'bg-white border border-red-300 text-red-700 hover:bg-red-50'
              }`}
            >
              High
            </button>
            <button
              onClick={() => setFilterPriority('2')}
              className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
                filterPriority === '2'
                  ? 'bg-yellow-600 text-white'
                  : 'bg-white border border-yellow-300 text-yellow-700 hover:bg-yellow-50'
              }`}
            >
              Medium
            </button>
            <button
              onClick={() => setFilterPriority('1')}
              className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
                filterPriority === '1'
                  ? 'bg-gray-600 text-white'
                  : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
            >
              Low
            </button>
          </div>
        </div>
      </div>

      {/* Task Count */}
      <div className="text-sm text-gray-600">
        Showing {displayedTasks.length} task{displayedTasks.length !== 1 ? 's' : ''}
      </div>

      {/* Task List */}
      <div className="space-y-2">
        {displayedTasks.map((task) => (
          <TaskItem key={task.id} task={task} />
        ))}
      </div>
    </div>
  );
}
