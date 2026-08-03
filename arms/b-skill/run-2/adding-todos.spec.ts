import { test, expect } from './fixtures';

test.describe('adding todos', () => {
  test('starts with an empty list and no list furniture', async ({ todoPage }) => {
    await todoPage.expectEmptyState();
    await expect(todoPage.newTodoInput).toHaveValue('');
    await expect(todoPage.page).toHaveTitle('React • TodoMVC');
  });

  test('adds a todo and reveals the list, counter and filters', async ({ todoPage }) => {
    await todoPage.addTodo('buy milk');

    await todoPage.expectVisibleTitles(['buy milk']);
    await expect(todoPage.counter).toHaveText('1 item left');
    await expect(todoPage.toggleAllCheckbox).toBeVisible();
    await expect(todoPage.filterLinks.all).toBeVisible();
    await expect(todoPage.toggleFor('buy milk')).not.toBeChecked();
  });

  test('clears the input after a todo is added', async ({ todoPage }) => {
    await todoPage.addTodo('buy milk');

    await expect(todoPage.newTodoInput).toHaveValue('');
    await todoPage.expectVisibleTitles(['buy milk']);
  });

  test('appends each new todo to the end of the list', async ({ todoPage }) => {
    await todoPage.addTodos('buy milk', 'walk the dog', 'write tests');

    await todoPage.expectVisibleTitles(['buy milk', 'walk the dog', 'write tests']);
    await expect(todoPage.counter).toHaveText('3 items left');
  });

  test('pluralises the counter between one and many items', async ({ todoPage }) => {
    await todoPage.addTodo('buy milk');
    await expect(todoPage.counter).toHaveText('1 item left');

    await todoPage.addTodo('walk the dog');
    await expect(todoPage.counter).toHaveText('2 items left');
  });

  test('ignores an empty submission', async ({ todoPage }) => {
    await todoPage.newTodoInput.press('Enter');

    await todoPage.expectEmptyState();
  });

  test('rejects a whitespace-only todo and leaves the text in the input', async ({ todoPage }) => {
    await todoPage.addTodo('     ');

    await todoPage.expectEmptyState();
    // The app only clears the input on a successful add, so the rejected text stays put.
    await expect(todoPage.newTodoInput).toHaveValue('     ');
  });

  test('trims leading and trailing whitespace from the title', async ({ todoPage }) => {
    await todoPage.addTodo('   padded todo   ');

    await todoPage.expectVisibleTitles(['padded todo']);
    expect(await todoPage.storedTodos()).toMatchObject([{ title: 'padded todo', completed: false }]);
  });

  test('leaves an existing list untouched when a whitespace-only todo is submitted', async ({ todoPage }) => {
    await todoPage.addTodos('buy milk');

    await todoPage.addTodo('   ');

    await todoPage.expectVisibleTitles(['buy milk']);
    await expect(todoPage.counter).toHaveText('1 item left');
  });

  test('allows duplicate titles as separate todos', async ({ todoPage }) => {
    await todoPage.addTodos('buy milk', 'buy milk');

    await todoPage.expectVisibleTitles(['buy milk', 'buy milk']);
    await expect(todoPage.counter).toHaveText('2 items left');
  });

  test('accepts a very long title without truncating it', async ({ todoPage }) => {
    const longTitle = 'x'.repeat(300);

    await todoPage.addTodos(longTitle);

    await todoPage.expectVisibleTitles([longTitle]);
    expect(await todoPage.storedTodos()).toMatchObject([{ title: longTitle }]);
  });

  test('renders markup in a title as text rather than HTML', async ({ todoPage }) => {
    const markup = '<img src=x onerror=window.__xss=1> & <b>bold</b>';

    await todoPage.addTodos(markup);

    await todoPage.expectVisibleTitles([markup]);
    await expect(todoPage.page.locator('.todo-list img')).toHaveCount(0);
    await expect(todoPage.page.locator('.todo-list b')).toHaveCount(0);
    expect(await todoPage.page.evaluate(() => (window as any).__xss ?? null)).toBeNull();
  });

  test('accepts titles containing quotes, emoji and non-latin script', async ({ todoPage }) => {
    const titles = ['say "hello"', 'ship it 🚀', 'πλύσιμο πιάτων'];

    await todoPage.addTodos(...titles);

    await todoPage.expectVisibleTitles(titles);
  });
});
