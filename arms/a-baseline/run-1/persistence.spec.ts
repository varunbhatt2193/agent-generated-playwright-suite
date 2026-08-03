import { expect, test } from '@playwright/test';
import { openApp, STORAGE_KEY, TodoApp } from './todo-app';

test.describe('persistence', () => {
  test('todos, completion and edits survive a reload', async ({ page }) => {
    const app = await openApp(page);
    await app.add('one', 'two', 'three');
    await app.toggle('two');
    await app.editTo('three', 'three renamed');

    await page.reload();

    await expect(app.titles).toHaveText(['one', 'two', 'three renamed']);
    await expect(app.item('two')).toHaveClass(/completed/);
    await expect(app.todoCount).toHaveText('2 items left');
  });

  test('deletions survive a reload', async ({ page }) => {
    const app = await openApp(page);
    await app.add('one', 'two');
    await app.remove('one');

    await page.reload();

    await expect(app.titles).toHaveText(['two']);
  });

  test('the selected filter survives a reload', async ({ page }) => {
    const app = await openApp(page);
    await app.add('one', 'two');
    await app.toggle('one');
    await app.filterActive.click();

    await page.reload();

    await expect(page).toHaveURL(/#\/active$/);
    await expect(app.filterActive).toHaveClass(/selected/);
    await expect(app.titles).toHaveText(['two']);
  });

  test(`writes the list to localStorage under "${STORAGE_KEY}"`, async ({ page }) => {
    const app = await openApp(page);
    await app.add('one', 'two');
    await app.toggle('one');

    const stored = await app.readStorage();

    expect(stored).not.toBeNull();
    expect(stored!.map(({ title, completed }) => ({ title, completed }))).toEqual([
      { title: 'one', completed: true },
      { title: 'two', completed: false },
    ]);
    for (const todo of stored!) {
      expect(typeof todo.id).toBe('string');
      expect(todo.id.length).toBeGreaterThan(0);
    }
  });

  test('restores a list written by a previous session', async ({ page }) => {
    const app = new TodoApp(page);
    await app.seed([
      { id: 'seed-1', title: 'from storage', completed: false },
      { id: 'seed-2', title: 'already done', completed: true },
    ]);
    await app.goto();

    await expect(app.titles).toHaveText(['from storage', 'already done']);
    await expect(app.item('already done')).toHaveClass(/completed/);
    await expect(app.todoCount).toHaveText('1 item left');
  });

  test('starts empty in a fresh browser session', async ({ page }) => {
    const app = await openApp(page);
    await expect(app.items).toHaveCount(0);
  });
});
