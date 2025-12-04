import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { useTaskStore } from '../stores';
import TaskItem from './TaskItem';
import type { Project } from '../services/db';
import { getAllProjects } from '../services/db';

type SortOption = 'priority' | 'dueDate' | 'created';
type FilterOption = 'all' | '1' | '2' | '3';

const TaskList = React.memo(function TaskList() {
  const tasks = useTaskStore((state) => state.tasks);
  const savedViews = useTaskStore((state) => state.savedViews);
  const currentViewId = useTaskStore((state) => state.currentViewId);
  const setCurrentView = useTaskStore((state) => state.setCurrentView);
  const { updateTask, deleteTask } = useTaskStore();
  
  const [sortBy, setSortBy] = useState<SortOption>('priority');
  const [filterPriority, setFilterPriority] = useState<FilterOption>('all');
  const [filterProject, setFilterProject] = useState<string>('all');
  const [projects, setProjects] = useState<Project[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showViewManager, setShowViewManager] = useState(false);
  const [saveViewName, setSaveViewName] = useState('');
  
  // Bulk operations state
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedTasks, setSelectedTasks] = useState<Set<string>>(new Set());
  const [showBulkActions, setShowBulkActions] = useState(false);
  // Load projects
  useEffect(() => {
    loadProjects();
  }, []);

  // Update bulk actions visibility when selection changes
  useEffect(() => {
    setShowBulkActions(selectedTasks.size > 0);
  }, [selectedTasks]);

  const loadProjects = useCallback(async () => {
    const allProjects = await getAllProjects();
    setProjects(allProjects.filter(p => p.status === 'active'));
  }, []);

  const toggleSelectionMode = useCallback(() => {
    setSelectionMode(prev => !prev);
    setSelectedTasks(new Set());
  }, []);

  const toggleTaskSelection = useCallback((taskId: string) => {
    setSelectedTasks(prev => {
      const newSelection = new Set(prev);
      if (newSelection.has(taskId)) {
        newSelection.delete(taskId);
      } else {
        newSelection.add(taskId);
      }
      return newSelection;
    });
  }, []);

  const selectAll = useCallback(() => {
    setSelectedTasks(new Set(displayedTasks.map(t => t.id)));
  }, [displayedTasks]);

  const deselectAll = useCallback(() => {
    setSelectedTasks(new Set());
  }, []);

  const handleBulkComplete = useCallback(async () => {
    const confirmed = confirm(`Mark ${selectedTasks.size} task(s) as complete?`);
    if (!confirmed) return;

    for (const taskId of selectedTasks) {
      await updateTask(taskId, {
        status: 'completed' as const,
      });
    }
    setSelectedTasks(new Set());
  }, [selectedTasks, updateTask]);

  const handleBulkDelete = useCallback(async () => {
    const confirmed = confirm(`Delete ${selectedTasks.size} task(s)? This cannot be undone.`);
    if (!confirmed) return;

    for (const taskId of selectedTasks) {
      await deleteTask(taskId);
    }
    setSelectedTasks(new Set());
  }, [selectedTasks, deleteTask]);

  const handleBulkMoveToProject = useCallback(async (projectId: string) => {
    for (const taskId of selectedTasks) {
      await updateTask(taskId, { 
        projectId: projectId === 'none' ? undefined : projectId 
      } as any); // Type assertion needed for optional field
    }
    setSelectedTasks(new Set());
  }, [selectedTasks, updateTask]);

  // When a view is selected, apply its settings
  useEffect(() => {
    if (currentViewId) {
      const view = savedViews.find(v => v.id === currentViewId);
      if (view) {
        setSortBy(view.sortBy);
        setFilterPriority(view.filterPriority);
        setFilterProject(view.filterProject || 'all');
        setSearchQuery(view.searchQuery || '');
      }
    }
  }, [currentViewId, savedViews]);

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

    // Filter by project
    if (filterProject !== 'all') {
      if (filterProject === 'none') {
        // Show tasks without a project
        filtered = filtered.filter((task) => !task.projectId);
      } else {
        // Show tasks from specific project
        filtered = filtered.filter((task) => task.projectId === filterProject);
      }
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
  }, [tasks, sortBy, filterPriority, filterProject, searchQuery]);

  return (
    <div className="space-y-4">
      {/* View Selector */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium text-blue-900">Quick Views:</label>
          <button
            onClick={() => setShowViewManager(!showViewManager)}
            className="text-xs px-2 py-1 rounded bg-blue-200 text-blue-800 hover:bg-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
            aria-label="Manage views"
          >
            {showViewManager ? 'Hide' : 'Manage'}
          </button>
        </div>
        <div className="flex flex-wrap gap-2">
          {savedViews.length > 0 ? (
            savedViews.map((view) => (
              <button
                key={view.id}
                onClick={() => setCurrentView(view.id)}
                aria-pressed={currentViewId === view.id}
                className={`px-3 py-1 text-xs rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-blue-500 ${
                  currentViewId === view.id
                    ? 'bg-blue-600 text-white'
                    : 'bg-white border border-blue-300 text-blue-700 hover:bg-blue-50'
                }`}
              >
                {view.name}
              </button>
            ))
          ) : (
            <span className="text-xs text-blue-600">No views available</span>
          )}
        </div>

        {showViewManager && (
          <div className="mt-3 pt-3 border-t border-blue-200 space-y-2">
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="View name (e.g., 'My Priority')"
                value={saveViewName}
                onChange={(e) => setSaveViewName(e.target.value)}
                className="flex-1 px-2 py-1 text-xs border border-blue-300 rounded focus:ring-2 focus:ring-blue-500"
                aria-label="New view name"
              />
              <button
                onClick={() => {
                  if (saveViewName.trim()) {
                    try {
                      useTaskStore.getState().saveNewView(saveViewName, sortBy, filterPriority, filterProject, searchQuery);
                      setSaveViewName('');
                    } catch (error) {
                      alert(`Error: ${error instanceof Error ? error.message : 'Failed to save view'}`);
                    }
                  }
                }}
                className="px-3 py-1 text-xs bg-green-600 text-white rounded hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50"
                disabled={!saveViewName.trim()}
                aria-label="Save current view"
              >
                Save View
              </button>
            </div>
            {/* Custom views list with delete option */}
            <div className="space-y-1 max-h-32 overflow-y-auto">
              {savedViews.filter(v => !v.isPreset).map((view) => (
                <div key={view.id} className="flex items-center justify-between gap-2 p-1 bg-white rounded border border-blue-100 text-xs">
                  <span className="text-blue-700 truncate">{view.name}</span>
                  <button
                    onClick={() => {
                      if (confirm(`Delete view "${view.name}"?`)) {
                        useTaskStore.getState().deleteViewById(view.id);
                        if (currentViewId === view.id) {
                          setCurrentView(null);
                        }
                      }
                    }}
                    className="text-red-600 hover:text-red-800 focus:outline-none text-xs px-1 py-0.5 rounded hover:bg-red-50"
                    aria-label={`Delete view ${view.name}`}
                  >
                    Delete
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

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
      <div className="flex flex-col gap-3 bg-gray-50 p-3 sm:p-4 rounded-lg">
        {/* Sort and Project Filter Row */}
        <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
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
            <label htmlFor="filterProject" className="text-xs sm:text-sm font-medium text-gray-700 flex-shrink-0">
              Project:
            </label>
            <select
              id="filterProject"
              value={filterProject}
              onChange={(e) => setFilterProject(e.target.value)}
              aria-label="Filter by project"
              className="flex-1 sm:flex-none px-2 sm:px-3 py-1.5 text-xs sm:text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Projects</option>
              <option value="none">No Project</option>
              {projects.map((project) => (
                <option key={project.id} value={project.id}>
                  {project.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Priority Filter Row */}
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

      {/* Task Count and Selection Mode Toggle */}
      <div className="flex items-center justify-between" aria-live="polite" aria-atomic="true">
        <div className="text-sm text-gray-600">
          Showing {displayedTasks.length} task{displayedTasks.length !== 1 ? 's' : ''}
          {selectionMode && selectedTasks.size > 0 && (
            <span className="ml-2 text-blue-600 font-medium">
              ({selectedTasks.size} selected)
            </span>
          )}
        </div>
        {displayedTasks.length > 0 && (
          <button
            onClick={toggleSelectionMode}
            className={`px-3 py-1 text-xs rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              selectionMode
                ? 'bg-blue-600 text-white hover:bg-blue-700'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {selectionMode ? 'Exit Selection' : 'Select Tasks'}
          </button>
        )}
      </div>

      {/* Bulk Actions Bar */}
      {showBulkActions && selectionMode && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <div className="flex flex-col sm:flex-row gap-2 sm:items-center sm:justify-between">
            <div className="flex items-center gap-2">
              <button
                onClick={selectAll}
                className="text-xs px-2 py-1 rounded bg-blue-100 text-blue-700 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                Select All
              </button>
              <button
                onClick={deselectAll}
                className="text-xs px-2 py-1 rounded bg-gray-100 text-gray-700 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500"
              >
                Deselect All
              </button>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <select
                onChange={(e) => {
                  if (e.target.value) {
                    handleBulkMoveToProject(e.target.value);
                    e.target.value = '';
                  }
                }}
                className="text-xs px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                defaultValue=""
              >
                <option value="" disabled>Move to...</option>
                <option value="none">No Project</option>
                {projects.map((project) => (
                  <option key={project.id} value={project.id}>
                    {project.name}
                  </option>
                ))}
              </select>
              <button
                onClick={handleBulkComplete}
                className="text-xs px-3 py-1 rounded bg-green-600 text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                Mark Complete
              </button>
              <button
                onClick={handleBulkDelete}
                className="text-xs px-3 py-1 rounded bg-red-600 text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Task List or Empty State */}
      {displayedTasks.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <p className="text-lg mb-2">No tasks found</p>
          <p className="text-sm">
            {searchQuery.trim()
              ? 'No tasks match your search'
              : filterPriority !== 'all' || filterProject !== 'all'
              ? 'Try adjusting your filters'
              : 'Add your first task to get started!'}
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {displayedTasks.map((task) => (
            <div key={task.id} className="flex items-start gap-2">
              {selectionMode && (
                <input
                  type="checkbox"
                  checked={selectedTasks.has(task.id)}
                  onChange={() => toggleTaskSelection(task.id)}
                  className="mt-3 w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 cursor-pointer"
                  aria-label={`Select task: ${task.title}`}
                />
              )}
              <div className="flex-1 min-w-0">
                <TaskItem task={task} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
});

export default TaskList;