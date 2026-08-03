import { test, expect } from './fixtures';

test.describe('editing todos', () => {
  test.beforeEach(async ({ todoPage }) => {
    await todoPage.seed([{ title: 'buy milk' }, { title: 'walk the dog' }]);
  });

  test('opens an edit box prefilled and focused on double click', async ({ todoPage }) => {
    await todoPage.startEditing('buy milk');

    const editInput = todoPage.editInputFor('buy milk');
    await expect(editInput).toBeVisible();
    await expect(editInput).toHaveValue('buy milk');
    await expect(editInput).toBeFocused();
    await expect(todoPage.item('buy milk')).toHaveClass('editing');
  });

  test('does not expose an edit box until editing starts', async ({ todoPage }) => {
    await expect(todoPage.editInputFor('buy milk')).toBeHidden();
  });

  test('saves the new title on Enter', async ({ todoPage }) => {
    await todoPage.editTodo('buy milk', 'buy oat milk');

    await todoPage.expectVisibleTitles(['buy oat milk', 'walk the dog']);
    await expect(todoPage.item('buy oat milk')).toHaveClass('');
    expect(await todoPage.storedTodos()).toMatchObject([
      { title: 'buy oat milk' },
      { title: 'walk the dog' },
    ]);
  });

  test('saves the new title when the edit box loses focus', async ({ todoPage }) => {
    await todoPage.editTodo('buy milk', 'buy oat milk', 'blur');

    await todoPage.expectVisibleTitles(['buy oat milk', 'walk the dog']);
  });

  test('trims whitespace around an edited title', async ({ todoPage }) => {
    await todoPage.editTodo('buy milk', '   buy oat milk   ');

    await todoPage.expectVisibleTitles(['buy oat milk', 'walk the dog']);
  });

  test('discards the change on Escape', async ({ todoPage }) => {
    await todoPage.cancelEditing('buy milk', 'something else entirely');

    await todoPage.expectVisibleTitles(['buy milk', 'walk the dog']);
    await expect(todoPage.item('buy milk')).toHaveClass('');
    await expect(todoPage.editInputFor('buy milk')).toBeHidden();
  });

  test('can be edited again after a cancelled edit', async ({ todoPage }) => {
    await todoPage.cancelEditing('buy milk', 'discarded');

    await todoPage.editTodo('buy milk', 'buy oat milk');

    await todoPage.expectVisibleTitles(['buy oat milk', 'walk the dog']);
  });

  test('deletes the todo when the title is cleared and saved', async ({ todoPage }) => {
    await todoPage.editTodo('buy milk', '');

    await todoPage.expectVisibleTitles(['walk the dog']);
    await expect(todoPage.counter).toHaveText('1 item left');
  });

  test('deletes the todo when the title is edited to whitespace only', async ({ todoPage }) => {
    await todoPage.editTodo('buy milk', '     ');

    await todoPage.expectVisibleTitles(['walk the dog']);
    expect(await todoPage.storedTodos()).toMatchObject([{ title: 'walk the dog' }]);
  });

  test('keeps a todo completed across an edit', async ({ todoPage }) => {
    await todoPage.toggle('buy milk');
    await expect(todoPage.counter).toHaveText('1 item left');

    await todoPage.editTodo('buy milk', 'buy oat milk');

    await expect(todoPage.item('buy oat milk')).toHaveClass('completed');
    await expect(todoPage.toggleFor('buy oat milk')).toBeChecked();
    await expect(todoPage.counter).toHaveText('1 item left');
  });

  test('leaves the other todos untouched', async ({ todoPage }) => {
    await todoPage.editTodo('walk the dog', 'walk the cat');

    await todoPage.expectVisibleTitles(['buy milk', 'walk the cat']);
    await expect(todoPage.counter).toHaveText('2 items left');
  });

  test('escapes markup typed into an edit', async ({ todoPage }) => {
    await todoPage.editTodo('buy milk', '<b>bold</b>');

    await todoPage.expectVisibleTitles(['<b>bold</b>', 'walk the dog']);
    await expect(todoPage.page.locator('.todo-list b')).toHaveCount(0);
  });

  test('edits a todo down to a single character', async ({ todoPage }) => {
    await todoPage.editTodo('buy milk', 'x');

    await todoPage.expectVisibleTitles(['x', 'walk the dog']);
  });
});
