import { expect, test } from '@playwright/test';
import { seedTodos, TodoApp, todo } from './helpers/todo-app';

test.describe('App shell', () => {
  let app: TodoApp;

  test.beforeEach(async ({ page }) => {
    app = new TodoApp(page);
    await app.goto();
  });

  test('renders the header and focuses the new-todo field on load', async ({ page }) => {
    await expect(page).toHaveTitle('React • TodoMVC');
    await expect(app.heading).toBeVisible();
    await expect(app.newTodo).toBeFocused();
    await expect(app.newTodo).toHaveAttribute('placeholder', 'What needs to be done?');
  });

  test('shows the editing hint and credits in the footer', async ({ page }) => {
    await expect(page.getByText('Double-click to edit a todo')).toBeVisible();
    await expect(page.getByRole('link', { name: 'TodoMVC', exact: true })).toHaveAttribute(
      'href',
      'http://todomvc.com',
    );
  });

  test('starts empty with no list, filters or counter', async () => {
    await expect(app.items).toHaveCount(0);
    await expect(app.counter).toBeHidden();
    await expect(app.toggleAll).toBeHidden();
    await expect(app.filterLink('All')).toBeHidden();
  });

  test('loads without console errors from the app itself', async ({ page }) => {
    const errors: string[] = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error') errors.push(msg.text());
    });

    await app.goto();
    await app.add('one');
    await app.toggleOf('one').check();

    // The demo only ever logs a 404 for its missing favicon.
    expect(errors.filter((text) => !/favicon/i.test(text))).toEqual([]);
  });
});

test.describe('Persistence', () => {
  test('todos, order and completion survive a reload', async ({ page }) => {
    const app = new TodoApp(page);
    await app.goto();
    await app.add('one', 'two', 'three');
    await app.toggleOf('two').check();

    await page.reload();

    await app.expectTitles(['one', 'two', 'three']);
    await expect(app.toggleOf('two')).toBeChecked();
    await expect(app.counter).toHaveText('2 items left');
  });

  test('todos are stored with an id, title and completed flag', async ({ page }) => {
    const app = new TodoApp(page);
    await app.goto();
    await app.add('one');
    await app.toggleOf('one').check();

    expect(await app.storedTodos()).toEqual([
      { id: expect.any(String), title: 'one', completed: true },
    ]);
  });

  test('a previously stored list is restored on first load', async ({ page }) => {
    await seedTodos(page, [todo('restored active'), todo('restored done', true)]);

    const app = new TodoApp(page);
    await app.goto();

    await app.expectTitles(['restored active', 'restored done']);
    await expect(app.toggleOf('restored done')).toBeChecked();
    await expect(app.counter).toHaveText('1 item left');
    await expect(app.clearCompleted).toBeVisible();
  });

  test('a fresh browser context starts with an empty list', async ({ page }) => {
    const app = new TodoApp(page);
    await app.goto();

    await expect(app.items).toHaveCount(0);
    expect(await app.rawStorage()).toBeNull();
  });
});
