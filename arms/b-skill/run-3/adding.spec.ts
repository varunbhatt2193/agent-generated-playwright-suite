import { test, expect } from './fixtures';

test.describe('adding todos', () => {
  test('adds a todo and shows it in the list', async ({ todoPage }) => {
    await todoPage.addTodo('buy milk');

    await todoPage.expectVisibleTodos(['buy milk']);
    await todoPage.expectActiveCount(1);
    await todoPage.expectCompleted('buy milk', false);
  });

  test('clears the input after a successful add', async ({ todoPage }) => {
    await todoPage.addTodo('buy milk');

    await expect(todoPage.newTodoInput).toHaveValue('');
  });

  test('appends each new todo to the end of the list', async ({ todoPage }) => {
    await todoPage.addTodos('first', 'second', 'third');

    await todoPage.expectVisibleTodos(['first', 'second', 'third']);
    await todoPage.expectActiveCount(3);
  });

  test('ignores a submission with no text', async ({ todoPage }) => {
    await todoPage.submitNewTodo('');

    await expect(todoPage.items).toHaveCount(0);
    await todoPage.expectListChromeVisible(false);
  });

  test('ignores a whitespace-only submission and keeps the typed text', async ({ todoPage }) => {
    await todoPage.submitNewTodo('   ');

    await expect(todoPage.items).toHaveCount(0);
    // The app rejects the value but does not clear the field, so the user keeps what they typed.
    await expect(todoPage.newTodoInput).toHaveValue('   ');
  });

  test('trims surrounding whitespace from a new todo', async ({ todoPage }) => {
    await todoPage.addTodo('   padded item   ');

    await todoPage.expectVisibleTodos(['padded item']);
    expect(await todoPage.readStoredTodos()).toEqual([
      expect.objectContaining({ title: 'padded item', completed: false }),
    ]);
  });

  test('allows two todos with the same title', async ({ todoPage }) => {
    await todoPage.addTodos('duplicate', 'duplicate');

    await todoPage.expectVisibleTodos(['duplicate', 'duplicate']);
    await todoPage.expectActiveCount(2);
  });

  test('renders markup-like text as plain text', async ({ todoPage }) => {
    const title = '<b>bold</b> & "quoted" — 5 < 6';
    await todoPage.addTodo(title);

    await todoPage.expectVisibleTodos([title]);
    await expect(todoPage.titles.locator('b')).toHaveCount(0);
  });

  test('accepts a very long title', async ({ todoPage }) => {
    const title = 'x'.repeat(300);
    await todoPage.addTodo(title);

    await todoPage.expectVisibleTodos([title]);
    await todoPage.expectActiveCount(1);
  });

  test('reveals the list chrome once the first todo is added', async ({ todoPage }) => {
    await todoPage.expectListChromeVisible(false);

    await todoPage.addTodo('buy milk');

    await todoPage.expectListChromeVisible(true);
  });
});
