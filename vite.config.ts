import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  // Set third argument to '' to load all env vars, not just VITE_ prefixed ones.
  const env = loadEnv(mode, process.cwd(), '');
  
  const apiKey = env.API_KEY || process.env.API_KEY;

  if (mode === 'development') {
    if (apiKey) {
      console.log(`[Vite] Injected API_KEY: ${apiKey.substring(0, 5)}...`);
    } else {
      console.warn("[Vite] WARNING: API_KEY not found in environment!");
    }
  }

  return {
    plugins: [react()],
    define: {
      // Correctly stringify the value for replacement
      'process.env.API_KEY': JSON.stringify(apiKey),
    },
    server: {
      proxy: {
        '/api': {
          target: 'http://localhost:3001',
          changeOrigin: true
        }
      }
    },
    build: {
      outDir: 'dist',
      sourcemap: false
    }
  };
});