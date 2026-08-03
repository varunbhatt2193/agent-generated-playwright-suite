import { APP_URL, expect, test } from './todo-app';

test.describe('filtering', () => {
  test.beforeEach(async ({ todo }) => {
    await todo.add('one', 'two', 'three');
    await todo.toggle(1); // "two" is the only completed todo
  });

  test('All shows every todo and is selected by default', async ({ todo, page }) => {
    await expect(page).toHaveURL(/#\/$/);
    await expect(todo.filterAll).toHaveClass(/selected/);
    await expect(todo.titles).toHaveText(['one', 'two', 'three']);
  });

  test('Active shows only unfinished todos', async ({ todo, page }) => {
    await todo.filterActive.click();

    await expect(page).toHaveURL(/#\/active$/);
    await expect(todo.filterActive).toHaveClass(/selected/);
    await expect(todo.filterAll).not.toHaveClass(/selected/);
    await expect(todo.titles).toHaveText(['one', 'three']);
  });

  test('Completed shows only finished todos', async ({ todo, page }) => {
    await todo.filterCompleted.click();

    await expect(page).toHaveURL(/#\/completed$/);
    await expect(todo.filterCompleted).toHaveClass(/selected/);
    await expect(todo.titles).toHaveText(['two']);
  });

  test('the counter always reports active todos regardless of the filter', async ({ todo }) => {
    await expect(todo.counter).toHaveText('2 items left');

    await todo.filterCompleted.click();
    await expect(todo.counter).toHaveText('2 items left');

    await todo.filterActive.click();
    await expect(todo.counter).toHaveText('2 items left');
  });

  test('completing a todo removes it from the Active view', async ({ todo }) => {
    await todo.filterActive.click();
    await expect(todo.titles).toHaveText(['one', 'three']);

    await todo.toggle(0);

    await expect(todo.titles).toHaveText(['three']);
    await expect(todo.counter).toHaveText('1 item left');
  });

  test('reactivating a todo removes it from the Completed view', async ({ todo }) => {
    await todo.filterCompleted.click();
    await expect(todo.titles).toHaveText(['two']);

    await todo.toggle(0);

    await expect(todo.items).toHaveCount(0);
    await expect(todo.counter).toHaveText('3 items left');
  });

  test('a todo added while filtered is stored even though it is hidden', async ({ todo }) => {
    await todo.filterCompleted.click();
    await todo.submitNewTodo('added while filtered');

    await expect(todo.titles).toHaveText(['two']);
    await expect(todo.counter).toHaveText('3 items left');
    await expect(todo.newTodo).toHaveValue('');

    await todo.filterAll.click();
    await expect(todo.titles).toHaveText(['one', 'two', 'three', 'added while filtered']);
  });

  test('editing works inside a filtered view', async ({ todo }) => {
    await todo.filterActive.click();
    await todo.editAndCommit(1, 'three edited while filtered');

    await expect(todo.titles).toHaveText(['one', 'three edited while filtered']);

    await todo.filterAll.click();
    await expect(todo.titles).toHaveText(['one', 'two', 'three edited while filtered']);
  });

  test('deleting works inside a filtered view', async ({ todo }) => {
    await todo.filterActive.click();
    await todo.remove(0);

    await expect(todo.titles).toHaveText(['three']);

    await todo.filterAll.click();
    await expect(todo.titles).toHaveText(['two', 'three']);
  });

  test('the filter links point at the expected routes', async ({ todo }) => {
    await expect(todo.filterAll).toHaveAttribute('href', '#/');
    await expect(todo.filterActive).toHaveAttribute('href', '#/active');
    await expect(todo.filterCompleted).toHaveAttribute('href', '#/completed');
  });

  test('back and forward navigation restores the previous filter', async ({ todo, page }) => {
    await todo.filterActive.click();
    await todo.filterCompleted.click();
    await expect(todo.titles).toHaveText(['two']);

    await page.goBack();
    await expect(page).toHaveURL(/#\/active$/);
    await expect(todo.filterActive).toHaveClass(/selected/);
    await expect(todo.titles).toHaveText(['one', 'three']);

    await page.goBack();
    await expect(page).toHaveURL(/#\/$/);
    await expect(todo.titles).toHaveText(['one', 'two', 'three']);

    await page.goForward();
    await expect(page).toHaveURL(/#\/active$/);
    await expect(todo.titles).toHaveText(['one', 'three']);
  });

  test('an unknown route leaves the current view untouched', async ({ todo, page }) => {
    // Unknown hashes are ignored by the router rather than treated as a filter, so whichever
    // filter was last applied stays in effect.
    await page.goto(`${APP_URL}#/nonsense`);

    await expect(todo.titles).toHaveText(['one', 'two', 'three']);
    await expect(todo.filterAll).toHaveClass(/selected/);
    await expect(todo.counter).toHaveText('2 items left');

    await todo.filterCompleted.click();
    await page.goto(`${APP_URL}#/nonsense`);

    await expect(todo.titles).toHaveText(['two']);
    await expect(todo.filterCompleted).toHaveClass(/selected/);
  });

  test('loading the app without a hash normalises the URL to #/', async ({ todo, page }) => {
    await page.goto(APP_URL);

    await expect(page).toHaveURL(/#\/$/);
    await expect(todo.filterAll).toHaveClass(/selected/);
    await expect(todo.titles).toHaveText(['one', 'two', 'three']);
  });
});
