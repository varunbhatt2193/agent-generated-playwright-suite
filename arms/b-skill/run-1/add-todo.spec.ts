import { test, expect } from './fixtures';

test.describe('adding todos', () => {
  test('starts on an empty list with the input focused', async ({ todoPage }) => {
    await todoPage.expectEmptyState();
    await expect(todoPage.newTodoInput).toBeFocused();
    await expect(todoPage.newTodoInput).toHaveValue('');
  });

  test('adds a todo and clears the input, keeping focus for the next one', async ({ todoPage }) => {
    await todoPage.addTodo('buy milk');

    await todoPage.expectVisibleTodos(['buy milk']);
    await expect(todoPage.newTodoInput).toHaveValue('');
    await expect(todoPage.newTodoInput).toBeFocused();
  });

  test('shows the counter, filters and toggle-all once the first todo exists', async ({ todoPage }) => {
    await todoPage.expectEmptyState();

    await todoPage.addTodo('buy milk');

    await expect(todoPage.counter).toBeVisible();
    await todoPage.expectCounter('1 item left');
    await expect(todoPage.toggleAll).toBeVisible();
    await expect(todoPage.filterLink('All')).toBeVisible();
    await expect(todoPage.filterLink('Active')).toBeVisible();
    await expect(todoPage.filterLink('Completed')).toBeVisible();
  });

  test('appends todos in the order they were entered', async ({ todoPage }) => {
    await todoPage.addTodos('buy milk', 'walk the dog', 'write tests');

    await todoPage.expectVisibleTodos(['buy milk', 'walk the dog', 'write tests']);
    await todoPage.expectCounter('3 items left');
  });

  test('adds todos as active', async ({ todoPage }) => {
    await todoPage.addTodo('buy milk');

    await expect(todoPage.toggleFor('buy milk')).not.toBeChecked();
    await todoPage.expectCounter('1 item left');
  });

  test('trims surrounding whitespace from the title', async ({ todoPage }) => {
    await todoPage.addTodo('   buy milk   ');

    await todoPage.expectVisibleTodos(['buy milk']);
    await expect
      .poll(async () => (await todoPage.storedTodos())?.map((todo) => todo.title))
      .toEqual(['buy milk']);
  });

  test('ignores a whitespace-only entry and leaves the text in the input', async ({ todoPage }) => {
    await todoPage.addTodo('     ');

    await todoPage.expectEmptyState();
    // The app rejects the entry without clearing what was typed.
    await expect(todoPage.newTodoInput).toHaveValue('     ');
  });

  test('ignores Enter on an empty input', async ({ todoPage }) => {
    await todoPage.newTodoInput.press('Enter');
    await todoPage.expectEmptyState();

    await todoPage.addTodo('buy milk');
    await todoPage.newTodoInput.press('Enter');

    await todoPage.expectVisibleTodos(['buy milk']);
    await todoPage.expectCounter('1 item left');
  });

  test('keeps duplicate titles as separate todos', async ({ todoPage }) => {
    await todoPage.addTodos('buy milk', 'buy milk');

    await todoPage.expectVisibleTodos(['buy milk', 'buy milk']);
    await todoPage.expectCounter('2 items left');
  });

  test('renders a title that looks like markup as literal text', async ({ todoPage }) => {
    const title = '<b>bold</b> & <script>alert(1)</script>';
    await todoPage.addTodo(title);

    await todoPage.expectVisibleTodos([title]);
    // Raw element selectors: the point is that no such elements were created at all,
    // which by definition has no accessible-name or role equivalent.
    await expect(todoPage.page.locator('.todo-list b')).toHaveCount(0);
    await expect(todoPage.page.locator('.todo-list script')).toHaveCount(0);
  });

  test('keeps a long title intact', async ({ todoPage }) => {
    const title = `remember to ${'very '.repeat(60)}long errand`.trim();
    await todoPage.addTodo(title);

    await todoPage.expectVisibleTodos([title]);
    await todoPage.expectCounter('1 item left');
  });

  test('preserves internal whitespace and punctuation', async ({ todoPage }) => {
    await todoPage.addTodo('call "mum" @ 5pm — 50% done');

    await todoPage.expectVisibleTodos(['call "mum" @ 5pm — 50% done']);
  });

  test('adds a todo while the Completed filter hides it', async ({ todoPage }) => {
    await todoPage.seed([{ title: 'alpha', completed: true }], 'completed');

    await todoPage.addTodo('added while filtered');

    // Not shown under Completed, but counted and kept.
    await todoPage.expectVisibleTodos(['alpha']);
    await todoPage.expectCounter('1 item left');

    await todoPage.selectFilter('All');
    await todoPage.expectVisibleTodos(['alpha', 'added while filtered']);
  });
});
