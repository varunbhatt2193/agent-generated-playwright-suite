# Grep suspects — `arms/a-baseline/run-3`

Pattern matches only. Per the protocol these are **not** counted as violations until confirmed by
reading the code: `page.evaluate` in a test that is genuinely about storage is not a UI bypass, and
`.nth()` on a genuinely positional assertion is not a brittle selector. Tick a box once confirmed.

## Brittle selectors (2)

- [ ] `arms/a-baseline/run-3/adding.spec.ts:90` — `await expect(page.locator('.todo-list img')).toHaveCount(0);`
- [ ] `arms/a-baseline/run-3/todo-app.ts:51` — `return this.items.nth(index);`

## UI bypass (8)

- [ ] `arms/a-baseline/run-3/adding.spec.ts:91` — `expect(await page.evaluate(() => (window as unknown as { __pwned?: boolean }).__pwned)).toBeUndefined();`
- [ ] `arms/a-baseline/run-3/persistence.spec.ts:47` — `test('renders todos that were already in localStorage on first load', async ({ page }) => {`
- [ ] `arms/a-baseline/run-3/persistence.spec.ts:49` — `await page.addInitScript(`
- [ ] `arms/a-baseline/run-3/persistence.spec.ts:50` — `([key, value]) => window.localStorage.setItem(key, value),`
- [ ] `arms/a-baseline/run-3/todo-app.ts:9` — `*  - Todos live in localStorage under `react-todos` as `[{id, title, completed}]`.`
- [ ] `arms/a-baseline/run-3/todo-app.ts:117` — `return this.page.evaluate((key) => {`
- [ ] `arms/a-baseline/run-3/todo-app.ts:118` — `const raw = window.localStorage.getItem(key);`
- [ ] `arms/a-baseline/run-3/todo-app.ts:123` — `/** Polls localStorage until it matches the expected title/completed pairs, in order. */`
