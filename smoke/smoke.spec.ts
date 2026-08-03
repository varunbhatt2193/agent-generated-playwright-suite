import { test, expect } from '@playwright/test';

// Deliberately trivial. This file is present in the generation worktrees, so anything it
// demonstrates becomes guidance the agent can copy — and guidance is the experimental variable.
test('app loads', async ({ page }) => {
  await page.goto('https://demo.playwright.dev/todomvc/');
  await expect(page).toHaveTitle(/TodoMVC/);
});
