import { useEffect, useState } from 'react';
import { useTaskStore } from './stores';
import TaskList from './components/TaskList';
import Settings from './components/Settings';
import AddTaskForm from './components/AddTaskForm';
import ProjectList from './components/ProjectList';
import { ToastContainer, Toast } from './components/ToastNotification';
import { isOffline, getPendingSyncCount, flushPendingSync } from './services/offline';
import { addSyncHistoryEntry } from './services/sync-history';

function App() {
  const tasks = useTaskStore((state) => state.tasks);
  const loading = useTaskStore((state) => state.loading);
  const initialized = useTaskStore((state) => state.initialized);
  const initializeTasks = useTaskStore((state) => state.initializeTasks);
  const activeCount = useTaskStore((state) => state.getActiveTaskCount());
  const overdueCount = useTaskStore((state) => state.getOverdueTaskCount());

  const [offline, setOffline] = useState(isOffline());
  const [pendingSync, setPendingSync] = useState<number>(0);
  const [toasts, setToasts] = useState<Toast[]>([]);

  useEffect(() => {
    const updateStatus = () => {
      setOffline(isOffline());
      setPendingSync(getPendingSyncCount());
    };
    updateStatus();
    window.addEventListener('online', updateStatus);
    window.addEventListener('offline', updateStatus);
    const interval = setInterval(updateStatus, 5000);
    return () => {
      window.removeEventListener('online', updateStatus);
      window.removeEventListener('offline', updateStatus);
      clearInterval(interval);
    };
  }, []);

  // On becoming online, attempt to flush sync queue if Cloud Mode is enabled
  const cloudModeEnabled = useTaskStore((s) => s.cloudModeEnabled);
  useEffect(() => {
    const onOnline = async () => {
      if (cloudModeEnabled && getPendingSyncCount() > 0) {
        // Show syncing toast
        const syncingToast: Toast = {
          id: `sync-${Date.now()}`,
          message: 'Syncing pending changes...',
          type: 'info',
          duration: 0, // Don't auto-dismiss
        };
        setToasts(prev => [...prev, syncingToast]);
        
        const startTime = Date.now();
        const result = await flushPendingSync({ cloudEnabled: true });
        const duration = Date.now() - startTime;
        
        // Remove syncing toast
        setToasts(prev => prev.filter(t => t.id !== syncingToast.id));
        
        // Log to history
        const status = result.failed === 0 ? 'success' : 
                       result.processed > 0 ? 'partial' : 'failed';
        addSyncHistoryEntry({
          operation: 'auto_sync',
          status,
          itemsProcessed: result.processed,
          itemsFailed: result.failed,
          itemsRetrying: result.retrying,
          permanentFailures: result.permanent_failures,
          duration,
        });
        
        // Show result toast
        if (result.processed > 0) {
          const successToast: Toast = {
            id: `sync-success-${Date.now()}`,
            message: `Synced ${result.processed} change(s) successfully!`,
            type: 'success',
            duration: 3000,
          };
          setToasts(prev => [...prev, successToast]);
        }
        
        if (result.retrying > 0) {
          const retryToast: Toast = {
            id: `sync-retry-${Date.now()}`,
            message: `${result.retrying} item(s) will retry later`,
            type: 'warning',
            duration: 5000,
          };
          setToasts(prev => [...prev, retryToast]);
        }
        
        if (result.permanent_failures > 0) {
          const failedToast: Toast = {
            id: `sync-failed-${Date.now()}`,
            message: `${result.permanent_failures} item(s) failed permanently. Check Settings > Sync History.`,
            type: 'error',
            duration: 0, // Keep until dismissed
          };
          setToasts(prev => [...prev, failedToast]);
        }
        
        setPendingSync(getPendingSyncCount());
      }
    };
    window.addEventListener('online', onOnline);
    return () => window.removeEventListener('online', onOnline);
  }, [cloudModeEnabled]);

  useEffect(() => {
    initializeTasks();
    
    // Timeout fallback - if initialization takes too long, mark as initialized anyway
    const timeoutId = setTimeout(() => {
      if (!useTaskStore.getState().initialized) {
        console.warn('Database initialization timeout - using fallback');
        useTaskStore.getState().initializeTasks().catch(err => {
          console.error('Failed to initialize database:', err);
        });
      }
    }, 3000); // 3 second timeout
    
    return () => clearTimeout(timeoutId);
  }, [initializeTasks]);

  useEffect(() => {
    // Initialize preset views
    const loadSavedViews = useTaskStore.getState().loadSavedViews;
    loadSavedViews();
  }, []);

  if (!initialized && loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading tasks...</p>
          <p className="text-xs text-gray-500 mt-2">This may take a moment on first load</p>
        </div>
      </div>
    );
  }

  // If not initialized after loading, show empty state
  if (!initialized) {
    return (
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-10" role="banner">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 py-3 sm:py-4">
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <h1 className="text-xl sm:text-2xl font-bold text-gray-900 truncate">Smart To-Do List</h1>
                <p className="text-xs sm:text-sm text-gray-600 mt-0.5 sm:mt-1">Sprint 1 - MVP</p>
              </div>
            </div>
          </div>
        </header>
        <main className="max-w-4xl mx-auto px-4 sm:px-6 py-4 sm:py-8">
          <div className="text-center py-12">
            <p className="text-gray-600 mb-2">Ready to get started!</p>
            <p className="text-sm text-gray-500">Your tasks will be stored locally on your device</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-10" role="banner">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-3 sm:py-4">
          <div className="flex items-center justify-between">
            <div className="flex-1 min-w-0">
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900 truncate">Smart To-Do List</h1>
              <p className="text-xs sm:text-sm text-gray-600 mt-0.5 sm:mt-1">Sprint 1 - MVP</p>
            </div>
            <div className="flex items-center gap-3 sm:gap-4 text-xs sm:text-sm flex-shrink-0 ml-4">
              <div
                className={
                  offline
                    ? 'px-2 py-1 rounded-md bg-orange-100 text-orange-800 border border-orange-200'
                    : 'px-2 py-1 rounded-md bg-green-100 text-green-800 border border-green-200'
                }
                aria-label={offline ? `Offline mode, ${pendingSync} pending sync items` : 'Online'}
                title={offline ? 'Offline mode' : 'Online'}
                role="status"
              >
                {offline ? 'Offline' : 'Online'}{offline && pendingSync > 0 ? ` • ${pendingSync} pending` : ''}
              </div>
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
                className="px-2 py-1 text-xs sm:text-sm rounded-md border bg-gray-100 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                onClick={() => {
                  // Toggle hash to open Settings panel
                  if (window.location.hash === '#settings') {
                    window.location.hash = '';
                  } else {
                    window.location.hash = '#settings';
                  }
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Escape' && window.location.hash === '#settings') {
                    window.location.hash = '';
                  }
                }}
                aria-label="Open settings and privacy controls"
              >
                Settings
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-4 sm:py-8 pb-20 sm:pb-24" role="main" aria-label="Task list and controls">
        <div className="space-y-4 sm:space-y-6">
          <Settings />
          <ProjectList />
          <AddTaskForm />
          <TaskList />
        </div>
      </main>

      {/* Footer */}
      <footer className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 py-2 sm:py-3" role="contentinfo">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="flex justify-center gap-2 sm:gap-4 text-xs text-gray-500 flex-wrap">
            <span className="whitespace-nowrap">✅ IndexedDB</span>
            <span className="whitespace-nowrap">✅ Zustand</span>
            <span className="whitespace-nowrap">✅ Tests</span>
            <span className="whitespace-nowrap">✅ Accessibility</span>
          </div>
        </div>
      </footer>

      {/* Toast Notifications */}
      <ToastContainer 
        toasts={toasts} 
        onDismiss={(id) => setToasts(prev => prev.filter(t => t.id !== id))}
      />
    </div>
  );
}

export default App;
