import { test, expect } from './fixtures';

test.describe('editing todos', () => {
  test.beforeEach(async ({ todoPage }) => {
    await todoPage.addTodos('buy milk', 'walk the dog', 'write tests');
  });

  test('double-click opens an editor prefilled with the current title', async ({ todoPage }) => {
    const editor = await todoPage.startEditing('walk the dog');

    await expect(editor).toHaveValue('walk the dog');
    await expect(editor).toBeFocused();
    // The read-only title is swapped out for the editor while editing.
    await expect(todoPage.todo('walk the dog').getByTestId('todo-title')).toBeHidden();
  });

  test('saves the new title on Enter', async ({ todoPage }) => {
    await todoPage.editTodo('walk the dog', 'walk the cat');

    await todoPage.expectVisibleTodos(['buy milk', 'walk the cat', 'write tests']);
    await expect(todoPage.editorFor('walk the cat')).toBeHidden();
  });

  test('saves the new title when the editor loses focus', async ({ todoPage }) => {
    await todoPage.editTodo('walk the dog', 'walk the cat', 'blur');

    await todoPage.expectVisibleTodos(['buy milk', 'walk the cat', 'write tests']);
  });

  test('discards the change on Escape', async ({ todoPage }) => {
    await todoPage.editTodo('walk the dog', 'never saved', 'escape');

    await todoPage.expectVisibleTodos(['buy milk', 'walk the dog', 'write tests']);
    await expect(todoPage.editorFor('walk the dog')).toBeHidden();
  });

  test('trims surrounding whitespace from the edited title', async ({ todoPage }) => {
    await todoPage.editTodo('walk the dog', '   walk the cat   ');

    await todoPage.expectVisibleTodos(['buy milk', 'walk the cat', 'write tests']);
    expect(await todoPage.readStoredTodos()).toEqual([
      expect.objectContaining({ title: 'buy milk' }),
      expect.objectContaining({ title: 'walk the cat' }),
      expect.objectContaining({ title: 'write tests' }),
    ]);
  });

  test('deletes the todo when the title is cleared', async ({ todoPage }) => {
    await todoPage.editTodo('walk the dog', '');

    await todoPage.expectVisibleTodos(['buy milk', 'write tests']);
    await todoPage.expectActiveCount(2);
  });

  test('deletes the todo when the title is edited to whitespace only', async ({ todoPage }) => {
    await todoPage.editTodo('walk the dog', '    ');

    await todoPage.expectVisibleTodos(['buy milk', 'write tests']);
    await todoPage.expectActiveCount(2);
  });

  test('keeps the completed state of an edited todo', async ({ todoPage }) => {
    await todoPage.toggleTodo('walk the dog');

    await todoPage.editTodo('walk the dog', 'walk the cat');

    await todoPage.expectCompleted('walk the cat', true);
    await todoPage.expectActiveCount(2);
  });

  test('keeps the todo in its original position', async ({ todoPage }) => {
    await todoPage.editTodo('buy milk', 'buy oat milk');

    await todoPage.expectVisibleTodos(['buy oat milk', 'walk the dog', 'write tests']);
  });

  test('renders an edited title containing markup as plain text', async ({ todoPage }) => {
    await todoPage.editTodo('walk the dog', '<i>walk</i> the dog');

    await todoPage.expectVisibleTodos(['buy milk', '<i>walk</i> the dog', 'write tests']);
    await expect(todoPage.titles.locator('i')).toHaveCount(0);
  });

  test('edits only the todo that was double-clicked', async ({ todoPage }) => {
    await todoPage.startEditing('walk the dog');

    await expect(todoPage.editorFor('walk the dog')).toBeVisible();
    await expect(todoPage.editorFor('buy milk')).toBeHidden();
    await expect(todoPage.editorFor('write tests')).toBeHidden();
  });
});
