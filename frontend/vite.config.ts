import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const { API_PROXY_TARGET } = loadEnv(mode, '.', 'API_PROXY_TARGET');
  return {
    plugins: [react()],
    server: API_PROXY_TARGET ? {
      proxy: { '/api': { target: API_PROXY_TARGET, changeOrigin: true } },
    } : undefined,
  };
});
