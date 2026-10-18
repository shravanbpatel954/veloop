import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// In development the API is proxied to the Express backend, so the browser
// only ever talks to one origin (no CORS headaches while building).
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': { target: 'http://localhost:5000', changeOrigin: true },
    },
  },
});
