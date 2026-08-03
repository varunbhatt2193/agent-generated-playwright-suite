import { test as base, expect } from '@playwright/test';
import { TodoPage } from './pages/todo-page';

/**
 * Every test gets a fresh browser context, so localStorage always starts empty and the tests are
 * order independent without any explicit cleanup.
 */
export const test = base.extend<{ todoPage: TodoPage }>({
  todoPage: async ({ page }, use) => {
    const todoPage = new TodoPage(page);
    await todoPage.goto();
    await use(todoPage);
  },
});

export { expect };
