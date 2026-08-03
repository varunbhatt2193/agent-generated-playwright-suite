import { test, expect } from './fixtures';

test.describe('completing todos', () => {
  test.beforeEach(async ({ todoPage }) => {
    await todoPage.seed([{ title: 'buy milk' }, { title: 'walk the dog' }, { title: 'write tests' }]);
  });

  test('marks a single todo complete and updates the counter', async ({ todoPage }) => {
    await todoPage.toggle('walk the dog');

    await expect(todoPage.toggleFor('walk the dog')).toBeChecked();
    await expect(todoPage.item('walk the dog')).toHaveClass('completed');
    await expect(todoPage.counter).toHaveText('2 items left');
    await expect(todoPage.toggleFor('buy milk')).not.toBeChecked();
  });

  test('returns a completed todo to active when toggled again', async ({ todoPage }) => {
    await todoPage.toggle('walk the dog');
    await expect(todoPage.counter).toHaveText('2 items left');

    await todoPage.toggle('walk the dog');

    await expect(todoPage.toggleFor('walk the dog')).not.toBeChecked();
    await expect(todoPage.item('walk the dog')).toHaveClass('');
    await expect(todoPage.counter).toHaveText('3 items left');
  });

  test('keeps completed todos in the list on the All view', async ({ todoPage }) => {
    await todoPage.toggle('buy milk');

    await todoPage.expectVisibleTitles(['buy milk', 'walk the dog', 'write tests']);
  });

  test('records completion in storage', async ({ todoPage }) => {
    await todoPage.toggle('buy milk');
    await expect(todoPage.counter).toHaveText('2 items left');

    expect(await todoPage.storedTodos()).toMatchObject([
      { title: 'buy milk', completed: true },
      { title: 'walk the dog', completed: false },
      { title: 'write tests', completed: false },
    ]);
  });

  test('shows zero items left once every todo is complete', async ({ todoPage }) => {
    for (const title of ['buy milk', 'walk the dog', 'write tests']) {
      await todoPage.toggle(title);
    }

    await expect(todoPage.counter).toHaveText('0 items left');
  });

  test.describe('toggle all', () => {
    test('completes every todo', async ({ todoPage }) => {
      await todoPage.toggleAll();

      await expect(todoPage.counter).toHaveText('0 items left');
      for (const title of ['buy milk', 'walk the dog', 'write tests']) {
        await expect(todoPage.toggleFor(title)).toBeChecked();
        await expect(todoPage.item(title)).toHaveClass('completed');
      }
    });

    test('returns every todo to active when clicked a second time', async ({ todoPage }) => {
      await todoPage.toggleAll();
      await expect(todoPage.counter).toHaveText('0 items left');

      await todoPage.toggleAll();

      await expect(todoPage.counter).toHaveText('3 items left');
      for (const title of ['buy milk', 'walk the dog', 'write tests']) {
        await expect(todoPage.toggleFor(title)).not.toBeChecked();
      }
    });

    test('completes the remaining todos when some are already complete', async ({ todoPage }) => {
      await todoPage.toggle('buy milk');
      await expect(todoPage.counter).toHaveText('2 items left');

      await todoPage.toggleAll();

      await expect(todoPage.counter).toHaveText('0 items left');
      await expect(todoPage.toggleFor('buy milk')).toBeChecked();
    });

    test('is unchecked while any todo is still active', async ({ todoPage }) => {
      await expect(todoPage.toggleAllCheckbox).not.toBeChecked();

      await todoPage.toggle('buy milk');

      await expect(todoPage.toggleAllCheckbox).not.toBeChecked();
    });

    test('checks itself once the last todo is completed individually', async ({ todoPage }) => {
      for (const title of ['buy milk', 'walk the dog', 'write tests']) {
        await todoPage.toggle(title);
      }

      await expect(todoPage.toggleAllCheckbox).toBeChecked();
    });

    test('unchecks itself when one completed todo is reactivated', async ({ todoPage }) => {
      await todoPage.toggleAll();
      await expect(todoPage.toggleAllCheckbox).toBeChecked();

      await todoPage.toggle('write tests');

      await expect(todoPage.toggleAllCheckbox).not.toBeChecked();
      await expect(todoPage.counter).toHaveText('1 item left');
    });
  });

  test.describe('clear completed', () => {
    test('is not shown while nothing is complete', async ({ todoPage }) => {
      await expect(todoPage.clearCompletedButton).toBeHidden();
    });

    test('appears as soon as a todo is completed', async ({ todoPage }) => {
      await todoPage.toggle('buy milk');

      await expect(todoPage.clearCompletedButton).toBeVisible();
    });

    test('removes only the completed todos', async ({ todoPage }) => {
      await todoPage.toggle('buy milk');
      await todoPage.toggle('write tests');
      await expect(todoPage.counter).toHaveText('1 item left');

      await todoPage.clearCompleted();

      await todoPage.expectVisibleTitles(['walk the dog']);
      await expect(todoPage.counter).toHaveText('1 item left');
      expect(await todoPage.storedTodos()).toMatchObject([{ title: 'walk the dog', completed: false }]);
    });

    test('disappears again once no completed todos remain', async ({ todoPage }) => {
      await todoPage.toggle('buy milk');
      await todoPage.clearCompleted();

      await expect(todoPage.clearCompletedButton).toBeHidden();
    });

    test('empties the app when every todo is complete', async ({ todoPage }) => {
      await todoPage.toggleAll();
      await expect(todoPage.counter).toHaveText('0 items left');

      await todoPage.clearCompleted();

      await todoPage.expectEmptyState();
    });
  });
});
