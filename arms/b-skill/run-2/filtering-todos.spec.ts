import { test, expect } from './fixtures';
import { APP_URL } from './pages/todo-page';

test.describe('filtering todos', () => {
  test.beforeEach(async ({ todoPage }) => {
    await todoPage.seed([
      { title: 'buy milk', completed: true },
      { title: 'walk the dog' },
      { title: 'write tests' },
    ]);
  });

  test('shows every todo on the All view', async ({ todoPage }) => {
    await todoPage.expectVisibleTitles(['buy milk', 'walk the dog', 'write tests']);
    // The selected filter is only signalled by this class; there is no aria-current on the links.
    await expect(todoPage.filterLinks.all).toHaveClass('selected');
  });

  test('shows only unfinished todos on the Active view', async ({ todoPage }) => {
    await todoPage.filterBy('active');

    await todoPage.expectVisibleTitles(['walk the dog', 'write tests']);
    await expect(todoPage.filterLinks.active).toHaveClass('selected');
    await expect(todoPage.filterLinks.all).toHaveClass('');
  });

  test('shows only finished todos on the Completed view', async ({ todoPage }) => {
    await todoPage.filterBy('completed');

    await todoPage.expectVisibleTitles(['buy milk']);
    await expect(todoPage.filterLinks.completed).toHaveClass('selected');
  });

  test('counts the active todos on every view', async ({ todoPage }) => {
    await expect(todoPage.counter).toHaveText('2 items left');

    await todoPage.filterBy('active');
    await expect(todoPage.counter).toHaveText('2 items left');

    await todoPage.filterBy('completed');
    await expect(todoPage.counter).toHaveText('2 items left');
  });

  test('opens a filtered view directly from its URL', async ({ todoPage }) => {
    await todoPage.goto('completed');

    await todoPage.expectVisibleTitles(['buy milk']);
    await expect(todoPage.filterLinks.completed).toHaveClass('selected');
  });

  test('drops a todo out of the Active view as soon as it is completed', async ({ todoPage }) => {
    await todoPage.filterBy('active');

    await todoPage.toggle('walk the dog');

    await todoPage.expectVisibleTitles(['write tests']);
    await expect(todoPage.counter).toHaveText('1 item left');
  });

  test('drops a todo out of the Completed view as soon as it is reactivated', async ({ todoPage }) => {
    await todoPage.filterBy('completed');

    await todoPage.toggle('buy milk');

    await todoPage.expectVisibleTitles([]);
    await expect(todoPage.counter).toHaveText('3 items left');
  });

  test('shows a newly added todo on the Active view', async ({ todoPage }) => {
    await todoPage.filterBy('active');

    await todoPage.addTodos('new task');

    await todoPage.expectVisibleTitles(['walk the dog', 'write tests', 'new task']);
  });

  test('keeps a newly added todo out of the Completed view but stores it', async ({ todoPage }) => {
    await todoPage.filterBy('completed');

    await todoPage.addTodos('new task');

    await todoPage.expectVisibleTitles(['buy milk']);
    await expect(todoPage.counter).toHaveText('3 items left');

    await todoPage.filterBy('all');
    await todoPage.expectVisibleTitles(['buy milk', 'walk the dog', 'write tests', 'new task']);
  });

  test('completes every todo from the Active view, emptying it', async ({ todoPage }) => {
    await todoPage.filterBy('active');

    await todoPage.toggleAll();

    await todoPage.expectVisibleTitles([]);
    await expect(todoPage.counter).toHaveText('0 items left');

    await todoPage.filterBy('completed');
    await todoPage.expectVisibleTitles(['buy milk', 'walk the dog', 'write tests']);
  });

  test('deletes a todo from a filtered view', async ({ todoPage }) => {
    await todoPage.filterBy('active');

    await todoPage.remove('walk the dog');

    await todoPage.expectVisibleTitles(['write tests']);
    await todoPage.filterBy('all');
    await todoPage.expectVisibleTitles(['buy milk', 'write tests']);
  });

  test('edits a todo from a filtered view', async ({ todoPage }) => {
    await todoPage.filterBy('active');

    await todoPage.editTodo('walk the dog', 'walk the cat');

    await todoPage.expectVisibleTitles(['walk the cat', 'write tests']);
  });

  test('clears completed todos without leaving the current filter', async ({ todoPage }) => {
    await todoPage.filterBy('active');

    await todoPage.clearCompleted();

    await expect(todoPage.page).toHaveURL(`${APP_URL}#/active`);
    await todoPage.expectVisibleTitles(['walk the dog', 'write tests']);
    await expect(todoPage.clearCompletedButton).toBeHidden();
  });

  test('empties the Completed view when completed todos are cleared', async ({ todoPage }) => {
    await todoPage.filterBy('completed');

    await todoPage.clearCompleted();

    await todoPage.expectVisibleTitles([]);
    await expect(todoPage.counter).toHaveText('2 items left');
  });

  test('shows the empty state on a filtered view once the list is emptied', async ({ todoPage }) => {
    await todoPage.toggleAll();
    await todoPage.filterBy('completed');
    await todoPage.expectVisibleTitles(['buy milk', 'walk the dog', 'write tests']);

    for (const title of ['buy milk', 'walk the dog', 'write tests']) {
      await todoPage.remove(title);
    }

    // The footer and its filter links are unmounted with the list, even though the URL still
    // points at the Completed view.
    await expect(todoPage.page).toHaveURL(`${APP_URL}#/completed`);
    await todoPage.expectEmptyState();
  });

  test('restores the previous filter with the browser back button', async ({ todoPage }) => {
    await todoPage.filterBy('active');
    await todoPage.filterBy('completed');

    await todoPage.page.goBack();

    await expect(todoPage.page).toHaveURL(`${APP_URL}#/active`);
    await todoPage.expectVisibleTitles(['walk the dog', 'write tests']);

    await todoPage.page.goForward();

    await expect(todoPage.page).toHaveURL(`${APP_URL}#/completed`);
    await todoPage.expectVisibleTitles(['buy milk']);
  });
});
