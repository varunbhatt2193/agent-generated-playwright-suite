import { test, expect } from './fixtures';
import { urlFor } from './pages/todo-page';

const SEED = [
  { title: 'alpha', completed: true },
  { title: 'beta', completed: false },
  { title: 'gamma', completed: true },
  { title: 'delta', completed: false },
];

test.describe('filtering', () => {
  test('All shows every todo', async ({ todoPage }) => {
    await todoPage.seed(SEED);

    await todoPage.selectFilter('All');

    await todoPage.expectVisibleTodos(['alpha', 'beta', 'gamma', 'delta']);
    await expect(todoPage.page).toHaveURL(urlFor('all'));
  });

  test('Active shows only unfinished todos', async ({ todoPage }) => {
    await todoPage.seed(SEED);

    await todoPage.selectFilter('Active');

    await todoPage.expectVisibleTodos(['beta', 'delta']);
    await expect(todoPage.page).toHaveURL(urlFor('active'));
  });

  test('Completed shows only finished todos', async ({ todoPage }) => {
    await todoPage.seed(SEED);

    await todoPage.selectFilter('Completed');

    await todoPage.expectVisibleTodos(['alpha', 'gamma']);
    await expect(todoPage.page).toHaveURL(urlFor('completed'));
  });

  test('highlights the active filter', async ({ todoPage }) => {
    await todoPage.seed(SEED);

    // The app marks the current filter with a class and exposes no aria-current,
    // so the class is the only handle on the highlight.
    await expect(todoPage.filterLink('All')).toHaveClass(/selected/);
    await expect(todoPage.filterLink('Active')).not.toHaveClass(/selected/);

    await todoPage.selectFilter('Active');
    await expect(todoPage.filterLink('Active')).toHaveClass(/selected/);
    await expect(todoPage.filterLink('All')).not.toHaveClass(/selected/);

    await todoPage.selectFilter('Completed');
    await expect(todoPage.filterLink('Completed')).toHaveClass(/selected/);
    await expect(todoPage.filterLink('Active')).not.toHaveClass(/selected/);
  });

  test('opens straight into the Active view from its URL', async ({ todoPage }) => {
    await todoPage.seed(SEED, 'active');

    await todoPage.expectVisibleTodos(['beta', 'delta']);
    await expect(todoPage.filterLink('Active')).toHaveClass(/selected/);
  });

  test('opens straight into the Completed view from its URL', async ({ todoPage }) => {
    await todoPage.seed(SEED, 'completed');

    await todoPage.expectVisibleTodos(['alpha', 'gamma']);
    await expect(todoPage.filterLink('Completed')).toHaveClass(/selected/);
  });

  test('falls back to All for an unknown route', async ({ todoPage }) => {
    await todoPage.seed(SEED);

    await todoPage.page.goto(`${urlFor('all')}bogus`);
    await todoPage.page.reload();

    await todoPage.expectVisibleTodos(['alpha', 'beta', 'gamma', 'delta']);
    await expect(todoPage.filterLink('All')).toHaveClass(/selected/);
  });

  test('keeps the counter on the total of active todos in every view', async ({ todoPage }) => {
    await todoPage.seed(SEED);
    await todoPage.expectCounter('2 items left');

    await todoPage.selectFilter('Completed');
    await todoPage.expectCounter('2 items left');

    await todoPage.selectFilter('Active');
    await todoPage.expectCounter('2 items left');
  });

  test('keeps the footer visible when a filter matches nothing', async ({ todoPage }) => {
    await todoPage.seed([
      { title: 'alpha', completed: true },
      { title: 'beta', completed: true },
    ]);

    await todoPage.selectFilter('Active');

    await todoPage.expectVisibleTodos([]);
    await expect(todoPage.counter).toBeVisible();
    await todoPage.expectCounter('0 items left');
    await expect(todoPage.filterLink('All')).toBeVisible();
    await expect(todoPage.clearCompleted).toBeVisible();
  });

  test('goes back and forward through the filter history', async ({ todoPage }) => {
    await todoPage.seed(SEED);

    await todoPage.selectFilter('Completed');
    await todoPage.selectFilter('Active');
    await todoPage.expectVisibleTodos(['beta', 'delta']);

    await todoPage.page.goBack();
    await expect(todoPage.page).toHaveURL(urlFor('completed'));
    await todoPage.expectVisibleTodos(['alpha', 'gamma']);

    await todoPage.page.goForward();
    await expect(todoPage.page).toHaveURL(urlFor('active'));
    await todoPage.expectVisibleTodos(['beta', 'delta']);
  });

  test('a filtered view updates as todos change underneath it', async ({ todoPage }) => {
    await todoPage.seed(SEED, 'active');
    await todoPage.expectVisibleTodos(['beta', 'delta']);

    await todoPage.addTodo('epsilon');
    await todoPage.expectVisibleTodos(['beta', 'delta', 'epsilon']);

    await todoPage.toggle('beta');
    await todoPage.expectVisibleTodos(['delta', 'epsilon']);

    await todoPage.deleteTodo('delta');
    await todoPage.expectVisibleTodos(['epsilon']);
    await todoPage.expectCounter('1 item left');
  });
});
