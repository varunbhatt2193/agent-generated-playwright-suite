# Grep suspects — `arms/a-baseline/run-1`

Pattern matches only. Per the protocol these are **not** counted as violations until confirmed by
reading the code: `page.evaluate` in a test that is genuinely about storage is not a UI bypass, and
`.nth()` on a genuinely positional assertion is not a brittle selector. Tick a box once confirmed.

## UI bypass (7)

- [ ] `arms/a-baseline/run-1/persistence.spec.ts:41` — `test(`writes the list to localStorage under "${STORAGE_KEY}"`, async ({ page }) => {`
- [ ] `arms/a-baseline/run-1/todo-app.ts:6` — `/** The app persists its list under this localStorage key. */`
- [ ] `arms/a-baseline/run-1/todo-app.ts:50` — `/** Seed localStorage before the app boots, so a run can start from a known list. */`
- [ ] `arms/a-baseline/run-1/todo-app.ts:52` — `await this.page.addInitScript(`
- [ ] `arms/a-baseline/run-1/todo-app.ts:53` — `([key, value]) => window.localStorage.setItem(key, value),`
- [ ] `arms/a-baseline/run-1/todo-app.ts:116` — `return this.page.evaluate((key) => {`
- [ ] `arms/a-baseline/run-1/todo-app.ts:117` — `const raw = window.localStorage.getItem(key);`
