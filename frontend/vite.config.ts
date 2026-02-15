import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import * as path from "node:path";

export default defineConfig({
  // base: '/dilowa/', //für IP-Problem läuft dilowa unter 192.168.84.86/dilowa
  plugins: [react()],
  server: {
    // Proxy API requests to the backend to avoid CORS during development
    proxy: {
      '/dilowa/api': {
        target: process.env.VITE_BACKEND_PROXY_TARGET || 'http://192.168.84.86',
        changeOrigin: true,
        secure: false,
      },
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  css: {
    preprocessorOptions: {
      less: {
        javascriptEnabled: true,
      },
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          react: ['react', 'react-dom'],
          antd: ['antd'],
          router: ['react-router-dom'],
        },
      },
    },
  },
});