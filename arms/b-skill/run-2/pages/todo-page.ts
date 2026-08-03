import { expect, type Locator, type Page } from '@playwright/test';

/** No baseURL is configured, so the app URL lives here and tests navigate absolutely. */
export const APP_URL = 'https://demo.playwright.dev/todomvc/';

/** The React implementation persists the whole list under this localStorage key. */
export const STORAGE_KEY = 'react-todos';

export type Filter = 'all' | 'active' | 'completed';

export type StoredTodo = { id: string; title: string; completed: boolean };

const FILTER_HASH: Record<Filter, string> = {
  all: '#/',
  active: '#/active',
  completed: '#/completed',
};

/**
 * Page object for the TodoMVC demo.
 *
 * Behaviours encoded here that were confirmed against the running app, because they are easy to
 * get wrong from assumption alone:
 *  - the per-item Delete button is `display: none` until its row is hovered
 *  - a todo's checkbox must be clicked rather than checked, since on the filtered views the row
 *    detaches the instant its state flips
 *  - the whole footer (counter, filters, clear button) and the toggle-all control are unmounted
 *    when the list is empty, so their absence is the empty state
 */
export class TodoPage {
  readonly page: Page;
  readonly newTodoInput: Locator;
  readonly items: Locator;
  readonly titles: Locator;
  readonly toggleAllCheckbox: Locator;
  readonly counter: Locator;
  readonly clearCompletedButton: Locator;
  readonly filterLinks: Record<Filter, Locator>;

  constructor(page: Page) {
    this.page = page;
    this.newTodoInput = page.getByPlaceholder('What needs to be done?');
    this.items = page.getByTestId('todo-item');
    this.titles = page.getByTestId('todo-title');
    this.toggleAllCheckbox = page.getByLabel('Mark all as complete');
    this.counter = page.getByTestId('todo-count');
    this.clearCompletedButton = page.getByRole('button', { name: 'Clear completed' });
    this.filterLinks = {
      all: page.getByRole('link', { name: 'All' }),
      active: page.getByRole('link', { name: 'Active' }),
      completed: page.getByRole('link', { name: 'Completed' }),
    };
  }

  async goto(filter: Filter = 'all'): Promise<void> {
    await this.page.goto(APP_URL + FILTER_HASH[filter]);
  }

  /** Addresses a row by the title it shows, never by position. */
  item(title: string): Locator {
    return this.items.filter({ has: this.page.getByText(title, { exact: true }) });
  }

  toggleFor(title: string): Locator {
    return this.item(title).getByRole('checkbox', { name: 'Toggle Todo' });
  }

  deleteButtonFor(title: string): Locator {
    return this.item(title).getByRole('button', { name: 'Delete' });
  }

  /** Only matchable while the row is in edit mode; it is `display: none` otherwise. */
  editInputFor(title: string): Locator {
    return this.item(title).getByRole('textbox', { name: 'Edit' });
  }

  async addTodo(title: string): Promise<void> {
    await this.newTodoInput.fill(title);
    await this.newTodoInput.press('Enter');
  }

  /**
   * Bulk setup. Waits for the input to clear after each entry, which is the app's own signal that
   * it accepted the submission — so setup cannot race the render. Only valid for titles the app
   * accepts; a blank one never clears the input.
   */
  async addTodos(...titles: string[]): Promise<void> {
    for (const title of titles) {
      await this.addTodo(title);
      await expect(this.newTodoInput).toHaveValue('');
    }
  }

  /**
   * Clicks the row's checkbox rather than using check()/uncheck(): on the Active and Completed
   * views the row is removed from the list as soon as its state flips, and check() times out
   * re-reading the checked state of an element that is no longer attached.
   */
  async toggle(title: string): Promise<void> {
    await this.toggleFor(title).click();
  }

  /** The Delete button is hidden until its row is hovered, so hover before clicking. */
  async remove(title: string): Promise<void> {
    const item = this.item(title);
    await item.hover();
    await this.deleteButtonFor(title).click();
  }

  async startEditing(title: string): Promise<void> {
    await this.item(title).getByTestId('todo-title').dblclick();
    await expect(this.editInputFor(title)).toBeFocused();
  }

  /**
   * Edits a todo in place. `commit: 'blur'` clicks away instead of pressing Enter — the app saves
   * on both.
   */
  async editTodo(title: string, newTitle: string, commit: 'enter' | 'blur' = 'enter'): Promise<void> {
    await this.startEditing(title);
    const input = this.editInputFor(title);
    await input.fill(newTitle);
    if (commit === 'enter') {
      await input.press('Enter');
    } else {
      await this.newTodoInput.click();
    }
  }

  async cancelEditing(title: string, draft: string): Promise<void> {
    await this.startEditing(title);
    const input = this.editInputFor(title);
    await input.fill(draft);
    await input.press('Escape');
  }

  async toggleAll(): Promise<void> {
    await this.toggleAllCheckbox.click();
  }

  async clearCompleted(): Promise<void> {
    await this.clearCompletedButton.click();
  }

  async filterBy(filter: Filter): Promise<void> {
    await this.filterLinks[filter].click();
    await expect(this.page).toHaveURL(APP_URL + FILTER_HASH[filter]);
  }

  /**
   * Seeds the list straight into storage, for tests whose subject is something other than adding.
   * The page must already be on the app origin.
   */
  async seed(todos: Array<{ title: string; completed?: boolean }>): Promise<void> {
    const stored: StoredTodo[] = todos.map((todo, index) => ({
      id: `seed-${index}`,
      title: todo.title,
      completed: todo.completed ?? false,
    }));
    await this.page.evaluate(
      ([key, value]) => localStorage.setItem(key, value),
      [STORAGE_KEY, JSON.stringify(stored)] as const,
    );
    await this.page.reload();
    await expect(this.items).toHaveCount(todos.length);
  }

  async storedTodos(): Promise<StoredTodo[]> {
    return this.page.evaluate(
      key => JSON.parse(localStorage.getItem(key) ?? '[]') as StoredTodo[],
      STORAGE_KEY,
    );
  }

  /** Asserts the titles currently rendered, in order. Also pins the row count. */
  async expectVisibleTitles(expected: string[]): Promise<void> {
    await expect(this.titles).toHaveText(expected);
  }

  /**
   * The empty state is the absence of the list furniture: no rows, no toggle-all, no footer.
   * Only the header input survives.
   */
  async expectEmptyState(): Promise<void> {
    await expect(this.items).toHaveCount(0);
    await expect(this.toggleAllCheckbox).toBeHidden();
    await expect(this.counter).toBeHidden();
    await expect(this.filterLinks.all).toBeHidden();
    await expect(this.filterLinks.active).toBeHidden();
    await expect(this.filterLinks.completed).toBeHidden();
    await expect(this.clearCompletedButton).toBeHidden();
    await expect(this.newTodoInput).toBeVisible();
  }
}
