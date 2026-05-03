/// <reference types="vitest/config" />
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.js'],
    include: [
      'src/test/**/*.{test,spec}.{js,mjs,jsx,ts,tsx}',
      'test/**/*.{test,spec}.{js,mjs,jsx,ts,tsx}',
    ],
    exclude: ['.subagents/**'],
    coverage: {
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'src/test/',
        'dist/',
        'coverage/',
        '**/*.d.ts',
        '**/*.config.js',
        'src/main.jsx',
      ],
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(import.meta.dirname, './src'),
      '@shared': path.resolve(import.meta.dirname, '../shared'),
      '@content': path.resolve(import.meta.dirname, '../shared/content'),
    },
  },
})
