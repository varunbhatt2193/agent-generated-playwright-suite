import { expect, test } from '@playwright/test';
import { TodoApp } from './helpers/todo-app';

test.describe('Completing todos', () => {
  let app: TodoApp;

  test.beforeEach(async ({ page }) => {
    app = new TodoApp(page);
    await app.goto();
    await app.add('one', 'two', 'three');
  });

  test('checking a todo marks it completed and updates the counter', async () => {
    await app.toggleOf('two').check();

    await expect(app.item('two')).toHaveClass(/completed/);
    await expect(app.item('one')).not.toHaveClass(/completed/);
    await expect(app.counter).toHaveText('2 items left');
    await expect(app.clearCompleted).toBeVisible();
  });

  test('unchecking a todo makes it active again', async () => {
    await app.toggleOf('two').check();
    await app.toggleOf('two').uncheck();

    await expect(app.item('two')).not.toHaveClass(/completed/);
    await expect(app.counter).toHaveText('3 items left');
    await expect(app.clearCompleted).toBeHidden();
  });

  test('completion state is persisted', async ({ page }) => {
    await app.toggleOf('two').check();
    await page.reload();

    await expect(app.toggleOf('two')).toBeChecked();
    await expect(app.toggleOf('one')).not.toBeChecked();
    expect(await app.storedTodos()).toEqual([
      expect.objectContaining({ title: 'one', completed: false }),
      expect.objectContaining({ title: 'two', completed: true }),
      expect.objectContaining({ title: 'three', completed: false }),
    ]);
  });

  test('"Mark all as complete" completes every todo', async () => {
    await app.toggleAll.check();

    for (const title of ['one', 'two', 'three']) {
      await expect(app.toggleOf(title)).toBeChecked();
      await expect(app.item(title)).toHaveClass(/completed/);
    }
    await expect(app.counter).toHaveText('0 items left');
  });

  test('unchecking "Mark all as complete" reactivates every todo', async () => {
    await app.toggleAll.check();
    await app.toggleAll.uncheck();

    for (const title of ['one', 'two', 'three']) {
      await expect(app.toggleOf(title)).not.toBeChecked();
    }
    await expect(app.counter).toHaveText('3 items left');
    await expect(app.clearCompleted).toBeHidden();
  });

  test('"Mark all as complete" completes the todos left active by a partial selection', async () => {
    await app.toggleOf('two').check();
    await app.toggleAll.check();

    await expect(app.counter).toHaveText('0 items left');
    expect((await app.storedTodos()).every((t) => t.completed)).toBe(true);
  });

  test('clicking the "Mark all as complete" label toggles all todos', async () => {
    await app.toggleAllLabel.click();

    await expect(app.counter).toHaveText('0 items left');
    await expect(app.toggleAll).toBeChecked();
  });

  test('"Mark all as complete" reflects the state of the individual todos', async () => {
    await expect(app.toggleAll).not.toBeChecked();

    await app.toggleOf('one').check();
    await app.toggleOf('two').check();
    await expect(app.toggleAll).not.toBeChecked();

    // Completing the last one flips the master checkbox on...
    await app.toggleOf('three').check();
    await expect(app.toggleAll).toBeChecked();

    // ...and reactivating any single todo flips it back off.
    await app.toggleOf('three').uncheck();
    await expect(app.toggleAll).not.toBeChecked();
  });

  test('the counter is singular for exactly one remaining todo', async () => {
    await app.toggleOf('one').check();
    await app.toggleOf('two').check();

    await expect(app.counter).toHaveText('1 item left');
  });
});
