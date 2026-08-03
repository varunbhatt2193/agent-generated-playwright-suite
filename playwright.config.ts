import { defineConfig } from '@playwright/test';

// The env switches exist so the measurement harness can point the same config at any suite
// (raw arm output, repaired output, smoke) without editing anything the experiment depends on.
//
// No baseURL is set on purpose: the app lives at a subpath and https://demo.playwright.dev/ is a
// 404, so a relative page.goto('/') would fail for harness reasons rather than test-quality ones.
// Tests use the absolute URL instead.
export default defineConfig({
  testDir: process.env.PW_TEST_DIR ?? 'tests',
  fullyParallel: process.env.PW_FULLY_PARALLEL === '1',
  retries: 0, // never raise: retries hide the flake this project measures
  workers: process.env.PW_WORKERS ? Number(process.env.PW_WORKERS) : undefined,
  reporter: process.env.PW_BLOB
    ? [['blob']]
    : [
        ['list'],
        ['json', { outputFile: process.env.PW_JSON_OUT ?? 'test-results/last-run.json' }],
        ['html', { open: 'never' }],
      ],
  use: {
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },
  projects: [{ name: 'chromium', use: { browserName: 'chromium' } }],
});
