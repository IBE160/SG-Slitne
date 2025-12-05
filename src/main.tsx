import React from 'react';
import ReactDOM from 'react-dom/client';
import { SimpleTest } from './SimpleTest';
import { ErrorBoundary } from './components/ErrorBoundary';
import './index.css';

// Add global error logging
window.addEventListener('error', (event) => {
  console.error('Global error:', event.error);
});

window.addEventListener('unhandledrejection', (event) => {
  console.error('Unhandled promise rejection:', event.reason);
});

const rootElement = document.getElementById('root');
if (!rootElement) {
  document.body.innerHTML = '<div style="color: red; padding: 20px;">Error: Root element not found</div>';
} else {
  ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
      <ErrorBoundary>
        <SimpleTest />
      </ErrorBoundary>
    </React.StrictMode>
  );
}
