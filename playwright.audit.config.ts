import { defineConfig, devices } from '@playwright/test'

const appPort = Number(process.env.AUDIT_APP_PORT ?? 5197)
const docsPort = Number(process.env.AUDIT_DOCS_PORT ?? 4197)

export default defineConfig({
  testDir: './audit-e2e',
  timeout: 30_000,
  expect: { timeout: 3000 },
  workers: 2,
  outputDir: './audit-test-results',
  reporter: [
    ['list'],
    ['json', { outputFile: 'audit-generated/playwright-results.json' }],
    ['html', { outputFolder: 'audit-playwright-report', open: 'never' }],
  ],
  use: {
    channel: process.env.PLAYWRIGHT_CHANNEL,
    screenshot: 'only-on-failure',
    trace: 'retain-on-failure',
  },
  projects: [
    {
      name: 'runtime-desktop', testMatch: 'runtime.spec.ts',
      use: { ...devices['Desktop Chrome'], viewport: { width: 1280, height: 900 }, baseURL: `http://127.0.0.1:${appPort}` },
    },
    {
      name: 'runtime-mobile', testMatch: 'runtime.spec.ts',
      use: { ...devices['Pixel 7'], baseURL: `http://127.0.0.1:${appPort}` },
    },
    {
      name: 'docs-desktop', testMatch: 'docs.spec.ts',
      use: { ...devices['Desktop Chrome'], viewport: { width: 1280, height: 900 }, baseURL: `http://127.0.0.1:${docsPort}` },
    },
    {
      name: 'docs-mobile', testMatch: 'docs.spec.ts',
      use: { ...devices['Pixel 7'], baseURL: `http://127.0.0.1:${docsPort}` },
    },
  ],
  webServer: [
    {
      command: `pnpm dev --host 127.0.0.1 --port ${appPort} --strictPort`,
      url: `http://127.0.0.1:${appPort}`, reuseExistingServer: false, timeout: 60_000,
    },
    {
      command: `pnpm --dir ../antdv-style docs:preview --host 127.0.0.1 --port ${docsPort} --strictPort`,
      url: `http://127.0.0.1:${docsPort}/antdv-style/`, reuseExistingServer: false, timeout: 60_000,
    },
  ],
})
