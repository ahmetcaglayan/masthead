import { resolve } from 'node:path'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  resolve: {
    alias: {
      '@shared': resolve(__dirname, 'src/shared'),
      '@core': resolve(__dirname, 'src/core'),
      // The renderer's own alias, so its pure helpers can be tested too.
      '@': resolve(__dirname, 'src/renderer/src')
    }
  },
  test: {
    environment: 'node',
    include: ['tests/**/*.test.ts']
  }
})
