import { expect, test } from '@playwright/test';
import { TodoApp } from './helpers/todo-app';

test.describe('Filtering', () => {
  let app: TodoApp;

  test.beforeEach(async ({ page }) => {
    app = new TodoApp(page);
    await app.goto();
    await app.add('one', 'two', 'three');
    await app.toggleOf('two').check();
  });

  test('All shows every todo and is selected by default', async () => {
    await app.expectTitles(['one', 'two', 'three']);
    await expect(app.filterLink('All')).toHaveClass(/selected/);
    await expect(app.filterLink('Active')).not.toHaveClass(/selected/);
  });

  test('Active shows only the unfinished todos', async ({ page }) => {
    await app.filterLink('Active').click();

    await app.expectTitles(['one', 'three']);
    await expect(app.filterLink('Active')).toHaveClass(/selected/);
    await expect(page).toHaveURL(/#\/active$/);
  });

  test('Completed shows only the finished todos', async ({ page }) => {
    await app.filterLink('Completed').click();

    await app.expectTitles(['two']);
    await expect(app.filterLink('Completed')).toHaveClass(/selected/);
    await expect(page).toHaveURL(/#\/completed$/);
  });

  test('Completed is empty when nothing is finished, but the chrome stays', async ({ page }) => {
    await app.toggleOf('two').uncheck();
    await app.filterLink('Completed').click();

    await expect(app.items).toHaveCount(0);
    await expect(page.locator('.footer')).toBeVisible();
    await expect(app.counter).toHaveText('3 items left');
    await expect(app.clearCompleted).toBeHidden();
  });

  test('the counter always reports active todos, whatever the filter', async () => {
    for (const filter of ['Active', 'Completed', 'All'] as const) {
      await app.filterLink(filter).click();
      await expect(app.counter).toHaveText('2 items left');
    }
  });

  test('completing a todo removes it from the Active view', async () => {
    await app.filterLink('Active').click();
    await app.toggleTodo('one');

    await app.expectTitles(['three']);
    await expect(app.counter).toHaveText('1 item left');
  });

  test('reactivating a todo removes it from the Completed view', async () => {
    await app.filterLink('Completed').click();
    await app.toggleTodo('two');

    await expect(app.items).toHaveCount(0);
    await app.filterLink('All').click();
    await app.expectTitles(['one', 'two', 'three']);
  });

  test('a todo added under the Completed filter is stored but not shown', async () => {
    await app.filterLink('Completed').click();
    await app.newTodo.fill('four');
    await app.newTodo.press('Enter');

    await app.expectTitles(['two']);
    await expect(app.counter).toHaveText('3 items left');

    await app.filterLink('All').click();
    await app.expectTitles(['one', 'two', 'three', 'four']);
  });

  test('"Mark all as complete" also affects todos hidden by the filter', async () => {
    await app.filterLink('Active').click();
    await app.toggleAll.check();

    // Everything is completed, so the Active view empties out.
    await expect(app.items).toHaveCount(0);
    await expect(app.counter).toHaveText('0 items left');
    expect((await app.storedTodos()).every((t) => t.completed)).toBe(true);
  });

  test('editing works while a filter is applied', async () => {
    await app.filterLink('Active').click();
    await app.edit('three', 'three edited');

    await app.expectTitles(['one', 'three edited']);
    await app.filterLink('All').click();
    await app.expectTitles(['one', 'two', 'three edited']);
  });

  test('"Clear completed" works while the Completed filter is applied', async () => {
    await app.filterLink('Completed').click();
    await app.clearCompleted.click();

    await expect(app.items).toHaveCount(0);
    await app.filterLink('All').click();
    await app.expectTitles(['one', 'three']);
  });
});

test.describe('Hash routing', () => {
  let app: TodoApp;

  test.beforeEach(async ({ page }) => {
    app = new TodoApp(page);
    await app.goto();
    await app.add('one', 'two', 'three');
    await app.toggleOf('two').check();
  });

  test('#/active can be opened directly', async ({ page }) => {
    await page.goto('https://demo.playwright.dev/todomvc/#/active');
    await page.reload();

    await app.expectTitles(['one', 'three']);
    await expect(app.filterLink('Active')).toHaveClass(/selected/);
  });

  test('#/completed can be opened directly', async ({ page }) => {
    await page.goto('https://demo.playwright.dev/todomvc/#/completed');
    await page.reload();

    await app.expectTitles(['two']);
    await expect(app.filterLink('Completed')).toHaveClass(/selected/);
  });

  test('an unrecognised hash falls back to showing every todo', async ({ page }) => {
    await page.goto('https://demo.playwright.dev/todomvc/#/does-not-exist');
    await page.reload();

    await app.expectTitles(['one', 'two', 'three']);
    await expect(app.filterLink('All')).toHaveClass(/selected/);
  });

  test('browser back and forward move between filters', async ({ page }) => {
    await app.filterLink('Active').click();
    await app.filterLink('Completed').click();

    await page.goBack();
    await expect(page).toHaveURL(/#\/active$/);
    await app.expectTitles(['one', 'three']);

    await page.goBack();
    await expect(page).toHaveURL(/#\/$/);
    await app.expectTitles(['one', 'two', 'three']);

    await page.goForward();
    await expect(page).toHaveURL(/#\/active$/);
    await app.expectTitles(['one', 'three']);
  });
});
