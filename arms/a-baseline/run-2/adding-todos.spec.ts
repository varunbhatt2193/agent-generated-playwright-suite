import { expect, test } from '@playwright/test';
import { TodoApp } from './helpers/todo-app';

test.describe('Adding todos', () => {
  let app: TodoApp;

  test.beforeEach(async ({ page }) => {
    app = new TodoApp(page);
    await app.goto();
  });

  test('adds a todo and clears the input', async () => {
    await app.newTodo.fill('buy milk');
    await app.newTodo.press('Enter');

    await app.expectTitles(['buy milk']);
    await expect(app.newTodo).toHaveValue('');
    await expect(app.counter).toHaveText('1 item left');
    await expect(app.toggleOf('buy milk')).not.toBeChecked();
  });

  test('appends todos in the order they were entered', async () => {
    await app.add('one', 'two', 'three');

    await app.expectTitles(['one', 'two', 'three']);
    await expect(app.counter).toHaveText('3 items left');
  });

  test('trims leading and trailing whitespace from the title', async () => {
    await app.add('   padded todo   ');

    await app.expectTitles(['padded todo']);
    expect(await app.storedTodos()).toEqual([
      expect.objectContaining({ title: 'padded todo', completed: false }),
    ]);
  });

  test('ignores a submit with an empty input', async () => {
    await app.newTodo.press('Enter');

    await expect(app.items).toHaveCount(0);
    await expect(app.counter).toBeHidden();
  });

  test('ignores a whitespace-only submit and keeps the typed text', async () => {
    await app.newTodo.fill('   ');
    await app.newTodo.press('Enter');

    await expect(app.items).toHaveCount(0);
    // The app rejects the entry without resetting the field.
    await expect(app.newTodo).toHaveValue('   ');
  });

  test('allows duplicate titles as separate todos', async () => {
    await app.add('buy milk', 'buy milk');

    await app.expectTitles(['buy milk', 'buy milk']);
    await expect(app.counter).toHaveText('2 items left');
  });

  test('renders markup-like titles as literal text', async () => {
    const title = '<b>bold</b> & "quotes" éü';
    await app.add(title);

    await expect(app.titles.first()).toHaveText(title);
    // Nothing was parsed as HTML: no <b> element made it into the list.
    await expect(app.items.locator('b')).toHaveCount(0);
  });

  test('keeps very long titles intact', async () => {
    const title = 'x'.repeat(300);
    await app.add(title);

    expect((await app.storedTodos())[0].title).toHaveLength(300);
  });

  test('reveals the list and footer only once the first todo exists', async ({ page }) => {
    await expect(page.locator('.main')).toBeHidden();
    await expect(page.locator('.footer')).toBeHidden();

    await app.add('first');

    await expect(page.locator('.main')).toBeVisible();
    await expect(page.locator('.footer')).toBeVisible();
    await expect(app.toggleAll).toBeVisible();
    await expect(app.filterLink('All')).toBeVisible();
  });
});
