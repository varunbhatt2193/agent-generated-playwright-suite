# Grep suspects — `arms/a-baseline/run-2`

Pattern matches only. Per the protocol these are **not** counted as violations until confirmed by
reading the code: `page.evaluate` in a test that is genuinely about storage is not a UI bypass, and
`.nth()` on a genuinely positional assertion is not a brittle selector. Tick a box once confirmed.

## Brittle selectors (9)

- [ ] `arms/a-baseline/run-2/adding-todos.spec.ts:78` — `await expect(page.locator('.main')).toBeHidden();`
- [ ] `arms/a-baseline/run-2/adding-todos.spec.ts:79` — `await expect(page.locator('.footer')).toBeHidden();`
- [ ] `arms/a-baseline/run-2/adding-todos.spec.ts:83` — `await expect(page.locator('.main')).toBeVisible();`
- [ ] `arms/a-baseline/run-2/adding-todos.spec.ts:84` — `await expect(page.locator('.footer')).toBeVisible();`
- [ ] `arms/a-baseline/run-2/deleting-todos.spec.ts:44` — `await expect(page.locator('.main')).toBeHidden();`
- [ ] `arms/a-baseline/run-2/deleting-todos.spec.ts:45` — `await expect(page.locator('.footer')).toBeHidden();`
- [ ] `arms/a-baseline/run-2/deleting-todos.spec.ts:86` — `await expect(page.locator('.footer')).toBeHidden();`
- [ ] `arms/a-baseline/run-2/filtering.spec.ts:41` — `await expect(page.locator('.footer')).toBeVisible();`
- [ ] `arms/a-baseline/run-2/helpers/todo-app.ts:42` — `this.filters = page.locator('.filters');`

## UI bypass (7)

- [ ] `arms/a-baseline/run-2/helpers/todo-app.ts:114` — `/** Reads the persisted list straight out of localStorage. */`
- [ ] `arms/a-baseline/run-2/helpers/todo-app.ts:116` — `return this.page.evaluate(`
- [ ] `arms/a-baseline/run-2/helpers/todo-app.ts:117` — `(key) => JSON.parse(window.localStorage.getItem(key) ?? '[]') as StoredTodo[],`
- [ ] `arms/a-baseline/run-2/helpers/todo-app.ts:123` — `return this.page.evaluate((key) => window.localStorage.getItem(key), STORAGE_KEY);`
- [ ] `arms/a-baseline/run-2/helpers/todo-app.ts:128` — `* Seeds localStorage before any app code runs, so a first page load already has todos.`
- [ ] `arms/a-baseline/run-2/helpers/todo-app.ts:132` — `await page.addInitScript(`
- [ ] `arms/a-baseline/run-2/helpers/todo-app.ts:134` — `if (!window.localStorage.getItem(key)) window.localStorage.setItem(key, payload);`
