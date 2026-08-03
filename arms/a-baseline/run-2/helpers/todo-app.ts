import { expect, type Locator, type Page } from '@playwright/test';

/** No baseURL is configured in playwright.config.ts, so tests navigate with absolute URLs. */
export const APP_URL = 'https://demo.playwright.dev/todomvc/';

/** The key the app persists its todo list under. */
export const STORAGE_KEY = 'react-todos';

export type StoredTodo = { id: string; title: string; completed: boolean };

function exactText(title: string): RegExp {
  return new RegExp(`^${title.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`);
}

/**
 * Thin page object over the TodoMVC demo. Locators mirror what the app actually exposes:
 * `data-testid` on the item/title/counter, aria-labels on the per-item controls, and plain
 * roles for the header, filters and "Clear completed".
 */
export class TodoApp {
  readonly page: Page;
  readonly heading: Locator;
  readonly newTodo: Locator;
  readonly items: Locator;
  readonly titles: Locator;
  readonly toggleAll: Locator;
  readonly toggleAllLabel: Locator;
  readonly counter: Locator;
  readonly clearCompleted: Locator;
  readonly filters: Locator;

  constructor(page: Page) {
    this.page = page;
    this.heading = page.getByRole('heading', { name: 'todos' });
    this.newTodo = page.getByPlaceholder('What needs to be done?');
    this.items = page.getByTestId('todo-item');
    this.titles = page.getByTestId('todo-title');
    this.toggleAll = page.getByRole('checkbox', { name: 'Mark all as complete' });
    this.toggleAllLabel = page.locator('label[for="toggle-all"]');
    this.counter = page.getByTestId('todo-count');
    this.clearCompleted = page.getByRole('button', { name: 'Clear completed' });
    this.filters = page.locator('.filters');
  }

  async goto(hash = ''): Promise<void> {
    await this.page.goto(APP_URL + hash);
  }

  /** Adds one todo per title, submitting each with Enter. */
  async add(...titles: string[]): Promise<void> {
    for (const title of titles) {
      await this.newTodo.fill(title);
      await this.newTodo.press('Enter');
      await expect(this.titles.filter({ hasText: exactText(title.trim()) }).last()).toBeVisible();
    }
  }

  /** The <li> whose title is exactly `title`. */
  item(title: string): Locator {
    return this.items.filter({ hasText: exactText(title) });
  }

  toggleOf(title: string): Locator {
    return this.item(title).getByLabel('Toggle Todo');
  }

  /** The per-item delete button. It is `display: none` until the row is hovered. */
  deleteOf(title: string): Locator {
    return this.item(title).getByLabel('Delete');
  }

  /** The inline edit box. Present in the DOM at all times, only visible while editing. */
  editBoxOf(title: string): Locator {
    return this.item(title).getByLabel('Edit');
  }

  /** The delete button is only rendered on hover, so the row has to be hovered first. */
  async deleteTodo(title: string): Promise<void> {
    await this.item(title).hover();
    await this.deleteOf(title).click();
  }

  /**
   * Clicks a todo's checkbox. Unlike `check()`/`uncheck()` this does not assert the resulting
   * checkbox state, which matters when the toggle drops the row out of the current filter.
   */
  async toggleTodo(title: string): Promise<void> {
    await this.toggleOf(title).click();
  }

  filterLink(name: 'All' | 'Active' | 'Completed'): Locator {
    return this.filters.getByRole('link', { name, exact: true });
  }

  /** Double-clicks a title to enter edit mode and waits for the edit box to be ready. */
  async startEditing(title: string): Promise<Locator> {
    await this.item(title).getByTestId('todo-title').dblclick();
    const editBox = this.editBoxOf(title);
    await expect(editBox).toBeFocused();
    return editBox;
  }

  /** Enters edit mode, replaces the text and commits it with Enter. */
  async edit(title: string, newTitle: string): Promise<void> {
    const editBox = await this.startEditing(title);
    await editBox.fill(newTitle);
    await editBox.press('Enter');
  }

  async expectTitles(expected: string[]): Promise<void> {
    await expect(this.titles).toHaveText(expected);
  }

  /** Reads the persisted list straight out of localStorage. */
  async storedTodos(): Promise<StoredTodo[]> {
    return this.page.evaluate(
      (key) => JSON.parse(window.localStorage.getItem(key) ?? '[]') as StoredTodo[],
      STORAGE_KEY,
    );
  }

  async rawStorage(): Promise<string | null> {
    return this.page.evaluate((key) => window.localStorage.getItem(key), STORAGE_KEY);
  }
}

/**
 * Seeds localStorage before any app code runs, so a first page load already has todos.
 * The guard keeps a later reload from clobbering changes the test made through the UI.
 */
export async function seedTodos(page: Page, todos: StoredTodo[]): Promise<void> {
  await page.addInitScript(
    ([key, payload]: [string, string]) => {
      if (!window.localStorage.getItem(key)) window.localStorage.setItem(key, payload);
    },
    [STORAGE_KEY, JSON.stringify(todos)] as [string, string],
  );
}

export function todo(title: string, completed = false): StoredTodo {
  return { id: `seed-${title.replace(/\s+/g, '-')}`, title, completed };
}
