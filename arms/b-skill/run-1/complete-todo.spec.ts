import { test, expect } from './fixtures';

test.describe('completing todos', () => {
  test('marks a todo complete and decrements the counter', async ({ todoPage }) => {
    await todoPage.addTodos('buy milk', 'walk the dog');

    await todoPage.toggle('buy milk');

    await todoPage.expectCompletion([
      { title: 'buy milk', completed: true },
      { title: 'walk the dog', completed: false },
    ]);
    await todoPage.expectCounter('1 item left');
    // The strikethrough styling is only conveyed through this class; the app exposes
    // no ARIA state for it.
    await expect(todoPage.item('buy milk')).toHaveClass(/completed/);
  });

  test('un-completes a todo and restores the counter', async ({ todoPage }) => {
    await todoPage.seed([{ title: 'buy milk', completed: true }]);
    await todoPage.expectCounter('0 items left');

    await todoPage.toggle('buy milk');

    await todoPage.expectCompletion([{ title: 'buy milk', completed: false }]);
    await todoPage.expectCounter('1 item left');
    await expect(todoPage.item('buy milk')).not.toHaveClass(/completed/);
  });

  test('pluralises the counter across zero, one and many', async ({ todoPage }) => {
    await todoPage.addTodos('buy milk', 'walk the dog');
    await todoPage.expectCounter('2 items left');

    await todoPage.toggle('buy milk');
    await todoPage.expectCounter('1 item left');

    await todoPage.toggle('walk the dog');
    await todoPage.expectCounter('0 items left');
  });

  test('persists the completed flag to storage', async ({ todoPage }) => {
    await todoPage.addTodo('buy milk');

    await todoPage.toggle('buy milk');

    await expect(todoPage.toggleFor('buy milk')).toBeChecked();
    await expect
      .poll(async () => (await todoPage.storedTodos())?.map((todo) => todo.completed))
      .toEqual([true]);
  });

  test('completing the last active todo checks the toggle-all control', async ({ todoPage }) => {
    await todoPage.addTodos('buy milk', 'walk the dog');
    await expect(todoPage.toggleAll).not.toBeChecked();

    await todoPage.toggle('buy milk');
    await expect(todoPage.toggleAll).not.toBeChecked();

    await todoPage.toggle('walk the dog');
    await expect(todoPage.toggleAll).toBeChecked();
  });

  test('re-activating one todo unchecks the toggle-all control', async ({ todoPage }) => {
    await todoPage.seed([
      { title: 'buy milk', completed: true },
      { title: 'walk the dog', completed: true },
    ]);
    await expect(todoPage.toggleAll).toBeChecked();

    await todoPage.toggle('buy milk');

    await expect(todoPage.toggleAll).not.toBeChecked();
    await todoPage.expectCounter('1 item left');
  });

  test('toggle-all completes every todo, including ones already complete', async ({ todoPage }) => {
    await todoPage.seed([
      { title: 'alpha', completed: true },
      { title: 'beta', completed: false },
      { title: 'gamma', completed: false },
    ]);

    await todoPage.toggleAll.check();

    await todoPage.expectCompletion([
      { title: 'alpha', completed: true },
      { title: 'beta', completed: true },
      { title: 'gamma', completed: true },
    ]);
    await todoPage.expectCounter('0 items left');
    await expect(todoPage.clearCompleted).toBeVisible();
  });

  test('toggle-all re-activates every todo when they are all complete', async ({ todoPage }) => {
    await todoPage.seed([
      { title: 'alpha', completed: true },
      { title: 'beta', completed: true },
    ]);

    await todoPage.toggleAll.uncheck();

    await todoPage.expectCompletion([
      { title: 'alpha', completed: false },
      { title: 'beta', completed: false },
    ]);
    await todoPage.expectCounter('2 items left');
    await expect(todoPage.clearCompleted).toBeHidden();
  });

  test('toggle-all completes hidden todos too when a filter is applied', async ({ todoPage }) => {
    await todoPage.seed(
      [
        { title: 'alpha', completed: true },
        { title: 'beta', completed: false },
        { title: 'gamma', completed: false },
      ],
      'active',
    );
    await todoPage.expectVisibleTodos(['beta', 'gamma']);

    await todoPage.toggleAll.check();

    // Everything is complete, so nothing is left under Active.
    await todoPage.expectVisibleTodos([]);
    await todoPage.expectCounter('0 items left');

    await todoPage.selectFilter('Completed');
    await todoPage.expectVisibleTodos(['alpha', 'beta', 'gamma']);
  });

  test('completing a todo moves it out of the Active view and into Completed', async ({ todoPage }) => {
    await todoPage.seed([
      { title: 'alpha', completed: false },
      { title: 'beta', completed: false },
    ]);

    await todoPage.selectFilter('Active');
    await todoPage.toggle('alpha');
    await todoPage.expectVisibleTodos(['beta']);

    await todoPage.selectFilter('Completed');
    await todoPage.expectVisibleTodos(['alpha']);
  });

  test('un-completing a todo from the Completed view removes it from that view', async ({ todoPage }) => {
    await todoPage.seed(
      [
        { title: 'alpha', completed: true },
        { title: 'beta', completed: true },
      ],
      'completed',
    );

    await todoPage.toggle('alpha');

    await todoPage.expectVisibleTodos(['beta']);
    await todoPage.expectCounter('1 item left');
  });
});
