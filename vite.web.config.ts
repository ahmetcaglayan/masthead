import { resolve } from 'node:path'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { mastheadWebHost } from './src/web/plugin'

/**
 * Web mode (`npm run dev:web`): the Electron renderer served to a normal browser on localhost, with
 * the core backend running inside the dev server (see src/web/).
 */
export default defineConfig({
  root: resolve(__dirname, 'src/renderer'),
  publicDir: resolve(__dirname, 'src/renderer/public'),
  plugins: [react(), tailwindcss(), mastheadWebHost()],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src/renderer/src'),
      '@shared': resolve(__dirname, 'src/shared'),
      '@core': resolve(__dirname, 'src/core')
    }
  },
  server: { port: 5173, strictPort: false, host: 'localhost' },
  build: {
    outDir: resolve(__dirname, 'out/web'),
    emptyOutDir: true
  }
})
