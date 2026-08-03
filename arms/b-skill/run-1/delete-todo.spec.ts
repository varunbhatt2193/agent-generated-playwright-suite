import { test, expect } from './fixtures';

test.describe('deleting todos', () => {
  test('reveals the delete button only while the row is hovered', async ({ todoPage }) => {
    await todoPage.addTodos('buy milk', 'walk the dog');
    const deleteButton = todoPage.item('buy milk').getByRole('button', { name: 'Delete' });

    await expect(deleteButton).toBeHidden();

    await todoPage.item('buy milk').hover();
    await expect(deleteButton).toBeVisible();

    await todoPage.item('walk the dog').hover();
    await expect(deleteButton).toBeHidden();
  });

  test('deletes the chosen todo and leaves the rest', async ({ todoPage }) => {
    await todoPage.addTodos('alpha', 'beta', 'gamma');

    await todoPage.deleteTodo('beta');

    await todoPage.expectVisibleTodos(['alpha', 'gamma']);
    await todoPage.expectCounter('2 items left');
    await expect
      .poll(async () => (await todoPage.storedTodos())?.map((todo) => todo.title))
      .toEqual(['alpha', 'gamma']);
  });

  test('deletes only the clicked one of two identically titled todos', async ({ todoPage }) => {
    await todoPage.addTodos('buy milk', 'buy milk');

    // Position is the only thing that distinguishes duplicates, so it is what the
    // test addresses here.
    const first = todoPage.items.nth(0);
    await first.hover();
    await first.getByRole('button', { name: 'Delete' }).click();

    await todoPage.expectVisibleTodos(['buy milk']);
    await todoPage.expectCounter('1 item left');
  });

  test('deletes a completed todo and leaves the counter alone', async ({ todoPage }) => {
    await todoPage.seed([
      { title: 'alpha', completed: true },
      { title: 'beta', completed: false },
    ]);

    await todoPage.deleteTodo('alpha');

    await todoPage.expectVisibleTodos(['beta']);
    await todoPage.expectCounter('1 item left');
    await expect(todoPage.clearCompleted).toBeHidden();
  });

  test('returns to the empty state when the last todo is deleted', async ({ todoPage }) => {
    await todoPage.addTodo('buy milk');

    await todoPage.deleteTodo('buy milk');

    await todoPage.expectEmptyState();
    await expect.poll(async () => await todoPage.storedTodos()).toEqual([]);
  });
});

test.describe('clearing completed todos', () => {
  test('hides the button until something is completed', async ({ todoPage }) => {
    await todoPage.addTodos('buy milk', 'walk the dog');
    await expect(todoPage.clearCompleted).toBeHidden();

    await todoPage.toggle('buy milk');
    await expect(todoPage.clearCompleted).toBeVisible();

    await todoPage.toggle('buy milk');
    await expect(todoPage.clearCompleted).toBeHidden();
  });

  test('removes every completed todo and keeps the active ones', async ({ todoPage }) => {
    await todoPage.seed([
      { title: 'alpha', completed: true },
      { title: 'beta', completed: false },
      { title: 'gamma', completed: true },
    ]);

    await todoPage.clearCompleted.click();

    await todoPage.expectVisibleTodos(['beta']);
    await todoPage.expectCounter('1 item left');
    await expect(todoPage.clearCompleted).toBeHidden();
  });

  test('empties the list when every todo is completed', async ({ todoPage }) => {
    await todoPage.seed([
      { title: 'alpha', completed: true },
      { title: 'beta', completed: true },
    ]);

    await todoPage.clearCompleted.click();

    await todoPage.expectEmptyState();
  });

  test('empties the Completed view it was pressed from', async ({ todoPage }) => {
    await todoPage.seed(
      [
        { title: 'alpha', completed: true },
        { title: 'beta', completed: true },
      ],
      'completed',
    );

    await todoPage.clearCompleted.click();

    await todoPage.expectEmptyState();
    await expect(todoPage.page).toHaveURL(/#\/completed$/);
    await expect.poll(async () => await todoPage.storedTodos()).toEqual([]);
  });

  test('clears completed todos hidden by the Active filter', async ({ todoPage }) => {
    await todoPage.seed(
      [
        { title: 'alpha', completed: true },
        { title: 'beta', completed: false },
      ],
      'active',
    );
    await todoPage.expectVisibleTodos(['beta']);

    await todoPage.clearCompleted.click();

    await todoPage.expectVisibleTodos(['beta']);
    await todoPage.selectFilter('All');
    await todoPage.expectVisibleTodos(['beta']);
  });
});
