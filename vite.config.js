import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

const openBrowser = process.env.NO_OPEN !== '1' && process.env.CI !== 'true';

// https://vitejs.dev/config/
export default defineConfig({
  base: './',
  plugins: [react()],
  server: {
    host: true,
    port: 5173,
    open: openBrowser
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  }
})
