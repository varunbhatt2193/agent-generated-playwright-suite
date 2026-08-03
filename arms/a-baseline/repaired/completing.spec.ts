import { expect, test } from '@playwright/test';
import { openApp, TodoApp } from './todo-app';

test.describe('completing todos', () => {
  let app: TodoApp;

  test.beforeEach(async ({ page }) => {
    app = await openApp(page);
    await app.add('one', 'two', 'three');
  });

  test('marks a single todo complete and back to active', async () => {
    await app.toggle('two');
    await expect(app.item('two')).toHaveClass(/completed/);
    await expect(app.toggleOf('two')).toBeChecked();
    await expect(app.item('one')).not.toHaveClass(/completed/);

    await app.toggle('two');
    await expect(app.item('two')).not.toHaveClass(/completed/);
    await expect(app.toggleOf('two')).not.toBeChecked();
  });

  test('keeps completed todos in place in the list', async () => {
    await app.toggle('one');
    await expect(app.titles).toHaveText(['one', 'two', 'three']);
  });

  test('counts down the remaining items and switches to the singular form at one', async () => {
    await expect(app.todoCount).toHaveText('3 items left');

    await app.toggle('one');
    await expect(app.todoCount).toHaveText('2 items left');

    await app.toggle('two');
    await expect(app.todoCount).toHaveText('1 item left');

    await app.toggle('three');
    await expect(app.todoCount).toHaveText('0 items left');
  });

  test('"mark all as complete" completes every todo', async () => {
    await app.toggleAll.check();

    await expect(app.items).toHaveCount(3);
    for (const title of ['one', 'two', 'three']) {
      await expect(app.item(title)).toHaveClass(/completed/);
      await expect(app.toggleOf(title)).toBeChecked();
    }
    await expect(app.todoCount).toHaveText('0 items left');
  });

  test('"mark all as complete" clears every todo when all are already complete', async () => {
    await app.toggleAll.check();
    await app.toggleAll.uncheck();

    for (const title of ['one', 'two', 'three']) {
      await expect(app.item(title)).not.toHaveClass(/completed/);
    }
    await expect(app.todoCount).toHaveText('3 items left');
  });

  test('"mark all as complete" reflects the state of the individual todos', async () => {
    await expect(app.toggleAll).not.toBeChecked();

    await app.toggle('one');
    await app.toggle('two');
    await expect(app.toggleAll).not.toBeChecked();

    await app.toggle('three');
    await expect(app.toggleAll).toBeChecked();

    await app.toggle('two');
    await expect(app.toggleAll).not.toBeChecked();
  });

  test('completing a todo only affects that todo', async () => {
    await app.toggle('two');

    await expect(app.toggleOf('one')).not.toBeChecked();
    await expect(app.toggleOf('two')).toBeChecked();
    await expect(app.toggleOf('three')).not.toBeChecked();
  });
});
