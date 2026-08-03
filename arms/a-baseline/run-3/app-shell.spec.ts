import { expect, test } from './todo-app';

test.describe('page chrome and accessibility', () => {
  test('shows the header, hint and credits on an empty list', async ({ todo, page }) => {
    await expect(page.getByRole('heading', { level: 1, name: 'todos' })).toBeVisible();
    await expect(todo.newTodo).toHaveAttribute('placeholder', 'What needs to be done?');
    await expect(page.getByText('Double-click to edit a todo')).toBeVisible();
    await expect(page.getByRole('link', { name: 'Remo H. Jansen' })).toHaveAttribute(
      'href',
      'http://github.com/remojansen/',
    );
    await expect(page.getByRole('link', { name: 'TodoMVC', exact: true })).toHaveAttribute(
      'href',
      'http://todomvc.com',
    );
    await expect(page.getByRole('link', { name: 'real TodoMVC app.' })).toHaveAttribute(
      'href',
      'https://todomvc.com/',
    );
  });

  test('reveals the list section and footer once a todo exists, and hides them again', async ({
    todo,
  }) => {
    await expect(todo.toggleAll).toBeHidden();
    await expect(todo.counter).toBeHidden();

    await todo.add('one');

    await expect(todo.toggleAll).toBeVisible();
    await expect(todo.counter).toBeVisible();
    await expect(todo.filterAll).toBeVisible();
    await expect(todo.filterActive).toBeVisible();
    await expect(todo.filterCompleted).toBeVisible();

    await todo.remove(0);

    await expect(todo.toggleAll).toBeHidden();
    await expect(todo.counter).toBeHidden();
    await expect(todo.filterAll).toBeHidden();
  });

  test('exposes accessible names for the item controls', async ({ todo, page }) => {
    await todo.add('one');
    const item = todo.item(0);

    await expect(item.getByRole('checkbox', { name: 'Toggle Todo' })).toBeVisible();
    await expect(todo.toggleAll).toBeVisible();

    // The delete button and the edit box are only in the accessibility tree while they are
    // shown, i.e. on hover and while editing respectively.
    await expect(item.getByRole('button', { name: 'Delete' })).toHaveCount(0);
    await item.hover();
    await expect(item.getByRole('button', { name: 'Delete' })).toBeVisible();

    await expect(item.getByRole('textbox', { name: 'Edit' })).toHaveCount(0);
    await todo.startEditing(0);
    await expect(item.getByRole('textbox', { name: 'Edit' })).toBeVisible();
    await page.keyboard.press('Escape');
  });

  test('keeps the new-todo input focused for consecutive entries', async ({ todo }) => {
    await expect(todo.newTodo).toBeFocused();

    await todo.add('one');
    await expect(todo.newTodo).toBeFocused();

    await todo.add('two');
    await expect(todo.newTodo).toBeFocused();
  });

  test('handles a long title without losing it', async ({ todo }) => {
    const long = 'l'.repeat(300);
    await todo.add(long);

    await expect(todo.titles).toHaveText([long]);
    await todo.expectStored([{ title: long, completed: false }]);
  });
});
