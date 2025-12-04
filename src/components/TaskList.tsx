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
  const [searchQuery, setSearchQuery] = useState('');

  // Filter and sort tasks
  const displayedTasks = useMemo(() => {
    let filtered = tasks.filter((task) => task.status === 'active');

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter((task) => {
        const titleMatch = task.title.toLowerCase().includes(query);
        const descriptionMatch = task.description.toLowerCase().includes(query);
        const labelMatch = task.labels.some((label) => label.toLowerCase().includes(query));
        return titleMatch || descriptionMatch || labelMatch;
      });
    }

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
  }, [tasks, sortBy, filterPriority, searchQuery]);

  if (displayedTasks.length === 0) {
    return (
      <div className="space-y-4">
        {/* Search Bar */}
        <div className="relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search tasks..."
            className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
          <svg
            className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>

        <div className="text-center py-12 text-gray-500">
          <p className="text-lg mb-2">No tasks found</p>
          <p className="text-sm">
            {searchQuery.trim()
              ? 'No tasks match your search'
              : filterPriority !== 'all'
              ? 'Try adjusting your filters'
              : 'Add your first task to get started!'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <div className="relative">
        <label htmlFor="search-tasks" className="sr-only">Search tasks</label>
        <input
          id="search-tasks"
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search tasks..."
          aria-label="Search tasks by title, description, or label"
          className="w-full px-4 py-2 pl-10 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
        <svg
          className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded transition-colors"
            aria-label="Clear search"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      {/* Sort and Filter Controls */}
      <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between bg-gray-50 p-3 sm:p-4 rounded-lg">
        <div className="flex items-center gap-2">
          <label htmlFor="sortBy" className="text-xs sm:text-sm font-medium text-gray-700 flex-shrink-0">
            Sort by:
          </label>
          <select
            id="sortBy"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortOption)}
            aria-label="Sort tasks by"
            className="flex-1 sm:flex-none px-2 sm:px-3 py-1.5 text-xs sm:text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="priority">Priority</option>
            <option value="dueDate">Due Date</option>
            <option value="created">Created</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          <label className="text-xs sm:text-sm font-medium text-gray-700 flex-shrink-0">Filter by priority:</label>
          <div className="flex gap-1 flex-wrap">
            <button
              onClick={() => setFilterPriority('all')}
              aria-label="Filter all priorities"
              aria-pressed={filterPriority === 'all'}
              className={`px-2 sm:px-3 py-1 sm:py-1.5 text-xs sm:text-sm rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-blue-500 ${
                filterPriority === 'all'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilterPriority('3')}
              aria-label="Filter high priority tasks"
              aria-pressed={filterPriority === '3'}
              className={`px-2 sm:px-3 py-1 sm:py-1.5 text-xs sm:text-sm rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-blue-500 ${
                filterPriority === '3'
                  ? 'bg-red-600 text-white'
                  : 'bg-white border border-red-300 text-red-700 hover:bg-red-50'
              }`}
            >
              High
            </button>
            <button
              onClick={() => setFilterPriority('2')}
              aria-label="Filter medium priority tasks"
              aria-pressed={filterPriority === '2'}
              className={`px-2 sm:px-3 py-1 sm:py-1.5 text-xs sm:text-sm rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-blue-500 ${
                filterPriority === '2'
                  ? 'bg-yellow-600 text-white'
                  : 'bg-white border border-yellow-300 text-yellow-700 hover:bg-yellow-50'
              }`}
            >
              Medium
            </button>
            <button
              onClick={() => setFilterPriority('1')}
              aria-label="Filter low priority tasks"
              aria-pressed={filterPriority === '1'}
              className={`px-2 sm:px-3 py-1 sm:py-1.5 text-xs sm:text-sm rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-blue-500 ${
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
      <div className="text-sm text-gray-600" aria-live="polite" aria-atomic="true">
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
