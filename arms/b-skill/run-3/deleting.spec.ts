import { test, expect } from './fixtures';

test.describe('deleting todos', () => {
  test.beforeEach(async ({ todoPage }) => {
    await todoPage.addTodos('buy milk', 'walk the dog', 'write tests');
  });

  test('reveals the delete button only while its row is hovered', async ({ todoPage }) => {
    await expect(todoPage.deleteButtonFor('walk the dog')).toBeHidden();

    await todoPage.todo('walk the dog').hover();

    await expect(todoPage.deleteButtonFor('walk the dog')).toBeVisible();
    await expect(todoPage.deleteButtonFor('buy milk')).toBeHidden();
  });

  test('removes only the targeted todo', async ({ todoPage }) => {
    await todoPage.deleteTodo('walk the dog');

    await todoPage.expectVisibleTodos(['buy milk', 'write tests']);
    await todoPage.expectActiveCount(2);
    expect(await todoPage.readStoredTodos()).toEqual([
      expect.objectContaining({ title: 'buy milk' }),
      expect.objectContaining({ title: 'write tests' }),
    ]);
  });

  test('removes a completed todo and leaves the active count alone', async ({ todoPage }) => {
    await todoPage.toggleTodo('walk the dog');
    await todoPage.expectActiveCount(2);

    await todoPage.deleteTodo('walk the dog');

    await todoPage.expectVisibleTodos(['buy milk', 'write tests']);
    await todoPage.expectActiveCount(2);
    await expect(todoPage.clearCompletedButton).toBeHidden();
  });

  test('deletes every todo one at a time', async ({ todoPage }) => {
    await todoPage.deleteTodo('buy milk');
    await todoPage.deleteTodo('write tests');
    await todoPage.expectVisibleTodos(['walk the dog']);

    await todoPage.deleteTodo('walk the dog');

    await expect(todoPage.items).toHaveCount(0);
    await todoPage.expectListChromeVisible(false);
  });

  test('deletes the first of two identically titled todos', async ({ todoPage }) => {
    await todoPage.addTodos('duplicate', 'duplicate');

    // Position is what is under test here: the two rows are indistinguishable by content.
    await todoPage.items.nth(3).hover();
    await todoPage.items.nth(3).getByRole('button', { name: 'Delete' }).click();

    await todoPage.expectVisibleTodos(['buy milk', 'walk the dog', 'write tests', 'duplicate']);
  });
});
