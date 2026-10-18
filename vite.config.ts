import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: './', // Ensures assets are linked relatively for GitHub Pages compatibility
  server: {
    port: 3000,
    open: false,
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('lucide-react')) return 'vendor-lucide';
            if (id.includes('framer-motion')) return 'vendor-motion';
            if (id.includes('canvas-confetti')) return 'vendor-confetti';
            return 'vendor';
          }
          if (id.includes('seedData')) {
            return 'seed-dataset';
          }
        },
      },
    },
    chunkSizeWarningLimit: 800,
  },
});

