/// <reference types="vitest" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// base './' lets the built site run from any sub-path (GitHub Pages project sites, Vercel).
export default defineConfig({
  base: './',
  plugins: [react()],
  test: { globals: true, environment: 'node' },
  build: {
    chunkSizeWarningLimit: 1500,
    // แยกไลบรารี 3 มิติออกเป็นไฟล์ของตัวเอง เบราว์เซอร์เก็บแคชได้นานแม้แก้ข้อมูลโรงเรือน
    rollupOptions: {
      output: {
        manualChunks: {
          three: ['three'],
          r3f: ['@react-three/fiber', '@react-three/drei'],
          react: ['react', 'react-dom', 'gsap'],
        },
      },
    },
  },
});
