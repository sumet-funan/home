/// <reference types="vitest" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// base './' lets the built site run from any sub-path (GitHub Pages project sites, Vercel).
export default defineConfig({
  base: './',
  plugins: [react()],
  test: { globals: true, environment: 'node' },
  build: { chunkSizeWarningLimit: 1500 },
});
