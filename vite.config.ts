import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    strictPort: false,
    open: false,
    middlewareMode: false,
  },
  build: {
    target: 'ES2020',
    minify: 'terser',
    sourcemap: false,
    reportCompressedSize: true,
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom'],
          'zustand-vendor': ['zustand'],
          'utils': ['uuid'],
        },
      },
    },
  },
  define: {
    __DEV__: JSON.stringify(process.env.NODE_ENV === 'development'),
  },
});
