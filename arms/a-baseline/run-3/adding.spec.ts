import { expect, test } from './todo-app';

test.describe('adding todos', () => {
  test('starts empty with a focused input and no list chrome', async ({ todo, page }) => {
    await expect(page).toHaveTitle('React • TodoMVC');
    await expect(page.getByRole('heading', { name: 'todos' })).toBeVisible();
    await expect(todo.newTodo).toBeFocused();
    await expect(todo.items).toHaveCount(0);
    await expect(todo.counter).toBeHidden();
    await expect(todo.toggleAll).toBeHidden();
    await expect(todo.clearCompleted).toBeHidden();
    expect(await todo.storedTodos()).toBeNull();
  });

  test('adds a todo, clears the input and persists it', async ({ todo }) => {
    await todo.add('buy some cheese');

    await expect(todo.titles).toHaveText(['buy some cheese']);
    await expect(todo.newTodo).toHaveValue('');
    await expect(todo.counter).toHaveText('1 item left');
    await expect(todo.item(0)).not.toHaveClass(/completed/);
    await todo.expectStored([{ title: 'buy some cheese', completed: false }]);
  });

  test('appends multiple todos in entry order', async ({ todo }) => {
    await todo.add('one', 'two', 'three');

    await expect(todo.titles).toHaveText(['one', 'two', 'three']);
    await expect(todo.counter).toHaveText('3 items left');
    await todo.expectStored([
      { title: 'one', completed: false },
      { title: 'two', completed: false },
      { title: 'three', completed: false },
    ]);
  });

  test('trims surrounding whitespace from the title', async ({ todo }) => {
    await todo.add('   padded todo   ');

    await expect(todo.titles).toHaveText(['padded todo']);
    await todo.expectStored([{ title: 'padded todo', completed: false }]);
  });

  test('keeps internal whitespace intact', async ({ todo }) => {
    await todo.add('walk  the   dog');

    await todo.expectStored([{ title: 'walk  the   dog', completed: false }]);
  });

  test('ignores an empty submission', async ({ todo }) => {
    await todo.newTodo.press('Enter');

    await expect(todo.items).toHaveCount(0);
    await expect(todo.counter).toBeHidden();
    expect(await todo.storedTodos()).toBeNull();
  });

  test('rejects a whitespace-only title and leaves the draft in the input', async ({ todo }) => {
    await todo.submitNewTodo('   ');

    await expect(todo.items).toHaveCount(0);
    // The app neither creates the todo nor resets the field in this case.
    await expect(todo.newTodo).toHaveValue('   ');
  });

  test('Escape does not clear the draft in the new-todo input', async ({ todo }) => {
    await todo.newTodo.fill('escape me');
    await todo.newTodo.press('Escape');

    await expect(todo.newTodo).toHaveValue('escape me');
    await expect(todo.items).toHaveCount(0);
  });

  test('allows duplicate titles as separate todos', async ({ todo }) => {
    await todo.add('same thing', 'same thing');

    await expect(todo.titles).toHaveText(['same thing', 'same thing']);
    await expect(todo.counter).toHaveText('2 items left');

    const stored = await todo.storedTodos();
    expect(stored).toHaveLength(2);
    expect(stored![0].id).not.toBe(stored![1].id);
  });

  test('renders markup-like titles as text instead of HTML', async ({ todo, page }) => {
    const nasty = '<img src=x onerror="window.__pwned = true"> & "quotes" 🎉';
    await todo.add(nasty);

    await expect(todo.titles).toHaveText([nasty]);
    await expect(page.locator('.todo-list img')).toHaveCount(0);
    expect(await page.evaluate(() => (window as unknown as { __pwned?: boolean }).__pwned)).toBeUndefined();
  });

  test('gives every todo a distinct id in storage', async ({ todo }) => {
    await todo.add('alpha', 'beta', 'gamma');

    const stored = await todo.storedTodos();
    const ids = stored!.map((t) => t.id);
    expect(new Set(ids).size).toBe(3);
    for (const id of ids) expect(id).not.toBe('');
  });
});
