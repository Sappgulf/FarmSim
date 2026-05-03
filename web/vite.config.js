import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

const analyze = process.env.ANALYZE === '1' || process.env.ANALYZE === 'true'

// https://vitejs.dev/config/
export default defineConfig(async () => {
  const plugins = [react(), tailwindcss()]

  if (analyze) {
    const { visualizer } = await import('rollup-plugin-visualizer')
    plugins.push(
      visualizer({
        filename: './stats.html',
        open: false,
        gzipSize: true,
        brotliSize: true,
      }),
    )
  }

  return {
    base: './',
    plugins,
    server: {
      host: true,
      port: 5173,
      open: true,
      fs: {
        allow: [path.resolve(import.meta.dirname, '..')],
      },
    },
    resolve: {
      alias: {
        '@': path.resolve(import.meta.dirname, './src'),
        '@shared': path.resolve(import.meta.dirname, '../shared'),
        '@content': path.resolve(import.meta.dirname, '../shared/content'),
      },
    },
    build: {
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (!id.includes('node_modules')) return undefined
            if (id.includes('react')) return 'vendor-react'
            if (id.includes('lucide-react')) return 'vendor-lucide'
            return 'vendor'
          },
        },
      },
    },
  }
})
