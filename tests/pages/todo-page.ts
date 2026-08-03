import { expect, type Locator, type Page } from '@playwright/test';

export const APP_URL = 'https://demo.playwright.dev/todomvc/';

/** The key the app persists its state under, as observed in the running app. */
export const STORAGE_KEY = 'react-todos';

export type Filter = 'all' | 'active' | 'completed';

export type StoredTodo = { id: string; title: string; completed: boolean };

/** A todo to seed as a precondition. */
export type SeedTodo = { title: string; completed?: boolean };

const HASH_FOR: Record<Filter, string> = {
  all: '#/',
  active: '#/active',
  completed: '#/completed',
};

export function urlFor(filter: Filter = 'all'): string {
  return `${APP_URL}${HASH_FOR[filter]}`;
}

/**
 * Page object for the TodoMVC demo app.
 *
 * Locators are defined once here; tests express intent through the methods.
 */
export class TodoPage {
  readonly newTodoInput: Locator;
  readonly items: Locator;
  readonly titles: Locator;
  readonly counter: Locator;
  readonly toggleAll: Locator;
  readonly clearCompleted: Locator;
  readonly heading: Locator;

  constructor(readonly page: Page) {
    this.newTodoInput = page.getByPlaceholder('What needs to be done?');
    this.items = page.getByTestId('todo-item');
    this.titles = page.getByTestId('todo-title');
    this.counter = page.getByTestId('todo-count');
    // Accessible name is "❯Mark all as complete" (the chevron comes from the label's
    // text), so the substring match of getByLabel is what identifies it.
    this.toggleAll = page.getByLabel('Mark all as complete');
    this.clearCompleted = page.getByRole('button', { name: 'Clear completed' });
    this.heading = page.getByRole('heading', { name: 'todos' });
  }

  // --- navigation -----------------------------------------------------------

  async goto(filter: Filter = 'all'): Promise<void> {
    await this.page.goto(urlFor(filter));
  }

  filterLink(name: 'All' | 'Active' | 'Completed'): Locator {
    return this.page.getByRole('link', { name, exact: true });
  }

  async selectFilter(name: 'All' | 'Active' | 'Completed'): Promise<void> {
    await this.filterLink(name).click();
  }

  // --- adding ---------------------------------------------------------------

  async addTodo(title: string): Promise<void> {
    await this.newTodoInput.fill(title);
    await this.newTodoInput.press('Enter');
  }

  async addTodos(...titles: string[]): Promise<void> {
    for (const title of titles) await this.addTodo(title);
  }

  // --- individual todos -----------------------------------------------------

  /** The list item holding `title`. Addressed by content, never by position. */
  item(title: string): Locator {
    return this.items.filter({ hasText: title });
  }

  toggleFor(title: string): Locator {
    return this.item(title).getByRole('checkbox', { name: 'Toggle Todo' });
  }

  /** The inline editor of a todo. Only in the accessibility tree while editing. */
  editorFor(title: string): Locator {
    return this.item(title).getByRole('textbox', { name: 'Edit' });
  }

  async toggle(title: string): Promise<void> {
    await this.toggleFor(title).click();
  }

  async startEditing(title: string): Promise<Locator> {
    await this.item(title).getByTestId('todo-title').dblclick();
    const editor = this.editorFor(title);
    await expect(editor).toBeVisible();
    return editor;
  }

  /**
   * Edit a todo and commit the change, either with Enter or by moving focus away.
   */
  async editTodo(title: string, newTitle: string, commit: 'enter' | 'blur' = 'enter'): Promise<void> {
    const editor = await this.startEditing(title);
    await editor.fill(newTitle);
    if (commit === 'enter') await editor.press('Enter');
    else await editor.blur();
  }

  /**
   * Delete a todo. The destroy button is `display: none` until its row is hovered,
   * so it is not clickable — nor even in the accessibility tree — before the hover.
   */
  async deleteTodo(title: string): Promise<void> {
    const item = this.item(title);
    await item.hover();
    await item.getByRole('button', { name: 'Delete' }).click();
  }

  // --- preconditions --------------------------------------------------------

  /**
   * Seed todos straight into storage as a *precondition*, then load the app so it
   * reads them. Only for arranging state that a test does not claim to exercise;
   * behaviour under test is always driven through the UI.
   *
   * The reload matters: a hash-only navigation does not reload the page, so the app
   * would keep rendering its in-memory state and ignore what was just written.
   */
  async seed(todos: SeedTodo[], filter: Filter = 'all'): Promise<void> {
    await this.page.goto(urlFor(filter));
    await this.page.evaluate(
      ([key, items]) => window.localStorage.setItem(key as string, JSON.stringify(items)),
      [
        STORAGE_KEY,
        todos.map((todo, index) => ({
          id: `seed-${index}`,
          title: todo.title,
          completed: todo.completed ?? false,
        })),
      ] as const,
    );
    await this.page.reload();
    await expect(this.items).toHaveCount(
      todos.filter((todo) => {
        if (filter === 'active') return !todo.completed;
        if (filter === 'completed') return todo.completed === true;
        return true;
      }).length,
    );
  }

  async storedTodos(): Promise<StoredTodo[] | null> {
    return this.page.evaluate((key) => {
      const raw = window.localStorage.getItem(key);
      return raw === null ? null : (JSON.parse(raw) as StoredTodo[]);
    }, STORAGE_KEY);
  }

  // --- assertion helpers ----------------------------------------------------

  /** Asserts the exact set and order of todo titles currently rendered. */
  async expectVisibleTodos(titles: string[]): Promise<void> {
    await expect(this.titles).toHaveText(titles);
  }

  async expectCounter(text: string): Promise<void> {
    await expect(this.counter).toHaveText(text);
  }

  /**
   * The empty state: the app renders only its header, so the list, the counter,
   * the filters and the toggle-all control are all gone.
   */
  async expectEmptyState(): Promise<void> {
    await expect(this.items).toHaveCount(0);
    await expect(this.counter).toBeHidden();
    await expect(this.toggleAll).toBeHidden();
    await expect(this.clearCompleted).toBeHidden();
    await expect(this.filterLink('All')).toBeHidden();
    await expect(this.heading).toBeVisible();
    await expect(this.newTodoInput).toBeVisible();
  }

  /** Asserts which todos are shown as complete, by their checkbox state. */
  async expectCompletion(states: { title: string; completed: boolean }[]): Promise<void> {
    for (const { title, completed } of states) {
      if (completed) await expect(this.toggleFor(title)).toBeChecked();
      else await expect(this.toggleFor(title)).not.toBeChecked();
    }
  }
}
