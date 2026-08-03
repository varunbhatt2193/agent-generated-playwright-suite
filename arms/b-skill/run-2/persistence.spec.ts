import { test, expect } from './fixtures';
import { APP_URL, STORAGE_KEY, TodoPage } from './pages/todo-page';

test.describe('persistence', () => {
  test('keeps todos and their order across a reload', async ({ todoPage }) => {
    await todoPage.addTodos('buy milk', 'walk the dog', 'write tests');

    await todoPage.page.reload();

    await todoPage.expectVisibleTitles(['buy milk', 'walk the dog', 'write tests']);
    await expect(todoPage.counter).toHaveText('3 items left');
  });

  test('keeps completion state across a reload', async ({ todoPage }) => {
    await todoPage.addTodos('buy milk', 'walk the dog');
    await todoPage.toggle('buy milk');
    await expect(todoPage.counter).toHaveText('1 item left');

    await todoPage.page.reload();

    await expect(todoPage.item('buy milk')).toHaveClass('completed');
    await expect(todoPage.toggleFor('buy milk')).toBeChecked();
    await expect(todoPage.toggleFor('walk the dog')).not.toBeChecked();
    await expect(todoPage.counter).toHaveText('1 item left');
    await expect(todoPage.clearCompletedButton).toBeVisible();
  });

  test('keeps an edited title across a reload', async ({ todoPage }) => {
    await todoPage.addTodos('buy milk');
    await todoPage.editTodo('buy milk', 'buy oat milk');
    await todoPage.expectVisibleTitles(['buy oat milk']);

    await todoPage.page.reload();

    await todoPage.expectVisibleTitles(['buy oat milk']);
  });

  test('keeps deletions across a reload', async ({ todoPage }) => {
    await todoPage.addTodos('buy milk', 'walk the dog');
    await todoPage.remove('buy milk');

    await todoPage.page.reload();

    await todoPage.expectVisibleTitles(['walk the dog']);
  });

  test('comes back to the empty state after every todo is deleted', async ({ todoPage }) => {
    await todoPage.addTodos('buy milk');
    await todoPage.remove('buy milk');

    await todoPage.page.reload();

    await todoPage.expectEmptyState();
  });

  test('keeps the selected filter across a reload', async ({ todoPage }) => {
    await todoPage.addTodos('buy milk', 'walk the dog');
    await todoPage.toggle('buy milk');
    await todoPage.filterBy('active');

    await todoPage.page.reload();

    await expect(todoPage.page).toHaveURL(`${APP_URL}#/active`);
    await expect(todoPage.filterLinks.active).toHaveClass('selected');
    await todoPage.expectVisibleTitles(['walk the dog']);
  });

  test('stores each todo with a title, a completed flag and an id', async ({ todoPage }) => {
    await todoPage.addTodos('buy milk', 'walk the dog');
    await todoPage.toggle('walk the dog');
    await expect(todoPage.counter).toHaveText('1 item left');

    const stored = await todoPage.storedTodos();

    expect(stored).toMatchObject([
      { title: 'buy milk', completed: false },
      { title: 'walk the dog', completed: true },
    ]);
    expect(new Set(stored.map(todo => todo.id)).size).toBe(2);
  });

  test('starts empty in a browser session that has no stored todos', async ({ browser }) => {
    const context = await browser.newContext();
    const todoPage = new TodoPage(await context.newPage());
    await todoPage.goto();

    await todoPage.expectEmptyState();
    expect(await todoPage.page.evaluate(key => localStorage.getItem(key), STORAGE_KEY)).toBeNull();

    await context.close();
  });

  test('does not leak todos into a second, independent browser session', async ({ todoPage, browser }) => {
    await todoPage.addTodos('buy milk');
    await todoPage.expectVisibleTitles(['buy milk']);

    const context = await browser.newContext();
    const otherPage = new TodoPage(await context.newPage());
    await otherPage.goto();

    await otherPage.expectEmptyState();

    await context.close();
  });
});
