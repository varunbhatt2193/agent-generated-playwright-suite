import { test, expect } from './fixtures';
import { APP_URL } from './pages/todo-page';

test.describe('filtering todos', () => {
  test.beforeEach(async ({ todoPage }) => {
    await todoPage.addTodos('buy milk', 'walk the dog', 'write tests');
    await todoPage.toggleTodo('walk the dog');
  });

  test('shows every todo under All', async ({ todoPage }) => {
    await todoPage.selectFilter('All');

    await todoPage.expectVisibleTodos(['buy milk', 'walk the dog', 'write tests']);
    await todoPage.expectSelectedFilter('All');
    await expect(todoPage.page).toHaveURL(`${APP_URL}#/`);
  });

  test('shows only unfinished todos under Active', async ({ todoPage }) => {
    await todoPage.selectFilter('Active');

    await todoPage.expectVisibleTodos(['buy milk', 'write tests']);
    await todoPage.expectSelectedFilter('Active');
    await expect(todoPage.page).toHaveURL(`${APP_URL}#/active`);
  });

  test('shows only finished todos under Completed', async ({ todoPage }) => {
    await todoPage.selectFilter('Completed');

    await todoPage.expectVisibleTodos(['walk the dog']);
    await todoPage.expectSelectedFilter('Completed');
    await expect(todoPage.page).toHaveURL(`${APP_URL}#/completed`);
  });

  test('keeps the counter on total active todos under every filter', async ({ todoPage }) => {
    await todoPage.selectFilter('Active');
    await todoPage.expectActiveCount(2);

    await todoPage.selectFilter('Completed');
    await todoPage.expectActiveCount(2);

    await todoPage.selectFilter('All');
    await todoPage.expectActiveCount(2);
  });

  test('shows an empty list when a filter matches nothing', async ({ todoPage }) => {
    await todoPage.selectFilter('Completed');
    await todoPage.toggleTodo('walk the dog');

    await expect(todoPage.items).toHaveCount(0);
    // The list is empty but todos still exist, so the filters stay on screen.
    await todoPage.expectListChromeVisible(true);
    await todoPage.expectActiveCount(3);
  });

  test('drops a todo out of the Active view when it is completed there', async ({ todoPage }) => {
    await todoPage.selectFilter('Active');
    await todoPage.expectVisibleTodos(['buy milk', 'write tests']);

    await todoPage.toggleTodo('buy milk');

    await todoPage.expectVisibleTodos(['write tests']);
    await todoPage.expectActiveCount(1);
  });

  test('drops a todo out of the Completed view when it is reactivated there', async ({
    todoPage,
  }) => {
    await todoPage.selectFilter('Completed');

    await todoPage.toggleTodo('walk the dog');

    await expect(todoPage.items).toHaveCount(0);
    await todoPage.selectFilter('All');
    await todoPage.expectVisibleTodos(['buy milk', 'walk the dog', 'write tests']);
  });

  test('applies mark-all to every todo from the Active view', async ({ todoPage }) => {
    await todoPage.selectFilter('Active');

    await todoPage.toggleAll();

    await expect(todoPage.items).toHaveCount(0);
    await todoPage.expectActiveCount(0);
    await todoPage.selectFilter('Completed');
    await todoPage.expectVisibleTodos(['buy milk', 'walk the dog', 'write tests']);
  });

  test('clears completed todos from the Active view', async ({ todoPage }) => {
    await todoPage.selectFilter('Active');
    await expect(todoPage.clearCompletedButton).toBeVisible();

    await todoPage.clearCompleted();

    await todoPage.expectVisibleTodos(['buy milk', 'write tests']);
    await todoPage.selectFilter('All');
    await todoPage.expectVisibleTodos(['buy milk', 'write tests']);
  });

  test('edits a todo from a filtered view', async ({ todoPage }) => {
    await todoPage.selectFilter('Active');

    await todoPage.editTodo('write tests', 'write more tests');

    await todoPage.expectVisibleTodos(['buy milk', 'write more tests']);
    await todoPage.selectFilter('All');
    await todoPage.expectVisibleTodos(['buy milk', 'walk the dog', 'write more tests']);
  });

  test('deletes a todo from a filtered view', async ({ todoPage }) => {
    await todoPage.selectFilter('Active');

    await todoPage.deleteTodo('buy milk');

    await todoPage.expectVisibleTodos(['write tests']);
    await todoPage.selectFilter('All');
    await todoPage.expectVisibleTodos(['walk the dog', 'write tests']);
  });

  test('adds a todo while the Completed filter hides it', async ({ todoPage }) => {
    await todoPage.selectFilter('Completed');

    await todoPage.submitNewTodo('new and active');

    await todoPage.expectVisibleTodos(['walk the dog']);
    await todoPage.expectActiveCount(3);
    await todoPage.selectFilter('All');
    await todoPage.expectVisibleTodos([
      'buy milk',
      'walk the dog',
      'write tests',
      'new and active',
    ]);
  });

  test('honours a filter hash typed straight into the address bar', async ({ todoPage }) => {
    await todoPage.goto('Active');

    await todoPage.expectVisibleTodos(['buy milk', 'write tests']);
    await todoPage.expectSelectedFilter('Active');
  });

  test('falls back to All for an unrecognised hash', async ({ todoPage, page }) => {
    await page.goto(`${APP_URL}#/no-such-filter`);

    await todoPage.expectVisibleTodos(['buy milk', 'walk the dog', 'write tests']);
    await todoPage.expectSelectedFilter('All');
  });

  test('restores the previous filter with browser back and forward', async ({ todoPage, page }) => {
    await todoPage.selectFilter('Active');
    await todoPage.selectFilter('Completed');
    await todoPage.expectVisibleTodos(['walk the dog']);

    await page.goBack();

    await expect(page).toHaveURL(`${APP_URL}#/active`);
    await todoPage.expectSelectedFilter('Active');
    await todoPage.expectVisibleTodos(['buy milk', 'write tests']);

    await page.goForward();

    await expect(page).toHaveURL(`${APP_URL}#/completed`);
    await todoPage.expectSelectedFilter('Completed');
    await todoPage.expectVisibleTodos(['walk the dog']);
  });
});
