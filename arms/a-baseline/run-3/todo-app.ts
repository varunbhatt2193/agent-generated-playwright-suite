import { expect, test as base, type Locator, type Page } from '@playwright/test';

/**
 * Shared fixture + page object for the TodoMVC demo.
 *
 * Everything here was derived by driving the real app in a browser, not from generic TodoMVC
 * assumptions. Behaviours worth remembering while reading the specs:
 *
 *  - Todos live in localStorage under `react-todos` as `[{id, title, completed}]`.
 *  - The `.main` section and `.footer` are only rendered while at least one todo exists.
 *  - The per-item delete button is `display: none` until its row is hovered, so it must be
 *    hovered before it can be clicked.
 *  - While a row is being edited its `.view` (checkbox + label + delete) is hidden and the
 *    row's "Edit" textbox is the only visible control for it.
 */

export const APP_URL = 'https://demo.playwright.dev/todomvc/';
export const STORAGE_KEY = 'react-todos';

export type StoredTodo = { id: string; title: string; completed: boolean };

export class TodoPage {
  readonly newTodo: Locator;
  readonly items: Locator;
  readonly titles: Locator;
  readonly toggleAll: Locator;
  readonly counter: Locator;
  readonly clearCompleted: Locator;
  readonly filterAll: Locator;
  readonly filterActive: Locator;
  readonly filterCompleted: Locator;

  constructor(readonly page: Page) {
    this.newTodo = page.getByPlaceholder('What needs to be done?');
    this.items = page.getByTestId('todo-item');
    this.titles = page.getByTestId('todo-title');
    this.toggleAll = page.getByRole('checkbox', { name: 'Mark all as complete' });
    this.counter = page.getByTestId('todo-count');
    this.clearCompleted = page.getByRole('button', { name: 'Clear completed' });
    this.filterAll = page.getByRole('link', { name: 'All', exact: true });
    this.filterActive = page.getByRole('link', { name: 'Active', exact: true });
    this.filterCompleted = page.getByRole('link', { name: 'Completed', exact: true });
  }

  /** `hash` is appended verbatim, e.g. `#/active`. */
  async goto(hash = ''): Promise<void> {
    await this.page.goto(APP_URL + hash);
  }

  item(index: number): Locator {
    return this.items.nth(index);
  }

  toggleOf(index: number): Locator {
    return this.item(index).getByRole('checkbox', { name: 'Toggle Todo' });
  }

  titleOf(index: number): Locator {
    return this.item(index).getByTestId('todo-title');
  }

  /**
   * Located by class rather than by role: the button is `display: none` until its row is
   * hovered, which also removes it from the accessibility tree, so a role-based locator would
   * simply not resolve while the row is idle.
   */
  deleteButtonOf(index: number): Locator {
    return this.item(index).locator('button.destroy');
  }

  /** Same reasoning as `deleteButtonOf`: the edit box is hidden unless the row is being edited. */
  editorOf(index: number): Locator {
    return this.item(index).locator('input.edit');
  }

  /** Types each title and waits for the list to grow. Only valid when the new todos are visible. */
  async add(...titles: string[]): Promise<void> {
    for (const title of titles) {
      const before = await this.items.count();
      await this.submitNewTodo(title);
      await expect(this.items).toHaveCount(before + 1);
    }
  }

  /** Types a title and presses Enter without assuming anything is added (or shown). */
  async submitNewTodo(text: string): Promise<void> {
    await this.newTodo.fill(text);
    await this.newTodo.press('Enter');
  }

  async toggle(index: number): Promise<void> {
    await this.toggleOf(index).click();
  }

  /** The delete button only exists visually on hover, so hover the row first. */
  async remove(index: number): Promise<void> {
    const item = this.item(index);
    await item.hover();
    await item.getByRole('button', { name: 'Delete' }).click();
  }

  /** Double-clicks the title and returns the row's focused edit box. */
  async startEditing(index: number): Promise<Locator> {
    await this.titleOf(index).dblclick();
    const editor = this.editorOf(index);
    await expect(editor).toBeFocused();
    return editor;
  }

  async editAndCommit(index: number, newTitle: string): Promise<void> {
    const editor = await this.startEditing(index);
    await editor.fill(newTitle);
    await editor.press('Enter');
  }

  async storedTodos(): Promise<StoredTodo[] | null> {
    return this.page.evaluate((key) => {
      const raw = window.localStorage.getItem(key);
      return raw === null ? null : (JSON.parse(raw) as StoredTodo[]);
    }, STORAGE_KEY);
  }

  /** Polls localStorage until it matches the expected title/completed pairs, in order. */
  async expectStored(expected: Array<{ title: string; completed: boolean }>): Promise<void> {
    await expect
      .poll(async () =>
        ((await this.storedTodos()) ?? []).map(({ title, completed }) => ({ title, completed })),
      )
      .toEqual(expected);
  }
}

export const test = base.extend<{ todo: TodoPage }>({
  todo: async ({ page }, use) => {
    const todo = new TodoPage(page);
    await todo.goto();
    await use(todo);
  },
});

export { expect };
