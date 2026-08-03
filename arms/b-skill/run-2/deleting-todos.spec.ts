import { test, expect } from './fixtures';

test.describe('deleting todos', () => {
  test.beforeEach(async ({ todoPage }) => {
    await todoPage.seed([{ title: 'buy milk' }, { title: 'walk the dog' }, { title: 'write tests' }]);
  });

  test('hides the delete button until its row is hovered', async ({ todoPage }) => {
    await expect(todoPage.deleteButtonFor('buy milk')).toBeHidden();

    await todoPage.item('buy milk').hover();

    await expect(todoPage.deleteButtonFor('buy milk')).toBeVisible();
  });

  test('removes the todo and updates the counter', async ({ todoPage }) => {
    await todoPage.remove('walk the dog');

    await todoPage.expectVisibleTitles(['buy milk', 'write tests']);
    await expect(todoPage.counter).toHaveText('2 items left');
    expect(await todoPage.storedTodos()).toMatchObject([{ title: 'buy milk' }, { title: 'write tests' }]);
  });

  test('preserves the order of the remaining todos', async ({ todoPage }) => {
    await todoPage.remove('buy milk');

    await todoPage.expectVisibleTitles(['walk the dog', 'write tests']);
  });

  test('does not change the count of items left when a completed todo is deleted', async ({ todoPage }) => {
    await todoPage.toggle('buy milk');
    await expect(todoPage.counter).toHaveText('2 items left');

    await todoPage.remove('buy milk');

    await todoPage.expectVisibleTitles(['walk the dog', 'write tests']);
    await expect(todoPage.counter).toHaveText('2 items left');
    await expect(todoPage.clearCompletedButton).toBeHidden();
  });

  test('deletes one of two duplicate titles and leaves the other', async ({ todoPage }) => {
    await todoPage.seed([{ title: 'buy milk' }, { title: 'buy milk' }]);

    // Position is the only thing that distinguishes duplicates, so it is the subject here.
    const first = todoPage.items.first();
    await first.hover();
    await first.getByRole('button', { name: 'Delete' }).click();

    await todoPage.expectVisibleTitles(['buy milk']);
    await expect(todoPage.counter).toHaveText('1 item left');
  });

  test('returns to the empty state when the last todo is deleted', async ({ todoPage }) => {
    await todoPage.seed([{ title: 'buy milk' }]);

    await todoPage.remove('buy milk');

    await todoPage.expectEmptyState();
    expect(await todoPage.storedTodos()).toEqual([]);
  });

  test('empties the list when every todo is deleted one by one', async ({ todoPage }) => {
    for (const title of ['write tests', 'buy milk', 'walk the dog']) {
      await todoPage.remove(title);
    }

    await todoPage.expectEmptyState();
  });
});
