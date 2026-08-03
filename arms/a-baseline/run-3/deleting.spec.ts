import { expect, test } from './todo-app';

test.describe('deleting todos', () => {
  test.beforeEach(async ({ todo }) => {
    await todo.add('one', 'two', 'three');
  });

  test('the delete button is revealed by hovering its row', async ({ todo }) => {
    await expect(todo.deleteButtonOf(0)).toBeHidden();

    await todo.item(0).hover();
    await expect(todo.deleteButtonOf(0)).toBeVisible();
    // Hovering one row does not reveal the others.
    await expect(todo.deleteButtonOf(1)).toBeHidden();
  });

  test('deletes the clicked todo only', async ({ todo }) => {
    await todo.remove(1);

    await expect(todo.titles).toHaveText(['one', 'three']);
    await expect(todo.counter).toHaveText('2 items left');
    await todo.expectStored([
      { title: 'one', completed: false },
      { title: 'three', completed: false },
    ]);
  });

  test('deletes a completed todo and updates the counter', async ({ todo }) => {
    await todo.toggle(0);
    await expect(todo.counter).toHaveText('2 items left');

    await todo.remove(0);

    await expect(todo.titles).toHaveText(['two', 'three']);
    await expect(todo.counter).toHaveText('2 items left');
    await expect(todo.clearCompleted).toBeHidden();
  });

  test('deleting the last todo returns the app to its empty state', async ({ todo }) => {
    await todo.remove(0);
    await todo.remove(0);
    await todo.remove(0);

    await expect(todo.items).toHaveCount(0);
    await expect(todo.counter).toBeHidden();
    await expect(todo.toggleAll).toBeHidden();
    await expect(todo.filterAll).toBeHidden();
    await todo.expectStored([]);
  });

  test('deletions survive a reload', async ({ todo, page }) => {
    await todo.remove(2);
    await page.reload();

    await expect(todo.titles).toHaveText(['one', 'two']);
  });
});

test.describe('clear completed', () => {
  test.beforeEach(async ({ todo }) => {
    await todo.add('one', 'two', 'three');
  });

  test('removes only the completed todos', async ({ todo }) => {
    await todo.toggle(0);
    await todo.toggle(2);

    await todo.clearCompleted.click();

    await expect(todo.titles).toHaveText(['two']);
    await expect(todo.counter).toHaveText('1 item left');
    await expect(todo.clearCompleted).toBeHidden();
    await todo.expectStored([{ title: 'two', completed: false }]);
  });

  test('clearing every completed todo empties the app', async ({ todo }) => {
    await todo.toggleAll.check();
    await todo.clearCompleted.click();

    await expect(todo.items).toHaveCount(0);
    await expect(todo.counter).toBeHidden();
    await todo.expectStored([]);
  });

  test('works while the Completed filter is active and keeps the route', async ({ todo, page }) => {
    await todo.toggle(1);
    await todo.filterCompleted.click();
    await expect(todo.titles).toHaveText(['two']);

    await todo.clearCompleted.click();

    await expect(todo.items).toHaveCount(0);
    await expect(page).toHaveURL(/#\/completed$/);
    await expect(todo.counter).toHaveText('2 items left');

    await todo.filterAll.click();
    await expect(todo.titles).toHaveText(['one', 'three']);
  });

  test('an emptied list stays empty after a reload', async ({ todo, page }) => {
    await todo.toggleAll.check();
    await todo.clearCompleted.click();
    await page.reload();

    await expect(todo.items).toHaveCount(0);
    await expect(todo.newTodo).toBeFocused();
    await todo.expectStored([]);
  });
});
