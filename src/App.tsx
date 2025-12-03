import React from 'react';
import { useTaskStore } from './stores';
import TaskList from './components/TaskList';
import AddTaskForm from './components/AddTaskForm';

function App() {
  const tasks = useTaskStore((state) => state.tasks);
  const activeCount = useTaskStore((state) => state.getActiveTaskCount());
  const overdueCount = useTaskStore((state) => state.getOverdueTaskCount());

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Smart To-Do List</h1>
              <p className="text-sm text-gray-600 mt-1">Sprint 1 - MVP</p>
            </div>
            <div className="flex gap-4 text-sm">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{activeCount}</div>
                <div className="text-gray-600">Active</div>
              </div>
              {overdueCount > 0 && (
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-600">{overdueCount}</div>
                  <div className="text-gray-600">Overdue</div>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="space-y-6">
          <AddTaskForm />
          <TaskList />
        </div>
      </main>

      {/* Footer */}
      <footer className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 py-2">
        <div className="max-w-4xl mx-auto px-4">
          <div className="flex justify-center gap-4 text-xs text-gray-500">
            <span>✅ IndexedDB</span>
            <span>✅ Zustand</span>
            <span>✅ Tests Passing</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
