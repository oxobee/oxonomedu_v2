import { defineConfig } from '@playwright/test'

export default defineConfig({
  testDir: './audit',
  timeout: 60_000,
  expect: { timeout: 10_000 },
  fullyParallel: false,
  workers: 1,
  reporter: [
    ['list'],
    ['json', { outputFile: 'audit-results.json' }],
  ],
  use: {
    baseURL: process.env.BASE_URL || 'http://localhost:3000',
    trace: 'off',
    screenshot: 'off',
    video: 'off',
    actionTimeout: 10_000,
    navigationTimeout: 20_000,
  },
  projects: [
    {
      name: 'audit-chromium',
      use: {
        browserName: 'chromium',
        headless: true,
      },
    },
  ],
})
