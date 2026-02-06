import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },

  // Use relative paths so Electron can load from file://
  base: './',

  build: {
    // Output dir (loaded by Electron main process in prod)
    outDir: 'dist',
    emptyOutDir: true,
  },

  server: {
    // Fixed port so Electron dev:electron can find it
    port: 5173,
    strictPort: true,
  },
})
