import { test, expect } from './fixtures';

test.describe('editing todos', () => {
  test('opens an editor pre-filled with the current title on double-click', async ({ todoPage }) => {
    await todoPage.addTodo('buy milk');
    await expect(todoPage.editorFor('buy milk')).toBeHidden();

    const editor = await todoPage.startEditing('buy milk');

    await expect(editor).toHaveValue('buy milk');
    await expect(editor).toBeFocused();
    await expect(todoPage.item('buy milk').getByTestId('todo-title')).toBeHidden();
  });

  test('a single click does not start editing', async ({ todoPage }) => {
    await todoPage.addTodo('buy milk');

    await todoPage.item('buy milk').getByTestId('todo-title').click();

    await expect(todoPage.editorFor('buy milk')).toBeHidden();
    await expect(todoPage.item('buy milk').getByTestId('todo-title')).toBeVisible();
  });

  test('saves the new title on Enter', async ({ todoPage }) => {
    await todoPage.addTodos('buy milk', 'walk the dog');

    await todoPage.editTodo('buy milk', 'buy oat milk');

    await todoPage.expectVisibleTodos(['buy oat milk', 'walk the dog']);
    await expect(todoPage.editorFor('buy oat milk')).toBeHidden();
    await expect
      .poll(async () => (await todoPage.storedTodos())?.map((todo) => todo.title))
      .toEqual(['buy oat milk', 'walk the dog']);
  });

  test('saves the new title when focus leaves the editor', async ({ todoPage }) => {
    await todoPage.addTodos('buy milk', 'walk the dog');

    await todoPage.editTodo('buy milk', 'buy oat milk', 'blur');

    await todoPage.expectVisibleTodos(['buy oat milk', 'walk the dog']);
  });

  test('discards the change on Escape', async ({ todoPage }) => {
    await todoPage.addTodo('buy milk');

    const editor = await todoPage.startEditing('buy milk');
    await editor.fill('something else entirely');
    await editor.press('Escape');

    await todoPage.expectVisibleTodos(['buy milk']);
    await expect(todoPage.editorFor('buy milk')).toBeHidden();
  });

  test('reopens the editor with the original title after Escape', async ({ todoPage }) => {
    await todoPage.addTodo('buy milk');

    const editor = await todoPage.startEditing('buy milk');
    await editor.fill('something else entirely');
    await editor.press('Escape');

    const reopened = await todoPage.startEditing('buy milk');
    await expect(reopened).toHaveValue('buy milk');
  });

  test('trims surrounding whitespace from the edited title', async ({ todoPage }) => {
    await todoPage.addTodo('buy milk');

    await todoPage.editTodo('buy milk', '   buy oat milk   ');

    await todoPage.expectVisibleTodos(['buy oat milk']);
    await expect
      .poll(async () => (await todoPage.storedTodos())?.map((todo) => todo.title))
      .toEqual(['buy oat milk']);
  });

  test('deletes the todo when the title is cleared and saved', async ({ todoPage }) => {
    await todoPage.addTodos('buy milk', 'walk the dog');

    await todoPage.editTodo('buy milk', '');

    await todoPage.expectVisibleTodos(['walk the dog']);
    await todoPage.expectCounter('1 item left');
  });

  test('deletes the todo when the title is edited to whitespace only', async ({ todoPage }) => {
    await todoPage.addTodos('buy milk', 'walk the dog');

    await todoPage.editTodo('buy milk', '    ');

    await todoPage.expectVisibleTodos(['walk the dog']);
  });

  test('deleting the only todo by clearing its title empties the list', async ({ todoPage }) => {
    await todoPage.addTodo('buy milk');

    await todoPage.editTodo('buy milk', '   ');

    await todoPage.expectEmptyState();
  });

  test('keeps a completed todo complete after an edit', async ({ todoPage }) => {
    await todoPage.seed([
      { title: 'buy milk', completed: true },
      { title: 'walk the dog', completed: false },
    ]);

    await todoPage.editTodo('buy milk', 'buy oat milk');

    await todoPage.expectVisibleTodos(['buy oat milk', 'walk the dog']);
    await todoPage.expectCompletion([{ title: 'buy oat milk', completed: true }]);
    await todoPage.expectCounter('1 item left');
  });

  test('keeps the todo in place in the list', async ({ todoPage }) => {
    await todoPage.addTodos('alpha', 'beta', 'gamma');

    await todoPage.editTodo('beta', 'beta renamed');

    await todoPage.expectVisibleTodos(['alpha', 'beta renamed', 'gamma']);
  });

  test('escapes markup typed into the editor', async ({ todoPage }) => {
    await todoPage.addTodo('buy milk');

    await todoPage.editTodo('buy milk', '<i>italic</i>');

    await todoPage.expectVisibleTodos(['<i>italic</i>']);
    await expect(todoPage.page.locator('.todo-list i')).toHaveCount(0);
  });

  test('edits a todo while a filter is active and keeps it in view', async ({ todoPage }) => {
    await todoPage.seed(
      [
        { title: 'alpha', completed: false },
        { title: 'beta', completed: true },
      ],
      'active',
    );

    await todoPage.editTodo('alpha', 'alpha renamed');

    await todoPage.expectVisibleTodos(['alpha renamed']);
    await todoPage.selectFilter('All');
    await todoPage.expectVisibleTodos(['alpha renamed', 'beta']);
  });
});
