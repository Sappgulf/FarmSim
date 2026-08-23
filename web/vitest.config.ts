import { defineConfig } from 'vitest/config'
import { fileURLToPath, URL } from 'node:url'

export default defineConfig({
  resolve: {
    alias: {
      '@shared': fileURLToPath(new URL('../shared', import.meta.url)),
      '@content': fileURLToPath(new URL('../shared/content', import.meta.url)),
    },
  },
  server: {
    fs: { allow: [fileURLToPath(new URL('..', import.meta.url))] },
  },
  test: {
    environment: 'jsdom',
    globals: true,
    include: ['src/**/*.test.ts', 'src/test/**/*.test.js', 'src/test/**/*.test.jsx', 'test/**/*.test.mjs'],
    setupFiles: ['src/test/setup.js'],
  },
})
