import { test, expect } from './fixtures';

test.describe('completing todos', () => {
  test.beforeEach(async ({ todoPage }) => {
    await todoPage.addTodos('buy milk', 'walk the dog', 'write tests');
  });

  test('marks a single todo complete and active again', async ({ todoPage }) => {
    await todoPage.toggleTodo('walk the dog');

    await todoPage.expectCompleted('walk the dog', true);
    await todoPage.expectCompleted('buy milk', false);
    await todoPage.expectActiveCount(2);

    await todoPage.toggleTodo('walk the dog');

    await todoPage.expectCompleted('walk the dog', false);
    await todoPage.expectActiveCount(3);
  });

  test('keeps a completed todo in place in the unfiltered list', async ({ todoPage }) => {
    await todoPage.toggleTodo('buy milk');

    await todoPage.expectVisibleTodos(['buy milk', 'walk the dog', 'write tests']);
  });

  test('counts down to a singular label at one remaining todo', async ({ todoPage }) => {
    await todoPage.toggleTodo('buy milk');
    await todoPage.expectActiveCount(2);

    await todoPage.toggleTodo('walk the dog');
    await todoPage.expectActiveCount(1);

    await todoPage.toggleTodo('write tests');
    await todoPage.expectActiveCount(0);
  });

  test('completes every todo with mark-all', async ({ todoPage }) => {
    await todoPage.toggleAll();

    await expect(todoPage.items.getByRole('checkbox', { name: 'Toggle Todo' })).toHaveCount(3);
    for (const title of ['buy milk', 'walk the dog', 'write tests']) {
      await todoPage.expectCompleted(title, true);
    }
    await todoPage.expectActiveCount(0);
    await expect(todoPage.toggleAllCheckbox).toBeChecked();
  });

  test('reactivates every todo when mark-all is unchecked', async ({ todoPage }) => {
    await todoPage.toggleAll();
    await todoPage.toggleAll();

    for (const title of ['buy milk', 'walk the dog', 'write tests']) {
      await todoPage.expectCompleted(title, false);
    }
    await todoPage.expectActiveCount(3);
    await expect(todoPage.toggleAllCheckbox).not.toBeChecked();
  });

  test('mark-all checks itself once every todo is completed individually', async ({ todoPage }) => {
    await expect(todoPage.toggleAllCheckbox).not.toBeChecked();

    await todoPage.toggleTodo('buy milk');
    await todoPage.toggleTodo('walk the dog');
    await expect(todoPage.toggleAllCheckbox).not.toBeChecked();

    await todoPage.toggleTodo('write tests');
    await expect(todoPage.toggleAllCheckbox).toBeChecked();
  });

  test('mark-all unchecks itself as soon as one todo is reactivated', async ({ todoPage }) => {
    await todoPage.toggleAll();
    await expect(todoPage.toggleAllCheckbox).toBeChecked();

    await todoPage.toggleTodo('walk the dog');

    await expect(todoPage.toggleAllCheckbox).not.toBeChecked();
    await todoPage.expectActiveCount(1);
  });

  test('offers Clear completed only while something is completed', async ({ todoPage }) => {
    await expect(todoPage.clearCompletedButton).toBeHidden();

    await todoPage.toggleTodo('buy milk');
    await expect(todoPage.clearCompletedButton).toBeVisible();

    await todoPage.toggleTodo('buy milk');
    await expect(todoPage.clearCompletedButton).toBeHidden();
  });

  test('Clear completed removes only the completed todos', async ({ todoPage }) => {
    await todoPage.toggleTodo('buy milk');
    await todoPage.toggleTodo('write tests');

    await todoPage.clearCompleted();

    await todoPage.expectVisibleTodos(['walk the dog']);
    await todoPage.expectActiveCount(1);
    await expect(todoPage.clearCompletedButton).toBeHidden();
    expect(await todoPage.readStoredTodos()).toEqual([
      expect.objectContaining({ title: 'walk the dog', completed: false }),
    ]);
  });

  test('persists the completed flag for each todo', async ({ todoPage }) => {
    await todoPage.toggleTodo('walk the dog');

    expect(await todoPage.readStoredTodos()).toEqual([
      expect.objectContaining({ title: 'buy milk', completed: false }),
      expect.objectContaining({ title: 'walk the dog', completed: true }),
      expect.objectContaining({ title: 'write tests', completed: false }),
    ]);
  });
});
