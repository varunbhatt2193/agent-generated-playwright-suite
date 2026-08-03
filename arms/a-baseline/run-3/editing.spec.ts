import { expect, test } from './todo-app';

test.describe('editing todos', () => {
  test.beforeEach(async ({ todo }) => {
    await todo.add('one', 'two', 'three');
  });

  test('double-clicking a title opens an editor seeded with the current title', async ({ todo }) => {
    const editor = await todo.startEditing(1);

    await expect(todo.item(1)).toHaveClass(/editing/);
    await expect(editor).toHaveValue('two');
    // The read-only view (checkbox, label, delete button) is hidden while editing.
    await expect(todo.titleOf(1)).toBeHidden();
    await expect(todo.toggleOf(1)).toBeHidden();
    await expect(todo.item(0)).not.toHaveClass(/editing/);
  });

  test('Enter saves the new title in place', async ({ todo }) => {
    await todo.editAndCommit(1, 'two updated');

    await expect(todo.item(1)).not.toHaveClass(/editing/);
    await expect(todo.titles).toHaveText(['one', 'two updated', 'three']);
    await todo.expectStored([
      { title: 'one', completed: false },
      { title: 'two updated', completed: false },
      { title: 'three', completed: false },
    ]);
  });

  test('blurring the editor also saves the edit', async ({ todo }) => {
    const editor = await todo.startEditing(0);
    await editor.fill('one saved by blur');
    await editor.blur();

    await expect(todo.item(0)).not.toHaveClass(/editing/);
    await expect(todo.titles).toHaveText(['one saved by blur', 'two', 'three']);
    await todo.expectStored([
      { title: 'one saved by blur', completed: false },
      { title: 'two', completed: false },
      { title: 'three', completed: false },
    ]);
  });

  test('Escape cancels the edit and restores the original title', async ({ todo }) => {
    const editor = await todo.startEditing(2);
    await editor.fill('discard me');
    await editor.press('Escape');

    await expect(todo.item(2)).not.toHaveClass(/editing/);
    await expect(todo.titles).toHaveText(['one', 'two', 'three']);
    await todo.expectStored([
      { title: 'one', completed: false },
      { title: 'two', completed: false },
      { title: 'three', completed: false },
    ]);
  });

  test('reopening an editor after Escape shows the original title again', async ({ todo }) => {
    const editor = await todo.startEditing(0);
    await editor.fill('discard me');
    await editor.press('Escape');

    await expect(await todo.startEditing(0)).toHaveValue('one');
  });

  test('saved titles are trimmed', async ({ todo }) => {
    await todo.editAndCommit(0, '    one trimmed    ');

    await expect(todo.titles).toHaveText(['one trimmed', 'two', 'three']);
    await todo.expectStored([
      { title: 'one trimmed', completed: false },
      { title: 'two', completed: false },
      { title: 'three', completed: false },
    ]);
  });

  test('saving an empty title deletes the todo', async ({ todo }) => {
    await todo.editAndCommit(1, '');

    await expect(todo.titles).toHaveText(['one', 'three']);
    await expect(todo.counter).toHaveText('2 items left');
    await todo.expectStored([
      { title: 'one', completed: false },
      { title: 'three', completed: false },
    ]);
  });

  test('saving a whitespace-only title deletes the todo', async ({ todo }) => {
    await todo.editAndCommit(2, '     ');

    await expect(todo.titles).toHaveText(['one', 'two']);
    await expect(todo.counter).toHaveText('2 items left');
  });

  test('blurring an emptied editor deletes the todo', async ({ todo }) => {
    const editor = await todo.startEditing(0);
    await editor.fill('');
    await editor.blur();

    await expect(todo.titles).toHaveText(['two', 'three']);
  });

  test('editing preserves the completed state and list position', async ({ todo }) => {
    await todo.toggle(1);
    await todo.editAndCommit(1, 'two done and renamed');

    await expect(todo.titles).toHaveText(['one', 'two done and renamed', 'three']);
    await expect(todo.item(1)).toHaveClass(/completed/);
    await expect(todo.toggleOf(1)).toBeChecked();
    await expect(todo.counter).toHaveText('2 items left');
    await todo.expectStored([
      { title: 'one', completed: false },
      { title: 'two done and renamed', completed: true },
      { title: 'three', completed: false },
    ]);
  });

  test('only one todo can be edited at a time', async ({ todo }) => {
    await todo.startEditing(0);
    await todo.startEditing(1);

    await expect(todo.item(0)).not.toHaveClass(/editing/);
    await expect(todo.item(1)).toHaveClass(/editing/);
    // Switching rows leaves the first title untouched.
    await expect(todo.titles).toHaveText(['one', 'two', 'three']);
  });

  test('an edit survives a reload', async ({ todo, page }) => {
    await todo.editAndCommit(2, 'three rewritten');
    await page.reload();

    await expect(todo.titles).toHaveText(['one', 'two', 'three rewritten']);
  });

  test('a single click on the title does not start editing', async ({ todo }) => {
    await todo.titleOf(0).click();

    await expect(todo.item(0)).not.toHaveClass(/editing/);
    await expect(todo.titleOf(0)).toBeVisible();
  });
});
