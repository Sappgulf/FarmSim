import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { fileURLToPath, URL } from 'node:url'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@shared': fileURLToPath(new URL('../shared', import.meta.url)),
      '@content': fileURLToPath(new URL('../shared/content', import.meta.url)),
    },
  },
  server: {
    host: '127.0.0.1',
    port: 4173,
    hmr: false,
  },
})
