import { test, expect } from './fixtures';

test.describe('app shell', () => {
  test('shows the app title and prompt', async ({ todoPage }) => {
    await expect(todoPage.page).toHaveTitle('React • TodoMVC');
    await expect(todoPage.heading).toBeVisible();
    await expect(todoPage.newTodoInput).toHaveAttribute('placeholder', 'What needs to be done?');
  });

  test('explains how to edit a todo', async ({ todoPage }) => {
    await expect(
      todoPage.page.getByRole('contentinfo').getByText('Double-click to edit a todo'),
    ).toBeVisible();
  });

  test('links out to the TodoMVC project', async ({ todoPage }) => {
    const info = todoPage.page.getByRole('contentinfo');

    await expect(info.getByRole('link', { name: 'TodoMVC', exact: true })).toHaveAttribute(
      'href',
      'http://todomvc.com',
    );
    await expect(info.getByRole('link', { name: 'Remo H. Jansen' })).toBeVisible();
  });

  test('names the todo controls for assistive technology', async ({ todoPage }) => {
    await todoPage.addTodo('buy milk');
    const item = todoPage.item('buy milk');

    await expect(item.getByRole('checkbox', { name: 'Toggle Todo' })).toBeVisible();
    await expect(todoPage.toggleAll).toBeVisible();
    await item.hover();
    await expect(item.getByRole('button', { name: 'Delete' })).toBeVisible();
  });

  test('reaches the filters by keyboard', async ({ todoPage }) => {
    await todoPage.addTodos('alpha', 'beta');
    await todoPage.toggle('alpha');

    await todoPage.filterLink('Completed').press('Enter');

    await expect(todoPage.page).toHaveURL(/#\/completed$/);
    await todoPage.expectVisibleTodos(['alpha']);
  });
});
