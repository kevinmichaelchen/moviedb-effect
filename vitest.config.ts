import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    include: ['packages/*/tests/**/*.test.ts'],
    globals: true,
    testTimeout: 30000,
    setupFiles: ['./vitest.setup.ts'],
  },
})
