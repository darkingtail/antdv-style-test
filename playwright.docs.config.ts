import { defineConfig, devices } from '@playwright/test'

const port = Number(process.env.DOCS_PORT ?? 4186)
export default defineConfig({
  testDir: './docs-e2e',
  outputDir: './docs-test-results',
  workers: 2,
  timeout: 30_000,
  expect: { timeout: 10_000 },
  reporter: [['list'], ['html', { outputFolder: 'docs-playwright-report', open: 'never' }]],
  use: {
    channel: process.env.PLAYWRIGHT_CHANNEL,
    baseURL: `http://127.0.0.1:${port}`,
    screenshot: 'only-on-failure',
    trace: 'retain-on-failure',
  },
  projects: [
    { name: 'desktop', use: { ...devices['Desktop Chrome'], viewport: { width: 1280, height: 900 } } },
    { name: 'mobile', use: { ...devices['Pixel 7'] } },
  ],
  webServer: {
    command: `pnpm --dir ../antdv-style docs:preview --host 127.0.0.1 --port ${port} --strictPort`,
    url: `http://127.0.0.1:${port}/antdv-style/`,
    reuseExistingServer: !process.env.CI,
    timeout: 60_000,
  },
})
