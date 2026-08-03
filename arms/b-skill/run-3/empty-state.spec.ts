import { test, expect } from './fixtures';

test.describe('empty state', () => {
  test('starts with no todos and no list chrome', async ({ todoPage }) => {
    await expect(todoPage.heading).toBeVisible();
    await expect(todoPage.newTodoInput).toBeVisible();
    await expect(todoPage.items).toHaveCount(0);
    await todoPage.expectListChromeVisible(false);
    await expect(todoPage.clearCompletedButton).toBeHidden();
  });

  test('focuses the new-todo field on load', async ({ todoPage }) => {
    await expect(todoPage.newTodoInput).toBeFocused();
  });

  test('shows the editing hint in the page footer', async ({ todoPage }) => {
    await expect(todoPage.infoFooter).toContainText('Double-click to edit a todo');
  });

  test('returns to the empty state after the last todo is deleted', async ({ todoPage }) => {
    await todoPage.addTodo('buy milk');
    await todoPage.deleteTodo('buy milk');

    await expect(todoPage.items).toHaveCount(0);
    await todoPage.expectListChromeVisible(false);
    expect(await todoPage.readStoredTodos()).toEqual([]);
  });

  test('returns to the empty state after the last todo is cleared', async ({ todoPage }) => {
    await todoPage.addTodo('buy milk');
    await todoPage.toggleTodo('buy milk');
    await todoPage.clearCompleted();

    await expect(todoPage.items).toHaveCount(0);
    await todoPage.expectListChromeVisible(false);
  });
});
