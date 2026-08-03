import { expect, type Locator, type Page } from '@playwright/test';

/** No baseURL is configured in playwright.config.ts, so the absolute URL lives here. */
export const APP_URL = 'https://demo.playwright.dev/todomvc/';

export type FilterName = 'All' | 'Active' | 'Completed';

/** Shape of a single entry in the app's `react-todos` localStorage key. */
export type StoredTodo = { id: string; title: string; completed: boolean };

const FILTER_HASH: Record<FilterName, string> = {
  All: '#/',
  Active: '#/active',
  Completed: '#/completed',
};

/**
 * Page object for the TodoMVC demo app.
 *
 * Behaviours encoded here were confirmed against the live app rather than assumed:
 * - the per-item Delete button is `display: none` until its row is hovered
 * - completing a todo while the Active filter is applied removes the row from the view, so
 *   toggling uses `click()` (which asserts nothing about the element afterwards) rather than
 *   `check()` (which re-reads the element and would fail once it has been unmounted)
 */
export class TodoPage {
  readonly page: Page;
  readonly heading: Locator;
  readonly newTodoInput: Locator;
  readonly items: Locator;
  readonly titles: Locator;
  readonly counter: Locator;
  readonly toggleAllCheckbox: Locator;
  readonly clearCompletedButton: Locator;
  readonly infoFooter: Locator;

  constructor(page: Page) {
    this.page = page;
    this.heading = page.getByRole('heading', { name: 'todos' });
    this.infoFooter = page.getByRole('contentinfo');
    this.newTodoInput = page.getByPlaceholder('What needs to be done?');
    this.items = page.getByTestId('todo-item');
    this.titles = page.getByTestId('todo-title');
    this.counter = page.getByTestId('todo-count');
    this.toggleAllCheckbox = page.getByRole('checkbox', { name: 'Mark all as complete' });
    this.clearCompletedButton = page.getByRole('button', { name: 'Clear completed' });
  }

  async goto(filter: FilterName = 'All'): Promise<void> {
    await this.page.goto(APP_URL + FILTER_HASH[filter]);
    await expect(this.newTodoInput).toBeVisible();
  }

  /** Row for a todo, matched by its rendered title so list order never matters. */
  todo(title: string): Locator {
    return this.items.filter({ has: this.page.getByText(title, { exact: true }) });
  }

  toggleFor(title: string): Locator {
    return this.todo(title).getByRole('checkbox', { name: 'Toggle Todo' });
  }

  deleteButtonFor(title: string): Locator {
    return this.todo(title).getByRole('button', { name: 'Delete' });
  }

  editorFor(title: string): Locator {
    return this.todo(title).getByRole('textbox', { name: 'Edit' });
  }

  filterLink(name: FilterName): Locator {
    return this.page.getByRole('link', { name, exact: true });
  }

  /** The submit does not always add a todo — the app rejects empty and whitespace-only input. */
  async submitNewTodo(title: string): Promise<void> {
    await this.newTodoInput.fill(title);
    await this.newTodoInput.press('Enter');
  }

  async addTodo(title: string): Promise<void> {
    const expected = (await this.titles.count()) + 1;
    await this.submitNewTodo(title);
    await expect(this.items).toHaveCount(expected);
  }

  async addTodos(...titles: string[]): Promise<void> {
    for (const title of titles) await this.addTodo(title);
  }

  async toggleTodo(title: string): Promise<void> {
    await this.toggleFor(title).click();
  }

  async deleteTodo(title: string): Promise<void> {
    // The Delete button only becomes visible while its row is hovered.
    await this.todo(title).hover();
    await this.deleteButtonFor(title).click();
  }

  async startEditing(title: string): Promise<Locator> {
    await this.todo(title).dblclick();
    const editor = this.editorFor(title);
    await expect(editor).toBeFocused();
    return editor;
  }

  /**
   * Edit a todo and commit the change the way a user would: Enter, blurring the field, or
   * abandoning it with Escape.
   */
  async editTodo(
    title: string,
    newTitle: string,
    commit: 'enter' | 'blur' | 'escape' = 'enter',
  ): Promise<void> {
    const editor = await this.startEditing(title);
    await editor.fill(newTitle);
    if (commit === 'enter') await editor.press('Enter');
    else if (commit === 'escape') await editor.press('Escape');
    else await this.newTodoInput.click();
  }

  async selectFilter(name: FilterName): Promise<void> {
    await this.filterLink(name).click();
  }

  async clearCompleted(): Promise<void> {
    await this.clearCompletedButton.click();
  }

  async toggleAll(): Promise<void> {
    await this.toggleAllCheckbox.click();
  }

  /** Corroborating read of what the app persisted; never the only assertion in a test. */
  async readStoredTodos(): Promise<StoredTodo[]> {
    return this.page.evaluate(() => JSON.parse(window.localStorage.getItem('react-todos') ?? '[]'));
  }

  async expectVisibleTodos(titles: string[]): Promise<void> {
    await expect(this.titles).toHaveText(titles);
  }

  /** The footer counter always reports active todos, whichever filter is applied. */
  async expectActiveCount(count: number): Promise<void> {
    await expect(this.counter).toHaveText(`${count} item${count === 1 ? '' : 's'} left`);
  }

  /**
   * The current filter is conveyed only by a `selected` class — the links carry no ARIA state —
   * so this is the one place a CSS selector is unavoidable.
   */
  async expectSelectedFilter(name: FilterName): Promise<void> {
    await expect(this.page.locator('.filters a.selected')).toHaveText(name);
  }

  async expectCompleted(title: string, completed: boolean): Promise<void> {
    const toggle = this.toggleFor(title);
    if (completed) await expect(toggle).toBeChecked();
    else await expect(toggle).not.toBeChecked();
  }

  /** The list chrome (toggle-all, counter, filters) is only rendered when todos exist. */
  async expectListChromeVisible(visible: boolean): Promise<void> {
    const assertion = visible ? expect(this.toggleAllCheckbox) : expect(this.toggleAllCheckbox).not;
    await assertion.toBeVisible();
    const counter = visible ? expect(this.counter) : expect(this.counter).not;
    await counter.toBeVisible();
    const filters = visible ? expect(this.filterLink('All')) : expect(this.filterLink('All')).not;
    await filters.toBeVisible();
  }
}
