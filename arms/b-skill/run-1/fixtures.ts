import { test as base, expect } from '@playwright/test';
import { TodoPage } from './pages/todo-page';

/**
 * Every test gets its own browser context, so localStorage starts empty and tests
 * cannot see each other's todos.
 */
export const test = base.extend<{ todoPage: TodoPage }>({
  todoPage: async ({ page }, use) => {
    const todoPage = new TodoPage(page);
    await todoPage.goto();
    await use(todoPage);
  },
});

export { expect };
