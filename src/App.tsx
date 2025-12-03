import React from 'react';

function App() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Smart To-Do List
        </h1>
        <p className="text-lg text-gray-600 mb-8">
          Sprint 1 - Development Environment Ready
        </p>
        <div className="space-y-2 text-sm text-gray-500">
          <p>✅ React + TypeScript</p>
          <p>✅ Vite Dev Server</p>
          <p>✅ IndexedDB Service</p>
          <p>✅ Zustand State Management</p>
          <p>✅ AI Engine (Heuristic)</p>
          <p>✅ All Tests Passing (97/97)</p>
        </div>
      </div>
    </div>
  );
}

export default App;
