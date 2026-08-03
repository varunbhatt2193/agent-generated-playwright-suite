import { expect, test } from '@playwright/test';
import { openApp, TodoApp } from './todo-app';

test.describe('application shell', () => {
  let app: TodoApp;

  test.beforeEach(async ({ page }) => {
    app = await openApp(page);
  });

  test('renders the document title and heading', async ({ page }) => {
    await expect(page).toHaveTitle('React • TodoMVC');
    await expect(page.getByRole('heading', { name: 'todos' })).toBeVisible();
  });

  test('normalises the entry URL to the "all" route', async ({ page }) => {
    await expect(page).toHaveURL(/#\/$/);
  });

  test('focuses the new-todo input on load', async () => {
    await expect(app.newTodo).toBeFocused();
    await expect(app.newTodo).toHaveValue('');
  });

  test('hides the list and footer while there are no todos', async () => {
    await expect(app.items).toHaveCount(0);
    await expect(app.toggleAll).toBeHidden();
    await expect(app.todoCount).toBeHidden();
    await expect(app.filterAll).toBeHidden();
    await expect(app.clearCompleted).toBeHidden();
  });

  test('shows the list and footer as soon as a todo exists, and hides them again when it is gone', async () => {
    await app.add('walk the dog');
    await expect(app.toggleAll).toBeVisible();
    await expect(app.todoCount).toBeVisible();
    await expect(app.filterAll).toBeVisible();

    await app.remove('walk the dog');
    await expect(app.toggleAll).toBeHidden();
    await expect(app.todoCount).toBeHidden();
    await expect(app.filterAll).toBeHidden();
  });

  test('shows the informational footer links', async ({ page }) => {
    await expect(page.getByText('Double-click to edit a todo')).toBeVisible();
    await expect(page.getByRole('link', { name: 'real TodoMVC app.' })).toHaveAttribute(
      'href',
      'https://todomvc.com/',
    );
    await expect(page.getByRole('link', { name: 'Remo H. Jansen' })).toHaveAttribute(
      'href',
      'http://github.com/remojansen/',
    );
  });
});
