# Grep suspects — `arms/b-skill/run-1`

Pattern matches only. Per the protocol these are **not** counted as violations until confirmed by
reading the code: `page.evaluate` in a test that is genuinely about storage is not a UI bypass, and
`.nth()` on a genuinely positional assertion is not a brittle selector. Tick a box once confirmed.

## Brittle selectors (4)

- [ ] `arms/b-skill/run-1/add-todo.spec.ts:87` — `await expect(todoPage.page.locator('.todo-list b')).toHaveCount(0);`
- [ ] `arms/b-skill/run-1/add-todo.spec.ts:88` — `await expect(todoPage.page.locator('.todo-list script')).toHaveCount(0);`
- [ ] `arms/b-skill/run-1/delete-todo.spec.ts:34` — `const first = todoPage.items.nth(0);`
- [ ] `arms/b-skill/run-1/edit-todo.spec.ts:129` — `await expect(todoPage.page.locator('.todo-list i')).toHaveCount(0);`

## UI bypass (5)

- [ ] `arms/b-skill/run-1/fixtures.ts:5` — `* Every test gets its own browser context, so localStorage starts empty and tests`
- [ ] `arms/b-skill/run-1/pages/todo-page.ts:135` — `await this.page.evaluate(`
- [ ] `arms/b-skill/run-1/pages/todo-page.ts:136` — `([key, items]) => window.localStorage.setItem(key as string, JSON.stringify(items)),`
- [ ] `arms/b-skill/run-1/pages/todo-page.ts:157` — `return this.page.evaluate((key) => {`
- [ ] `arms/b-skill/run-1/pages/todo-page.ts:158` — `const raw = window.localStorage.getItem(key);`
