import { defineConfig, splitVendorChunkPlugin } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig(async () => {
  const { visualizer } = await import('rollup-plugin-visualizer')
  return {
    base: './',
    plugins: [
      react(),
      splitVendorChunkPlugin(),
      visualizer({
        filename: './stats.html',
        open: false,
        gzipSize: true,
        brotliSize: true,
      }),
    ],
    server: {
      host: true,
      port: 5173,
      open: true,
      fs: {
        allow: [path.resolve(__dirname, "..")],
      },
    },
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
        "@shared": path.resolve(__dirname, "../shared"),
        "@content": path.resolve(__dirname, "../shared/content"),
      },
    },
    build: {
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (!id.includes('node_modules')) return undefined;
            if (id.includes('react')) return 'vendor-react';
            if (id.includes('lucide-react')) return 'vendor-lucide';
            return 'vendor';
          },
        },
      },
    },
  }
})
