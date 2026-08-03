# Grep suspects — `arms/b-skill/run-3`

Pattern matches only. Per the protocol these are **not** counted as violations until confirmed by
reading the code: `page.evaluate` in a test that is genuinely about storage is not a UI bypass, and
`.nth()` on a genuinely positional assertion is not a brittle selector. Tick a box once confirmed.

## Brittle selectors (3)

- [ ] `arms/b-skill/run-3/deleting.spec.ts:54` — `await todoPage.items.nth(3).hover();`
- [ ] `arms/b-skill/run-3/deleting.spec.ts:55` — `await todoPage.items.nth(3).getByRole('button', { name: 'Delete' }).click();`
- [ ] `arms/b-skill/run-3/pages/todo-page.ts:155` — `await expect(this.page.locator('.filters a.selected')).toHaveText(name);`

## UI bypass (3)

- [ ] `arms/b-skill/run-3/fixtures.ts:5` — `* Every test gets its own browser context, so the app's localStorage starts empty and tests stay`
- [ ] `arms/b-skill/run-3/pages/todo-page.ts:8` — `/** Shape of a single entry in the app's `react-todos` localStorage key. */`
- [ ] `arms/b-skill/run-3/pages/todo-page.ts:138` — `return this.page.evaluate(() => JSON.parse(window.localStorage.getItem('react-todos') ?? '[]'));`
