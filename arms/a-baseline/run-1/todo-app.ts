import { expect, Locator, Page } from '@playwright/test';

/** No baseURL is configured in playwright.config.ts, so the app URL lives here. */
export const APP_URL = 'https://demo.playwright.dev/todomvc/';

/** The app persists its list under this localStorage key. */
export const STORAGE_KEY = 'react-todos';

export type StoredTodo = { id: string; title: string; completed: boolean };

function escapeRegExp(text: string): string {
  return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Page object for the TodoMVC demo. Locators are built from the roles, labels and test ids the app
 * actually exposes: `data-testid` on the item / title / counter, `aria-label` on the toggle, delete
 * and edit controls.
 */
export class TodoApp {
  readonly page: Page;
  readonly newTodo: Locator;
  readonly items: Locator;
  readonly titles: Locator;
  readonly todoCount: Locator;
  readonly toggleAll: Locator;
  readonly clearCompleted: Locator;
  readonly filterAll: Locator;
  readonly filterActive: Locator;
  readonly filterCompleted: Locator;

  constructor(page: Page) {
    this.page = page;
    this.newTodo = page.getByPlaceholder('What needs to be done?');
    this.items = page.getByTestId('todo-item');
    this.titles = page.getByTestId('todo-title');
    this.todoCount = page.getByTestId('todo-count');
    this.toggleAll = page.getByRole('checkbox', { name: 'Mark all as complete' });
    this.clearCompleted = page.getByRole('button', { name: 'Clear completed' });
    this.filterAll = page.getByRole('link', { name: 'All', exact: true });
    this.filterActive = page.getByRole('link', { name: 'Active', exact: true });
    this.filterCompleted = page.getByRole('link', { name: 'Completed', exact: true });
  }

  /** Navigate to the app, optionally at a specific route hash such as `#/active`. */
  async goto(hash = ''): Promise<void> {
    await this.page.goto(APP_URL + hash);
  }

  /** Seed localStorage before the app boots, so a run can start from a known list. */
  async seed(todos: StoredTodo[]): Promise<void> {
    await this.page.addInitScript(
      ([key, value]) => window.localStorage.setItem(key, value),
      [STORAGE_KEY, JSON.stringify(todos)] as const,
    );
  }

  async add(...todoTitles: string[]): Promise<void> {
    for (const title of todoTitles) {
      await this.newTodo.fill(title);
      await this.newTodo.press('Enter');
    }
    await expect(this.newTodo).toHaveValue('');
  }

  /** The list item whose title matches `title` exactly. */
  item(title: string): Locator {
    return this.items.filter({ hasText: new RegExp(`^${escapeRegExp(title)}$`) });
  }

  toggleOf(title: string): Locator {
    return this.item(title).getByRole('checkbox', { name: 'Toggle Todo' });
  }

  deleteButtonOf(title: string): Locator {
    return this.item(title).getByRole('button', { name: 'Delete' });
  }

  editBoxOf(title: string): Locator {
    return this.item(title).getByRole('textbox', { name: 'Edit' });
  }

  /**
   * Toggling from a filtered view can remove the row from the DOM, so click the checkbox rather
   * than using check()/uncheck(), which re-reads the (now missing) element to verify the state.
   */
  async toggle(title: string): Promise<void> {
    await this.toggleOf(title).click();
  }

  /**
   * The delete button is `display: none` until its row is hovered, and Playwright checks
   * visibility before it moves the mouse, so hover the row first.
   */
  async remove(title: string): Promise<void> {
    await this.item(title).hover();
    await this.deleteButtonOf(title).click();
  }

  /** Enter edit mode via double click, as the app's own footer instructs. */
  async startEditing(title: string): Promise<Locator> {
    await this.item(title).getByTestId('todo-title').dblclick();
    const editBox = this.editBoxOf(title);
    await expect(editBox).toBeFocused();
    return editBox;
  }

  async editTo(title: string, newTitle: string, commit: 'Enter' | 'blur' | 'Escape' = 'Enter') {
    const editBox = await this.startEditing(title);
    await editBox.fill(newTitle);
    if (commit === 'blur') await editBox.blur();
    else await editBox.press(commit);
  }

  async readStorage(): Promise<StoredTodo[] | null> {
    return this.page.evaluate((key) => {
      const raw = window.localStorage.getItem(key);
      return raw === null ? null : (JSON.parse(raw) as StoredTodo[]);
    }, STORAGE_KEY);
  }
}

/** Convenience for `new TodoApp(page)` followed by a navigation. */
export async function openApp(page: Page, hash = ''): Promise<TodoApp> {
  const app = new TodoApp(page);
  await app.goto(hash);
  return app;
}
