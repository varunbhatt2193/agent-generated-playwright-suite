import { expect, test } from '@playwright/test';
import { openApp, TodoApp } from './todo-app';

test.describe('filtering', () => {
  let app: TodoApp;

  test.beforeEach(async ({ page }) => {
    app = await openApp(page);
    await app.add('one', 'two', 'three');
    await app.toggle('two');
  });

  test('"All" is selected by default and shows everything', async () => {
    await expect(app.filterAll).toHaveClass(/selected/);
    await expect(app.titles).toHaveText(['one', 'two', 'three']);
  });

  test('"Active" shows only the unfinished todos', async () => {
    await app.filterActive.click();

    await expect(app.page).toHaveURL(/#\/active$/);
    await expect(app.filterActive).toHaveClass(/selected/);
    await expect(app.filterAll).not.toHaveClass(/selected/);
    await expect(app.titles).toHaveText(['one', 'three']);
  });

  test('"Completed" shows only the finished todos', async () => {
    await app.filterCompleted.click();

    await expect(app.page).toHaveURL(/#\/completed$/);
    await expect(app.filterCompleted).toHaveClass(/selected/);
    await expect(app.titles).toHaveText(['two']);
  });

  test('returning to "All" restores the full list', async () => {
    await app.filterCompleted.click();
    await app.filterAll.click();

    await expect(app.page).toHaveURL(/#\/$/);
    await expect(app.titles).toHaveText(['one', 'two', 'three']);
  });

  test('the remaining counter is not affected by the active filter', async () => {
    await expect(app.todoCount).toHaveText('2 items left');

    await app.filterActive.click();
    await expect(app.todoCount).toHaveText('2 items left');

    await app.filterCompleted.click();
    await expect(app.todoCount).toHaveText('2 items left');
  });

  test('"Clear completed" stays available under every filter', async () => {
    for (const filter of [app.filterActive, app.filterCompleted, app.filterAll]) {
      await filter.click();
      await expect(app.clearCompleted).toBeVisible();
    }
  });

  test('completing a todo removes it from the active view', async () => {
    await app.filterActive.click();
    await expect(app.titles).toHaveText(['one', 'three']);

    await app.toggle('one');

    await expect(app.titles).toHaveText(['three']);
    await expect(app.todoCount).toHaveText('1 item left');
  });

  test('reactivating a todo removes it from the completed view', async () => {
    await app.filterCompleted.click();
    await expect(app.titles).toHaveText(['two']);

    await app.toggle('two');

    await expect(app.items).toHaveCount(0);
    await expect(app.todoCount).toHaveText('3 items left');
  });

  test('a todo added from a filtered view still joins the list', async () => {
    await app.filterCompleted.click();
    await app.add('added while filtered');

    // The new todo is active, so it stays out of the completed view but is counted as remaining.
    await expect(app.titles).toHaveText(['two']);
    await expect(app.todoCount).toHaveText('3 items left');

    await app.filterAll.click();
    await expect(app.titles).toHaveText(['one', 'two', 'three', 'added while filtered']);
  });

  test('a todo can be edited from a filtered view', async () => {
    await app.filterActive.click();
    await app.editTo('three', 'three renamed');

    await expect(app.titles).toHaveText(['one', 'three renamed']);
  });

  test('a todo can be deleted from a filtered view', async () => {
    await app.filterActive.click();
    await app.remove('one');

    await expect(app.titles).toHaveText(['three']);

    await app.filterAll.click();
    await expect(app.titles).toHaveText(['two', 'three']);
  });

  test('"mark all as complete" acts on every todo, not just the visible ones', async () => {
    await app.filterActive.click();
    await expect(app.toggleAll).not.toBeChecked();

    await app.toggleAll.click();

    await expect(app.items).toHaveCount(0);
    await expect(app.todoCount).toHaveText('0 items left');

    await app.filterCompleted.click();
    await expect(app.titles).toHaveText(['one', 'two', 'three']);
  });

  test('"mark all as complete" reactivates everything when the active view is empty', async () => {
    await app.toggleAll.check();
    await app.filterActive.click();
    await expect(app.items).toHaveCount(0);
    await expect(app.toggleAll).toBeChecked();

    await app.toggleAll.click();

    await expect(app.titles).toHaveText(['one', 'two', 'three']);
    await expect(app.todoCount).toHaveText('3 items left');
  });
});

test.describe('filter routing', () => {
  test('a filter route can be opened directly', async ({ page }) => {
    const app = new TodoApp(page);
    await app.seed([
      { id: 'a', title: 'one', completed: false },
      { id: 'b', title: 'two', completed: true },
    ]);
    await app.goto('#/completed');

    await expect(app.titles).toHaveText(['two']);
    await expect(app.filterCompleted).toHaveClass(/selected/);
  });

  test('an unknown route falls back to showing everything', async ({ page }) => {
    const app = new TodoApp(page);
    await app.seed([
      { id: 'a', title: 'one', completed: false },
      { id: 'b', title: 'two', completed: true },
    ]);
    await app.goto('#/not-a-filter');

    await expect(app.titles).toHaveText(['one', 'two']);
    await expect(app.filterAll).toHaveClass(/selected/);
  });

  test('browser back and forward move between filters', async ({ page }) => {
    const app = await openApp(page);
    await app.add('one', 'two');
    await app.toggle('one');

    await app.filterActive.click();
    await app.filterCompleted.click();
    await expect(app.titles).toHaveText(['one']);

    await page.goBack();
    await expect(page).toHaveURL(/#\/active$/);
    await expect(app.filterActive).toHaveClass(/selected/);
    await expect(app.titles).toHaveText(['two']);

    await page.goForward();
    await expect(page).toHaveURL(/#\/completed$/);
    await expect(app.titles).toHaveText(['one']);
  });
});
