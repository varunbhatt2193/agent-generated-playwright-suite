import { expect, test } from '@playwright/test';
import { openApp, TodoApp } from './todo-app';

test.describe('editing todos', () => {
  let app: TodoApp;

  test.beforeEach(async ({ page }) => {
    app = await openApp(page);
    await app.add('one', 'two', 'three');
  });

  test('a double click opens the editor prefilled and focused', async () => {
    const editBox = await app.startEditing('two');

    await expect(app.item('two')).toHaveClass(/editing/);
    await expect(editBox).toHaveValue('two');
    await expect(editBox).toBeFocused();
  });

  test('a single click does not open the editor', async () => {
    await app.item('two').getByTestId('todo-title').click();
    await expect(app.item('two')).not.toHaveClass(/editing/);
  });

  test('Enter saves the new title and closes the editor', async () => {
    await app.editTo('two', 'two edited');

    await expect(app.titles).toHaveText(['one', 'two edited', 'three']);
    await expect(app.item('two edited')).not.toHaveClass(/editing/);
  });

  test('blurring the editor saves the new title', async () => {
    await app.editTo('two', 'two blurred', 'blur');

    await expect(app.titles).toHaveText(['one', 'two blurred', 'three']);
    await expect(app.item('two blurred')).not.toHaveClass(/editing/);
  });

  test('Escape discards the change and closes the editor', async () => {
    await app.editTo('two', 'discard me', 'Escape');

    await expect(app.titles).toHaveText(['one', 'two', 'three']);
    await expect(app.item('two')).not.toHaveClass(/editing/);
  });

  test('a todo can be edited again after an escaped edit', async () => {
    await app.editTo('two', 'discard me', 'Escape');
    await app.editTo('two', 'second attempt');

    await expect(app.titles).toHaveText(['one', 'second attempt', 'three']);
  });

  test('trims whitespace around the edited title', async () => {
    await app.editTo('two', '   trimmed   ');

    await expect(app.titles).toHaveText(['one', 'trimmed', 'three']);
  });

  test('saving an empty title deletes the todo', async () => {
    await app.editTo('two', '');

    await expect(app.titles).toHaveText(['one', 'three']);
    await expect(app.todoCount).toHaveText('2 items left');
  });

  test('saving a whitespace-only title deletes the todo', async () => {
    await app.editTo('two', '    ');

    await expect(app.titles).toHaveText(['one', 'three']);
  });

  test('blurring an emptied editor deletes the todo', async () => {
    await app.editTo('two', '', 'blur');

    await expect(app.titles).toHaveText(['one', 'three']);
  });

  test('editing a completed todo keeps it completed', async () => {
    await app.toggle('two');
    await app.editTo('two', 'two done and renamed');

    await expect(app.item('two done and renamed')).toHaveClass(/completed/);
    await expect(app.toggleOf('two done and renamed')).toBeChecked();
    await expect(app.todoCount).toHaveText('2 items left');
  });

  test('an unchanged title survives a save', async () => {
    const editBox = await app.startEditing('two');
    await editBox.press('Enter');

    await expect(app.titles).toHaveText(['one', 'two', 'three']);
  });

  test('editing does not disturb the other todos', async () => {
    await app.editTo('one', 'renamed');

    await expect(app.item('two')).toHaveCount(1);
    await expect(app.item('three')).toHaveCount(1);
    await expect(app.todoCount).toHaveText('3 items left');
  });
});
