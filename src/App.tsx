import React, { useEffect } from 'react';
import { useTaskStore } from './stores';
import TaskList from './components/TaskList';
import Settings from './components/Settings';
import AddTaskForm from './components/AddTaskForm';

function App() {
  const tasks = useTaskStore((state) => state.tasks);
  const loading = useTaskStore((state) => state.loading);
  const initialized = useTaskStore((state) => state.initialized);
  const initializeTasks = useTaskStore((state) => state.initializeTasks);
  const activeCount = useTaskStore((state) => state.getActiveTaskCount());
  const overdueCount = useTaskStore((state) => state.getOverdueTaskCount());

  useEffect(() => {
    initializeTasks();
  }, [initializeTasks]);

  if (!initialized && loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading tasks...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-3 sm:py-4">
          <div className="flex items-center justify-between">
            <div className="flex-1 min-w-0">
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900 truncate">Smart To-Do List</h1>
              <p className="text-xs sm:text-sm text-gray-600 mt-0.5 sm:mt-1">Sprint 1 - MVP</p>
            </div>
            <div className="flex items-center gap-3 sm:gap-4 text-xs sm:text-sm flex-shrink-0 ml-4">
              <div className="text-center">
                <div className="text-xl sm:text-2xl font-bold text-blue-600">{activeCount}</div>
                <div className="text-gray-600 text-xs">Active</div>
              </div>
              {overdueCount > 0 && (
                <div className="text-center">
                  <div className="text-xl sm:text-2xl font-bold text-red-600">{overdueCount}</div>
                  <div className="text-gray-600 text-xs">Overdue</div>
                </div>
              )}
              <button
                type="button"
                className="px-2 py-1 text-xs sm:text-sm rounded-md border bg-gray-100 hover:bg-gray-200"
                onClick={() => {
                  // Toggle hash to open Settings panel
                  if (window.location.hash === '#settings') {
                    window.location.hash = '';
                  } else {
                    window.location.hash = '#settings';
                  }
                }}
                aria-label="Open settings"
              >
                Settings
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-4 sm:py-8 pb-20 sm:pb-24">
        <div className="space-y-4 sm:space-y-6">
          <Settings />
          <AddTaskForm />
          <TaskList />
        </div>
      </main>

      {/* Footer */}
      <footer className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 py-2 sm:py-3">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="flex justify-center gap-2 sm:gap-4 text-xs text-gray-500 flex-wrap">
            <span className="whitespace-nowrap">✅ IndexedDB</span>
            <span className="whitespace-nowrap">✅ Zustand</span>
            <span className="whitespace-nowrap">✅ Tests</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
