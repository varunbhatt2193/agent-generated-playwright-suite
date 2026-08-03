import { expect, test } from './todo-app';

test.describe('completing todos', () => {
  test.beforeEach(async ({ todo }) => {
    await todo.add('one', 'two', 'three');
  });

  test('marks a single todo complete and back again', async ({ todo }) => {
    await todo.toggle(1);

    await expect(todo.item(1)).toHaveClass(/completed/);
    await expect(todo.toggleOf(1)).toBeChecked();
    await expect(todo.item(0)).not.toHaveClass(/completed/);
    await expect(todo.counter).toHaveText('2 items left');
    await todo.expectStored([
      { title: 'one', completed: false },
      { title: 'two', completed: true },
      { title: 'three', completed: false },
    ]);

    await todo.toggle(1);

    await expect(todo.item(1)).not.toHaveClass(/completed/);
    await expect(todo.toggleOf(1)).not.toBeChecked();
    await expect(todo.counter).toHaveText('3 items left');
    await todo.expectStored([
      { title: 'one', completed: false },
      { title: 'two', completed: false },
      { title: 'three', completed: false },
    ]);
  });

  test('uses singular wording for exactly one remaining item', async ({ todo }) => {
    await todo.toggle(0);
    await expect(todo.counter).toHaveText('2 items left');

    await todo.toggle(1);
    await expect(todo.counter).toHaveText('1 item left');

    await todo.toggle(2);
    await expect(todo.counter).toHaveText('0 items left');
  });

  test('shows "Clear completed" only while something is completed', async ({ todo }) => {
    await expect(todo.clearCompleted).toBeHidden();

    await todo.toggle(0);
    await expect(todo.clearCompleted).toBeVisible();

    await todo.toggle(0);
    await expect(todo.clearCompleted).toBeHidden();
  });

  test('"Mark all as complete" completes every todo', async ({ todo }) => {
    await todo.toggleAll.check();

    for (let i = 0; i < 3; i++) {
      await expect(todo.item(i)).toHaveClass(/completed/);
      await expect(todo.toggleOf(i)).toBeChecked();
    }
    await expect(todo.counter).toHaveText('0 items left');
    await todo.expectStored([
      { title: 'one', completed: true },
      { title: 'two', completed: true },
      { title: 'three', completed: true },
    ]);
  });

  test('unchecking "Mark all as complete" reactivates every todo', async ({ todo }) => {
    await todo.toggleAll.check();
    await todo.toggleAll.uncheck();

    for (let i = 0; i < 3; i++) {
      await expect(todo.item(i)).not.toHaveClass(/completed/);
      await expect(todo.toggleOf(i)).not.toBeChecked();
    }
    await expect(todo.counter).toHaveText('3 items left');
  });

  test('"Mark all as complete" mirrors the individual checkboxes', async ({ todo }) => {
    await expect(todo.toggleAll).not.toBeChecked();

    await todo.toggle(0);
    await todo.toggle(1);
    await expect(todo.toggleAll).not.toBeChecked();

    await todo.toggle(2);
    await expect(todo.toggleAll).toBeChecked();

    await todo.toggle(2);
    await expect(todo.toggleAll).not.toBeChecked();
  });

  test('"Mark all as complete" also affects todos hidden by the current filter', async ({ todo }) => {
    await todo.toggle(0);
    await todo.filterCompleted.click();
    await expect(todo.titles).toHaveText(['one']);

    await todo.toggleAll.check();

    // The two todos hidden by the Completed filter were completed as well.
    await expect(todo.titles).toHaveText(['one', 'two', 'three']);
    await expect(todo.counter).toHaveText('0 items left');
    await todo.expectStored([
      { title: 'one', completed: true },
      { title: 'two', completed: true },
      { title: 'three', completed: true },
    ]);
  });

  test('completion state survives a reload', async ({ todo, page }) => {
    await todo.toggle(0);
    await todo.toggle(2);

    await page.reload();

    await expect(todo.item(0)).toHaveClass(/completed/);
    await expect(todo.item(1)).not.toHaveClass(/completed/);
    await expect(todo.item(2)).toHaveClass(/completed/);
    await expect(todo.counter).toHaveText('1 item left');
  });
});
