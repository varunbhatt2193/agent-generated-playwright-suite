# Grep suspects — `arms/b-skill/run-2`

Pattern matches only. Per the protocol these are **not** counted as violations until confirmed by
reading the code: `page.evaluate` in a test that is genuinely about storage is not a UI bypass, and
`.nth()` on a genuinely positional assertion is not a brittle selector. Tick a box once confirmed.

## Brittle selectors (3)

- [ ] `arms/b-skill/run-2/adding-todos.spec.ts:94` — `await expect(todoPage.page.locator('.todo-list img')).toHaveCount(0);`
- [ ] `arms/b-skill/run-2/adding-todos.spec.ts:95` — `await expect(todoPage.page.locator('.todo-list b')).toHaveCount(0);`
- [ ] `arms/b-skill/run-2/editing-todos.spec.ts:97` — `await expect(todoPage.page.locator('.todo-list b')).toHaveCount(0);`

## UI bypass (8)

- [ ] `arms/b-skill/run-2/adding-todos.spec.ts:96` — `expect(await todoPage.page.evaluate(() => (window as any).__xss ?? null)).toBeNull();`
- [ ] `arms/b-skill/run-2/fixtures.ts:5` — `* Every test gets a fresh browser context, so localStorage always starts empty and the tests are`
- [ ] `arms/b-skill/run-2/pages/todo-page.ts:6` — `/** The React implementation persists the whole list under this localStorage key. */`
- [ ] `arms/b-skill/run-2/pages/todo-page.ts:160` — `await this.page.evaluate(`
- [ ] `arms/b-skill/run-2/pages/todo-page.ts:161` — `([key, value]) => localStorage.setItem(key, value),`
- [ ] `arms/b-skill/run-2/pages/todo-page.ts:169` — `return this.page.evaluate(`
- [ ] `arms/b-skill/run-2/pages/todo-page.ts:170` — `key => JSON.parse(localStorage.getItem(key) ?? '[]') as StoredTodo[],`
- [ ] `arms/b-skill/run-2/persistence.spec.ts:88` — `expect(await todoPage.page.evaluate(key => localStorage.getItem(key), STORAGE_KEY)).toBeNull();`
