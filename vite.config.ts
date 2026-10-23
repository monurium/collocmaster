import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');

  // Safely resolve any casing or naming for the DeepSeek API key on Vercel or local
  const resolvedKey =
    process.env.deep_Seek_api_key ||
    process.env.DEEP_SEEK_API_KEY ||
    process.env.DEEPSEEK_API_KEY ||
    process.env.VITE_DEEPSEEK_API_KEY ||
    env.deep_Seek_api_key ||
    env.DEEP_SEEK_API_KEY ||
    env.DEEPSEEK_API_KEY ||
    env.VITE_DEEPSEEK_API_KEY ||
    '';

  return {
    plugins: [react()],
    base: './', // Ensures assets are linked relatively for GitHub Pages and Vercel compatibility
    define: {
      '__DEEPSEEK_API_KEY__': JSON.stringify(resolvedKey),
    },
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
      chunkSizeWarningLimit: 1400,
    },
  };
});
