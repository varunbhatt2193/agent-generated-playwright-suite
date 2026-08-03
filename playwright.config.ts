import { defineConfig } from '@playwright/test';

// testDir, workers, parallelism and reporter read from the environment so the same config can be
// pointed at a different directory or run mode without being edited.
// No baseURL is configured; tests navigate with absolute URLs.
export default defineConfig({
  testDir: process.env.PW_TEST_DIR ?? 'tests',
  fullyParallel: process.env.PW_FULLY_PARALLEL === '1',
  retries: 0,
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
