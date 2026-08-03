import { expect, test } from '@playwright/test';
import { TodoApp } from './helpers/todo-app';

test.describe('Deleting todos', () => {
  let app: TodoApp;

  test.beforeEach(async ({ page }) => {
    app = new TodoApp(page);
    await app.goto();
    await app.add('one', 'two', 'three');
  });

  test('the delete button appears only while the row is hovered', async () => {
    await expect(app.deleteOf('two')).toBeHidden();

    await app.item('two').hover();
    await expect(app.deleteOf('two')).toBeVisible();
  });

  test('deleting removes just that todo', async () => {
    await app.deleteTodo('two');

    await app.expectTitles(['one', 'three']);
    await expect(app.counter).toHaveText('2 items left');
  });

  test('deleting a completed todo updates the "Clear completed" button', async () => {
    await app.toggleOf('two').check();
    await expect(app.clearCompleted).toBeVisible();

    await app.deleteTodo('two');

    await app.expectTitles(['one', 'three']);
    await expect(app.clearCompleted).toBeHidden();
    await expect(app.counter).toHaveText('2 items left');
  });

  test('deleting the last todo returns the app to its empty state', async ({ page }) => {
    for (const title of ['one', 'two', 'three']) {
      await app.deleteTodo(title);
    }

    await expect(app.items).toHaveCount(0);
    await expect(page.locator('.main')).toBeHidden();
    await expect(page.locator('.footer')).toBeHidden();
    await expect(app.newTodo).toBeVisible();
    expect(await app.rawStorage()).toBe('[]');
  });

  test('deletions are persisted', async ({ page }) => {
    await app.deleteTodo('one');
    await page.reload();

    await app.expectTitles(['two', 'three']);
  });
});

test.describe('Clear completed', () => {
  let app: TodoApp;

  test.beforeEach(async ({ page }) => {
    app = new TodoApp(page);
    await app.goto();
    await app.add('one', 'two', 'three');
  });

  test('the button is hidden while nothing is completed', async () => {
    await expect(app.clearCompleted).toBeHidden();
  });

  test('removes completed todos and keeps the active ones', async () => {
    await app.toggleOf('one').check();
    await app.toggleOf('three').check();
    await app.clearCompleted.click();

    await app.expectTitles(['two']);
    await expect(app.counter).toHaveText('1 item left');
    await expect(app.clearCompleted).toBeHidden();
  });

  test('clearing every todo returns the app to its empty state', async ({ page }) => {
    await app.toggleAll.check();
    await app.clearCompleted.click();

    await expect(app.items).toHaveCount(0);
    await expect(page.locator('.footer')).toBeHidden();
    expect(await app.rawStorage()).toBe('[]');
  });

  test('the clearing is persisted', async ({ page }) => {
    await app.toggleOf('one').check();
    await app.clearCompleted.click();
    await page.reload();

    await app.expectTitles(['two', 'three']);
  });
});
