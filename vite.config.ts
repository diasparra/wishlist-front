import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig(({ command }) => ({
  base: command === 'build' ? './' : '/',
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: './src/setupTests.ts',
    // Vitest owns the frontend suite only. The `api/` package has its own
    // `node:test` suite (`cd api && npm test`); Cypress specs run separately.
    include: ['src/**/*.test.{ts,tsx}'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'lcov'],
      exclude: [
        'src/main.tsx',
        'src/setupTests.ts',
        'src/vite-env.d.ts',
        'src/**/*.test.{ts,tsx}',
        'src/**/*.css',
        'src/assets/**',
        'cypress/**',
        'scripts/**',
        '*.config.{js,ts}',
      ],
      thresholds: {
        lines: 80,
        statements: 80,
        functions: 80,
        branches: 75,
      },
    },
  },
}))
