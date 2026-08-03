import { test, expect } from './fixtures';
import { APP_URL, TodoPage } from './pages/todo-page';

test.describe('persistence across reloads and sessions', () => {
  test('keeps todos and their order after a reload', async ({ todoPage, page }) => {
    await todoPage.addTodos('buy milk', 'walk the dog', 'write tests');

    await page.reload();

    await todoPage.expectVisibleTodos(['buy milk', 'walk the dog', 'write tests']);
    await todoPage.expectActiveCount(3);
  });

  test('keeps completed states after a reload', async ({ todoPage, page }) => {
    await todoPage.addTodos('buy milk', 'walk the dog');
    await todoPage.toggleTodo('walk the dog');

    await page.reload();

    await todoPage.expectCompleted('walk the dog', true);
    await todoPage.expectCompleted('buy milk', false);
    await todoPage.expectActiveCount(1);
    await expect(todoPage.clearCompletedButton).toBeVisible();
  });

  test('keeps an edit after a reload', async ({ todoPage, page }) => {
    await todoPage.addTodos('buy milk', 'walk the dog');
    await todoPage.editTodo('walk the dog', 'walk the cat');

    await page.reload();

    await todoPage.expectVisibleTodos(['buy milk', 'walk the cat']);
  });

  test('keeps a deletion after a reload', async ({ todoPage, page }) => {
    await todoPage.addTodos('buy milk', 'walk the dog');
    await todoPage.deleteTodo('buy milk');

    await page.reload();

    await todoPage.expectVisibleTodos(['walk the dog']);
    await todoPage.expectActiveCount(1);
  });

  test('comes back empty after every todo is deleted and the page reloads', async ({
    todoPage,
    page,
  }) => {
    await todoPage.addTodo('buy milk');
    await todoPage.deleteTodo('buy milk');

    await page.reload();

    await expect(todoPage.items).toHaveCount(0);
    await todoPage.expectListChromeVisible(false);
  });

  test('reloads straight into a filtered view', async ({ todoPage, page }) => {
    await todoPage.addTodos('buy milk', 'walk the dog');
    await todoPage.toggleTodo('walk the dog');
    await todoPage.selectFilter('Completed');

    await page.reload();

    await expect(page).toHaveURL(`${APP_URL}#/completed`);
    await todoPage.expectVisibleTodos(['walk the dog']);
    await todoPage.expectSelectedFilter('Completed');
  });

  test('restores the todos in a brand new tab of the same session', async ({
    todoPage,
    context,
  }) => {
    await todoPage.addTodos('buy milk', 'walk the dog');
    await todoPage.toggleTodo('buy milk');

    const secondTab = new TodoPage(await context.newPage());
    await secondTab.goto();

    await secondTab.expectVisibleTodos(['buy milk', 'walk the dog']);
    await secondTab.expectCompleted('buy milk', true);
    await secondTab.expectActiveCount(1);
  });

  test('starts empty in a session that has no stored todos', async ({ browser }) => {
    const freshPage = await browser.newPage();
    const freshTodos = new TodoPage(freshPage);

    await freshTodos.goto();

    await expect(freshTodos.items).toHaveCount(0);
    expect(await freshTodos.readStoredTodos()).toEqual([]);
    await freshPage.close();
  });
});
