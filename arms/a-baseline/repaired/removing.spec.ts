import { expect, test } from '@playwright/test';
import { openApp, TodoApp } from './todo-app';

test.describe('deleting todos', () => {
  let app: TodoApp;

  test.beforeEach(async ({ page }) => {
    app = await openApp(page);
    await app.add('one', 'two', 'three');
  });

  test('the delete button is revealed by hovering its row', async () => {
    await expect(app.deleteButtonOf('two')).toBeHidden();

    await app.item('two').hover();
    await expect(app.deleteButtonOf('two')).toBeVisible();
    await expect(app.deleteButtonOf('one')).toBeHidden();
  });

  test('the delete button removes only its own todo', async () => {
    await app.remove('two');

    await expect(app.titles).toHaveText(['one', 'three']);
    await expect(app.todoCount).toHaveText('2 items left');
  });

  test('deleting every todo returns the app to its empty state', async () => {
    for (const title of ['one', 'two', 'three']) {
      await app.remove(title);
    }

    await expect(app.items).toHaveCount(0);
    await expect(app.todoCount).toBeHidden();
  });

  test('a completed todo can be deleted', async () => {
    await app.toggle('two');
    await app.remove('two');

    await expect(app.titles).toHaveText(['one', 'three']);
    await expect(app.todoCount).toHaveText('2 items left');
  });
});

test.describe('clear completed', () => {
  let app: TodoApp;

  test.beforeEach(async ({ page }) => {
    app = await openApp(page);
    await app.add('one', 'two', 'three');
  });

  test('the button only appears once something is completed', async () => {
    await expect(app.clearCompleted).toBeHidden();

    await app.toggle('two');
    await expect(app.clearCompleted).toBeVisible();

    await app.toggle('two');
    await expect(app.clearCompleted).toBeHidden();
  });

  test('removes the completed todos and leaves the active ones', async () => {
    await app.toggle('one');
    await app.toggle('three');
    await app.clearCompleted.click();

    await expect(app.titles).toHaveText(['two']);
    await expect(app.todoCount).toHaveText('1 item left');
    await expect(app.clearCompleted).toBeHidden();
  });

  test('clearing everything returns the app to its empty state', async () => {
    await app.toggleAll.check();
    await app.clearCompleted.click();

    await expect(app.items).toHaveCount(0);
    await expect(app.todoCount).toBeHidden();
    await expect(app.toggleAll).toBeHidden();
  });

  test('works from the completed filter, leaving that view empty', async () => {
    await app.toggle('one');
    await app.filterCompleted.click();
    await expect(app.titles).toHaveText(['one']);

    await app.clearCompleted.click();

    await expect(app.items).toHaveCount(0);
    await expect(app.todoCount).toHaveText('2 items left');

    await app.filterAll.click();
    await expect(app.titles).toHaveText(['two', 'three']);
  });
});
