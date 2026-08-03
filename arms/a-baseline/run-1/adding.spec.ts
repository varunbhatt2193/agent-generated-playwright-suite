import { expect, test } from '@playwright/test';
import { openApp, TodoApp } from './todo-app';

test.describe('adding todos', () => {
  let app: TodoApp;

  test.beforeEach(async ({ page }) => {
    app = await openApp(page);
  });

  test('adds a todo and clears the input', async () => {
    await app.newTodo.fill('buy milk');
    await app.newTodo.press('Enter');

    await expect(app.titles).toHaveText(['buy milk']);
    await expect(app.newTodo).toHaveValue('');
    await expect(app.newTodo).toBeFocused();
  });

  test('appends new todos to the bottom of the list', async () => {
    await app.add('first', 'second', 'third');
    await expect(app.titles).toHaveText(['first', 'second', 'third']);
  });

  test('creates todos in the active state', async () => {
    await app.add('unfinished');

    await expect(app.toggleOf('unfinished')).not.toBeChecked();
    await expect(app.item('unfinished')).not.toHaveClass(/completed/);
    await expect(app.todoCount).toHaveText('1 item left');
  });

  test('trims leading and trailing whitespace from the title', async () => {
    await app.newTodo.fill('   padded todo   ');
    await app.newTodo.press('Enter');

    await expect(app.titles).toHaveText(['padded todo']);
  });

  test('preserves whitespace inside the title', async () => {
    await app.add('two   spaced   words');
    await expect(app.titles).toHaveText(['two   spaced   words']);
  });

  test('ignores Enter on an empty input', async () => {
    await app.newTodo.press('Enter');
    await expect(app.items).toHaveCount(0);
  });

  test('ignores a whitespace-only title and keeps the text in the input', async () => {
    await app.newTodo.fill('     ');
    await app.newTodo.press('Enter');

    await expect(app.items).toHaveCount(0);
    // The input is only cleared when a todo was actually created.
    await expect(app.newTodo).toHaveValue('     ');
  });

  test('allows duplicate titles as separate todos', async () => {
    await app.add('duplicate', 'duplicate');

    await expect(app.items).toHaveCount(2);
    await expect(app.titles).toHaveText(['duplicate', 'duplicate']);
    await expect(app.todoCount).toHaveText('2 items left');
  });

  test('renders markup in a title as literal text', async () => {
    const title = '<b>bold</b> & "quotes" é';
    await app.add(title);

    await expect(app.titles).toHaveText([title]);
    await expect(app.titles.first().locator('b')).toHaveCount(0);
  });

  test('accepts a long title without truncating it', async () => {
    const title = 'x'.repeat(300);
    await app.add(title);

    await expect(app.titles).toHaveText([title]);
  });
});
