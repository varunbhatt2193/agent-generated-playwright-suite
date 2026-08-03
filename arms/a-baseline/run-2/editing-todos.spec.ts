import { expect, test } from '@playwright/test';
import { TodoApp } from './helpers/todo-app';

test.describe('Editing todos', () => {
  let app: TodoApp;

  test.beforeEach(async ({ page }) => {
    app = new TodoApp(page);
    await app.goto();
    await app.add('one', 'two');
  });

  test('double-clicking a title opens a prefilled, focused edit box', async () => {
    const editBox = await app.startEditing('one');

    await expect(app.item('one')).toHaveClass(/editing/);
    await expect(editBox).toHaveValue('one');
    await expect(editBox).toBeVisible();
  });

  test('a single click does not start editing', async () => {
    await app.item('one').getByTestId('todo-title').click();

    await expect(app.item('one')).not.toHaveClass(/editing/);
    await expect(app.editBoxOf('one')).toBeHidden();
    await expect(app.toggleOf('one')).not.toBeChecked();
  });

  test('Enter saves the new title and leaves edit mode', async () => {
    await app.edit('one', 'one edited');

    await app.expectTitles(['one edited', 'two']);
    await expect(app.item('one edited')).not.toHaveClass(/editing/);
    await expect(app.editBoxOf('one edited')).toBeHidden();
  });

  test('saving trims surrounding whitespace', async () => {
    await app.edit('one', '   spaced out   ');

    await app.expectTitles(['spaced out', 'two']);
  });

  test('Escape cancels the edit and restores the original title', async () => {
    const editBox = await app.startEditing('one');
    await editBox.fill('discard me');
    await editBox.press('Escape');

    await app.expectTitles(['one', 'two']);
    await expect(app.item('one')).not.toHaveClass(/editing/);
  });

  test('blurring the edit box saves the change', async () => {
    const editBox = await app.startEditing('two');
    await editBox.fill('saved on blur');
    await app.newTodo.click();

    await app.expectTitles(['one', 'saved on blur']);
    await expect(app.item('saved on blur')).not.toHaveClass(/editing/);
  });

  test('clearing the title and pressing Enter deletes the todo', async () => {
    const editBox = await app.startEditing('one');
    await editBox.fill('');
    await editBox.press('Enter');

    await app.expectTitles(['two']);
    await expect(app.counter).toHaveText('1 item left');
  });

  test('a whitespace-only title deletes the todo', async () => {
    const editBox = await app.startEditing('one');
    await editBox.fill('    ');
    await editBox.press('Enter');

    await app.expectTitles(['two']);
  });

  test('editing a completed todo keeps it completed', async () => {
    await app.toggleOf('two').check();
    await app.edit('two', 'two edited');

    await app.expectTitles(['one', 'two edited']);
    await expect(app.toggleOf('two edited')).toBeChecked();
    await expect(app.item('two edited')).toHaveClass(/completed/);
    await expect(app.counter).toHaveText('1 item left');
  });

  test('only one todo is in edit mode at a time', async ({ page }) => {
    await app.startEditing('one');
    await app.startEditing('two');

    await expect(page.locator('li.editing')).toHaveCount(1);
    await expect(app.item('two')).toHaveClass(/editing/);
  });

  test('an edit survives a reload', async ({ page }) => {
    await app.edit('one', 'persisted edit');
    await page.reload();

    await app.expectTitles(['persisted edit', 'two']);
  });
});
