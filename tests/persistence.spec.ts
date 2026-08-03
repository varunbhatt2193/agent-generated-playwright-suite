import { test, expect } from './fixtures';
import { TodoPage, urlFor } from './pages/todo-page';

test.describe('persistence', () => {
  test('keeps todos and their completed state across a reload', async ({ todoPage }) => {
    await todoPage.addTodos('alpha', 'beta', 'gamma');
    await todoPage.toggle('beta');

    await todoPage.page.reload();

    await todoPage.expectVisibleTodos(['alpha', 'beta', 'gamma']);
    await todoPage.expectCompletion([
      { title: 'alpha', completed: false },
      { title: 'beta', completed: true },
      { title: 'gamma', completed: false },
    ]);
    await todoPage.expectCounter('2 items left');
  });

  test('keeps an edited title across a reload', async ({ todoPage }) => {
    await todoPage.addTodos('alpha', 'beta');
    await todoPage.editTodo('alpha', 'alpha renamed');

    await todoPage.page.reload();

    await todoPage.expectVisibleTodos(['alpha renamed', 'beta']);
  });

  test('keeps deletions across a reload', async ({ todoPage }) => {
    await todoPage.addTodos('alpha', 'beta', 'gamma');
    await todoPage.deleteTodo('beta');

    await todoPage.page.reload();

    await todoPage.expectVisibleTodos(['alpha', 'gamma']);
    await todoPage.expectCounter('2 items left');
  });

  test('keeps a cleared list empty across a reload', async ({ todoPage }) => {
    await todoPage.addTodos('alpha', 'beta');
    await todoPage.toggleAll.check();
    await todoPage.clearCompleted.click();

    await todoPage.page.reload();

    await todoPage.expectEmptyState();
  });

  test('keeps the current filter across a reload', async ({ todoPage }) => {
    await todoPage.addTodos('alpha', 'beta');
    await todoPage.toggle('alpha');
    await todoPage.selectFilter('Completed');

    await todoPage.page.reload();

    await expect(todoPage.page).toHaveURL(urlFor('completed'));
    await todoPage.expectVisibleTodos(['alpha']);
    await expect(todoPage.filterLink('Completed')).toHaveClass(/selected/);
  });

  test('keeps todos when navigating away and back', async ({ todoPage }) => {
    await todoPage.addTodos('alpha', 'beta');

    await todoPage.page.goto('about:blank');
    await todoPage.goto();

    await todoPage.expectVisibleTodos(['alpha', 'beta']);
  });

  test('starts empty in a fresh browser session', async ({ todoPage, browser }) => {
    await todoPage.addTodo('alpha');
    await todoPage.expectVisibleTodos(['alpha']);

    const context = await browser.newContext();
    const otherTodoPage = new TodoPage(await context.newPage());
    await otherTodoPage.goto();

    await otherTodoPage.expectEmptyState();
    await context.close();

    // The original session is untouched.
    await todoPage.expectVisibleTodos(['alpha']);
  });
});
