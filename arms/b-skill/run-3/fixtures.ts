import { test as base } from '@playwright/test';
import { TodoPage } from './pages/todo-page';

/**
 * Every test gets its own browser context, so the app's localStorage starts empty and tests stay
 * independent of each other and of run order.
 */
export const test = base.extend<{ todoPage: TodoPage }>({
  todoPage: async ({ page }, use) => {
    const todoPage = new TodoPage(page);
    await todoPage.goto();
    await use(todoPage);
  },
});

export { expect } from '@playwright/test';
