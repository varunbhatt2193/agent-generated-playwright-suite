import { APP_URL, STORAGE_KEY, TodoPage, expect, test } from './todo-app';

test.describe('persistence', () => {
  test('stores todos under the react-todos key as id/title/completed records', async ({ todo }) => {
    await todo.add('one', 'two');
    await todo.toggle(0);

    const stored = await todo.storedTodos();
    expect(stored).toHaveLength(2);
    expect(stored![0]).toEqual({ id: expect.any(String), title: 'one', completed: true });
    expect(stored![1]).toEqual({ id: expect.any(String), title: 'two', completed: false });
  });

  test('restores todos, order and completion after a reload', async ({ todo, page }) => {
    await todo.add('one', 'two', 'three');
    await todo.toggle(1);
    await page.reload();

    await expect(todo.titles).toHaveText(['one', 'two', 'three']);
    await expect(todo.item(1)).toHaveClass(/completed/);
    await expect(todo.counter).toHaveText('2 items left');
    await expect(todo.toggleAll).not.toBeChecked();
  });

  test('keeps the active filter across a reload', async ({ todo, page }) => {
    await todo.add('one', 'two');
    await todo.toggle(0);
    await todo.filterCompleted.click();

    await page.reload();

    await expect(page).toHaveURL(/#\/completed$/);
    await expect(todo.filterCompleted).toHaveClass(/selected/);
    await expect(todo.titles).toHaveText(['one']);
  });

  test('reloads an all-completed list with the toggle-all box checked', async ({ todo, page }) => {
    await todo.add('one', 'two');
    await todo.toggleAll.check();
    await page.reload();

    await expect(todo.toggleAll).toBeChecked();
    await expect(todo.counter).toHaveText('0 items left');
    await expect(todo.clearCompleted).toBeVisible();
  });

  test('renders todos that were already in localStorage on first load', async ({ page }) => {
    const todo = new TodoPage(page);
    await page.addInitScript(
      ([key, value]) => window.localStorage.setItem(key, value),
      [
        STORAGE_KEY,
        JSON.stringify([
          { id: 'seed-1', title: 'seeded active', completed: false },
          { id: 'seed-2', title: 'seeded done', completed: true },
        ]),
      ] as const,
    );

    await page.goto(`${APP_URL}#/active`);

    await expect(todo.titles).toHaveText(['seeded active']);
    await expect(todo.filterActive).toHaveClass(/selected/);
    await expect(todo.counter).toHaveText('1 item left');

    await todo.filterAll.click();
    await expect(todo.titles).toHaveText(['seeded active', 'seeded done']);
  });

  test('does not write to storage until the first todo is created', async ({ todo }) => {
    expect(await todo.storedTodos()).toBeNull();

    await todo.add('first');
    await todo.expectStored([{ title: 'first', completed: false }]);
  });

  test('starts from an empty list in a fresh browser context', async ({ todo }) => {
    await expect(todo.items).toHaveCount(0);
  });
});
