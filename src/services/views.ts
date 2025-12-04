/**
 * Views Service
 * 
 * Manages saved filter + sort combinations as named "views".
 * Allows users to quickly switch between common workflows.
 * All views stored in localStorage.
 */

export interface TaskView {
  id: string;
  name: string;
  sortBy: 'priority' | 'dueDate' | 'created';
  filterPriority: 'all' | '1' | '2' | '3';
  filterProject?: string; // 'all' or project ID
  searchQuery?: string;
  isPreset?: boolean;
  createdAt: string;
}

const STORAGE_KEY = 'task_views';
const MAX_VIEWS = 50;

/**
 * Get all saved views
 */
export function getViews(): TaskView[] {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.warn('Failed to load views:', error);
    return [];
  }
}

/**
 * Get a specific view by ID
 */
export function getViewById(id: string): TaskView | undefined {
  return getViews().find(v => v.id === id);
}

/**
 * Save a new view
 */
export function saveView(name: string, sortBy: 'priority' | 'dueDate' | 'created', filterPriority: 'all' | '1' | '2' | '3', filterProject?: string, searchQuery?: string): TaskView {
  const views = getViews();
  
  // Check for duplicate name
  if (views.some(v => v.name.toLowerCase() === name.toLowerCase() && !v.isPreset)) {
    throw new Error(`View "${name}" already exists`);
  }

  if (views.length >= MAX_VIEWS) {
    throw new Error('Maximum number of views reached');
  }

  const newView: TaskView = {
    id: crypto.randomUUID(),
    name,
    sortBy,
    filterPriority,
    filterProject: filterProject || 'all',
    searchQuery: searchQuery || undefined,
    isPreset: false,
    createdAt: new Date().toISOString(),
  };

  views.push(newView);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(views));
  
  return newView;
}

/**
 * Update a view (name only, or full update)
 */
export function updateView(id: string, updates: Partial<Omit<TaskView, 'id' | 'createdAt' | 'isPreset'>>): TaskView {
  const views = getViews();
  const view = views.find(v => v.id === id);
  
  if (!view) {
    throw new Error('View not found');
  }

  if (view.isPreset) {
    throw new Error('Cannot modify preset views');
  }

  const updated = { ...view, ...updates };
  
  // Check for duplicate name if name is being changed
  if (updates.name && updates.name !== view.name) {
    if (views.some(v => v.name.toLowerCase() === updates.name!.toLowerCase() && v.id !== id)) {
      throw new Error(`View "${updates.name}" already exists`);
    }
  }

  const index = views.findIndex(v => v.id === id);
  views[index] = updated;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(views));
  
  return updated;
}

/**
 * Delete a view
 */
export function deleteView(id: string): void {
  const views = getViews();
  const view = views.find(v => v.id === id);
  
  if (!view) {
    throw new Error('View not found');
  }

  if (view.isPreset) {
    throw new Error('Cannot delete preset views');
  }

  const filtered = views.filter(v => v.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
}

/**
 * Initialize with preset views if none exist
 */
export function initializePresetViews(): void {
  const existing = getViews();
  if (existing.length > 0) return;

  const presets: TaskView[] = [
    {
      id: 'preset-today-high',
      name: "Today's High Priority",
      sortBy: 'priority',
      filterPriority: '3',
      filterProject: 'all',
      isPreset: true,
      createdAt: new Date().toISOString(),
    },
    {
      id: 'preset-this-week',
      name: 'This Week',
      sortBy: 'dueDate',
      filterPriority: 'all',
      filterProject: 'all',
      isPreset: true,
      createdAt: new Date().toISOString(),
    },
    {
      id: 'preset-overdue',
      name: 'Overdue Only',
      sortBy: 'dueDate',
      filterPriority: 'all',
      filterProject: 'all',
      isPreset: true,
      createdAt: new Date().toISOString(),
    },
    {
      id: 'preset-all-active',
      name: 'All Active',
      sortBy: 'priority',
      filterPriority: 'all',
      filterProject: 'all',
      isPreset: true,
      createdAt: new Date().toISOString(),
    },
  ];

  localStorage.setItem(STORAGE_KEY, JSON.stringify(presets));
}

/**
 * Clear all custom views (keep presets)
 */
export function clearCustomViews(): void {
  const views = getViews();
  const presets = views.filter(v => v.isPreset);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(presets));
}
