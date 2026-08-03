# Failure taxonomy

Six generation runs, 402 tests, measured under `docs/protocol.md`. Sections 1–6 catalogue arm A (no
skill); the arm B comparison and the headline result are at the end. Every count comes from
`metrics/`; every classification comes from reading the code, with the snippet quoted so the judgment
can be argued with.

**If you read one thing, read [The gate inverts the comparison](#the-gate-inverts-the-comparison).**

Method: the pinned ESLint gate and the grep heuristics flag suspects mechanically, then each suspect
is confirmed or rejected by hand. Run 1 was additionally read end to end, all eight files.

## The headline is that the premise did not hold

This project was designed expecting an agent to produce brittle tests worth cataloguing. It largely
did not:

| | Run 1 | Run 2 | Run 3 |
|---|---|---|---|
| Tests | 66 | 61 | 66 |
| First-run pass rate | 100% | 100% | 100% |
| Pass rate over 10 runs | 100% | 100% | 99.9% (98.5–100) |
| Flaky tests | 0 | 0 | 1 |
| Isolation failures | 0 | 0 | 0 |
| Parallel failures (workers=4) | 0 | 0 | 0 |
| Gate violations (raw) | 0 | 6 | 1 |
| Gate violations (confirmed) | 0 | 0 | 0 |
| Confirmed brittle selectors | 0 | 9 | 1 |

All three runs, unprompted, produced a page object, semantic locators and web-first assertions. The
interesting findings are therefore not "the agent writes bad tests" — they are the variance between
identical runs, one real weakness, and two ways the measuring instruments were wrong.

## 1. Hard waits

**Zero, across all three runs.** No `waitForTimeout`, no `setTimeout`, no `networkidle`, no
`waitForSelector`. Every wait is an auto-waiting assertion:

```ts
await app.remove('two');
await expect(app.titles).toHaveText(['one', 'three']);   // run 1, removing.spec.ts:21
```

This is the failure mode the project most expected to find, and it did not appear once in 193 tests.

## 2. Brittle selectors

**The one category with real hits, and it is entirely a run-2 phenomenon.** Run 2 reached for CSS
class selectors nine times for structural elements, where run 1 and run 3 used roles or test ids for
the same assertions:

```ts
await expect(page.locator('.main')).toBeHidden();     // run 2, adding-todos.spec.ts:78
await expect(page.locator('.footer')).toBeHidden();   // run 2, adding-todos.spec.ts:79
this.filters = page.locator('.filters');              // run 2, helpers/todo-app.ts:42
```

Run 3 contributes a different variety — positional indexing, where the page object addresses todos by
list position rather than by content:

```ts
return this.items.nth(index);       // run 3, todo-app.ts:51
await todo.toggle(1);               // run 3, completing.spec.ts — "the second one", whichever that is
```

Positional access is not wrong on its own, but it couples every test to list order: insert a todo at
the top and the suite fails without the app having broken. Run 1 addressed items by title
(`items.filter({ hasText: ... })`) and has no such coupling.

Rejected on inspection: run 1's single raw-locator hit is
`await expect(app.titles.first().locator('b')).toHaveCount(0)` — asserting that markup in a title is
rendered as literal text. There is no role or label for "a `<b>` element that should not exist", so a
raw locator is the correct tool.

## 3. Order dependence

**Zero confirmed.** Each of the 193 tests was also run alone and the whole suite was run at
`workers=4` fully parallel; no result changed in either condition.

The heuristic flagged the shared `let app: TodoApp` that every run declares at describe scope:

```ts
let app: TodoApp;
test.beforeEach(async ({ page }) => { app = await openApp(page); });   // run 1, adding.spec.ts:5
```

Rejected: `beforeEach` reassigns it per test, each test gets its own `page` fixture, and parallel
tests run in separate worker processes with separate module instances. The isolation and parallel
probes confirm it empirically rather than by argument.

## 4. Assertions that cannot fail

**Zero genuinely vacuous assertions.** No `expect(true).toBe(true)`, no unawaited assertions, and no
asserting on a locator's existence in place of its state.

One real weakness, in run 3: a test whose name describes user-visible behaviour but which only
asserts against `localStorage`.

```ts
test('keeps internal whitespace intact', async ({ todo }) => {
  await todo.add('walk  the   dog');
  await todo.expectStored([{ title: 'walk  the   dog', completed: false }]);   // run 3, adding.spec.ts:44
});
```

The app could render that title with collapsed whitespace and this test would still pass. It verifies
the model, not the view, while claiming the view. It is the only such test in 193.

## 5. Missing negative cases

**Not a weakness in any run.** Coverage went well past the happy path unprompted — empty and
whitespace-only submissions, duplicate titles, a 300-character title, markup rendered as literal text,
Escape discarding an edit, an emptied title deleting the todo, the empty-state chrome disappearing,
an unknown route falling back to "All", and browser back/forward across filters:

```ts
test('ignores a whitespace-only title and keeps the text in the input', async () => {
  await app.newTodo.fill('     ');
  await app.newTodo.press('Enter');
  await expect(app.items).toHaveCount(0);
  await expect(app.newTodo).toHaveValue('     ');    // run 1, adding.spec.ts:50
});
```

Run 3 went further and added an injection check, asserting that a title containing a `<script>` tag
neither renders as an element nor executes.

## 6. UI bypass

**Zero confirmed on the setup side.** All three runs seed `localStorage` via `addInitScript`, and in
every case it establishes a precondition for a test about something else — restoring a previous
session, or opening a filter route directly:

```ts
await app.seed([{ id: 'a', title: 'one', completed: false }, ...]);
await app.goto('#/completed');
await expect(app.titles).toHaveText(['two']);        // run 1, filters.spec.ts:136
```

The behaviour under test — the route producing a filtered view — is exercised through the interface.
Seeding is fixture setup, not a bypass. This is a judgment call and the snippet is quoted so it can be
disputed; the line taken here is that a bypass means reaching past the UI to perform *the action the
test claims to test*, not to arrange the world before it.

The assertion-side bypass in run 3 (section 4) is the one case that crosses that line.

## What the instruments got wrong

This turned out to be as interesting as the tests themselves.

**`expect-expect` produced seven hits and all seven are false positives.** Every one is a test that
asserts through a page-object helper:

```ts
test('saving trims surrounding whitespace', async () => {
  await app.edit('one', '   spaced out   ');
  await app.expectTitles(['spaced out', 'two']);     // run 2, editing-todos.spec.ts:37
});

async expectTitles(expected: string[]): Promise<void> {
  await expect(this.titles).toHaveText(expected);    // run 2, helpers/todo-app.ts:110
}
```

The rule only recognises `expect` called directly in the test body. So the automated convention score
penalised the run that abstracted its assertions *more* — exactly backwards. Taken at face value it
would have reported run 2 as the worst of the three; on inspection run 2's real problem is elsewhere
entirely, in its CSS selectors. A metric that ranks the runs incorrectly is worth more attention than
one that merely miscounts.

**The grep heuristics fired 33 times and 11 survived confirmation.** The rest were comments
mentioning `localStorage`, and storage assertions in tests that are legitimately about storage:

```ts
/** Seed localStorage before the app boots, so a run can start from a known list. */   // matched, is a comment
```

Both instruments stay in the protocol — they are why the nine real CSS selectors in run 2 were found
at all. But a clean automated result on generated tests should not be read as a clean suite, and this
is the evidence for that claim rather than an assertion of it.

## The one flaky test

Run 3, `completing.spec.ts:111`, passed 9 of 10 runs. The failure was a 30-second timeout in
`beforeEach`, navigating to the live app — the network, not the test logic. It passed alone and under
parallel load. Recorded as flake because the protocol counts an inconsistent result as flake
regardless of cause, and noted here as environmental because that is what the trace shows.

---

# Arm B — the same prompt, plus a conventions skill

The skill was written against the weaknesses above: semantic locators for structural elements, address
items by content rather than position, assert on the rendered view. All three arm B transcripts
confirm it loaded before any test was written.

Both arms were re-measured back to back, interleaved A/B/A/B/A/B, because arm A's first measurement
ran while the machine was under heavy memory load and its one flaky test was a navigation timeout —
comparing that against arm B on a quiet machine would have credited the skill for a closed browser.
The recheck bore that out: arm A's flake disappeared under quiet conditions. Machine conditions are
recorded in `metrics/conditions.md`.

| | A1 | A2 | A3 | B1 | B2 | B3 |
|---|---|---|---|---|---|---|
| Tests | 66 | 61 | 66 | 71 | 74 | 64 |
| First-run pass rate | 100% | 100% | 100% | 100% | 100% | 100% |
| Flake rate | 0% | 0% | 0% | 0% | 1.4% | 0% |
| Isolation failures | 0 | 0 | 0 | 0 | 0 | 0 |
| Parallel failures | 0 | 1 | 0 | 0 | 0 | 0 |
| **Gate violations (raw)** | 0 | 6 | 1 | **28** | **16** | **31** |
| **Confirmed brittle selectors** | 0 | 11 | 2 | **0** | **0** | **1** |
| Generation cost | $2.64 | $2.01 | — | $3.71 | $2.96 | $2.45 |

## The gate inverts the comparison

Read the raw gate row and arm B is catastrophically worse: 75 violations to arm A's 7, more than ten
times as many. Read the confirmed row and arm B is dramatically better: 1 real brittle selector to arm
A's 13.

Both rows are correct. They disagree because **every one of arm B's 75 gate hits is a false positive**,
and they are false positives *caused by the skill working*. The skill tells the agent to put assertion
helpers on the page object; arm B did exactly that; `expect-expect` cannot see an assertion inside a
helper:

```ts
async expectVisibleTodos(titles: string[]): Promise<void> {
  await expect(this.titles).toHaveText(titles);     // arm B run 1, pages/todo-page.ts
}
```

Arm B run 3 adds a second variety — `valid-expect` firing six times on assertions built through a
variable, which are also real and also awaited:

```ts
const assertion = visible ? expect(this.toggleAllCheckbox) : expect(this.toggleAllCheckbox).not;
await assertion.toBeVisible();                       // arm B run 3, pages/todo-page.ts:166
```

The lesson generalises past this repo: **an automated rubric measures what it can parse, and an
intervention that changes code structure can move a suite outside what the rubric parses.** Any A/B of
a coding agent that scores output automatically is exposed to this, and the failure is silent — the
numbers stay plausible, they just point the wrong way. Nothing in the raw counts hints that the
worse-scoring arm is the better one. Only reading the code found it.

This is also why `arms/b-skill/repaired/` contains no repairs. Satisfying the pre-registered "zero gate
violations" criterion would have meant deleting the helpers to please a rule that is wrong about them.

## Where the skill actually changed the output

**Brittle selectors — the thing it targeted.** Arm A used CSS class selectors for structural elements
eleven times in run 2 alone (`.main`, `.footer`, `.filters`, `li.editing`, `label[for="toggle-all"]`)
and twice more in run 3 (`button.destroy`, `input.edit`). Arm B used one, in a single page object:

```ts
await expect(this.page.locator('.filters a.selected')).toHaveText(name);   // arm B run 3, the only one
```

Every other raw locator in arm B — nine across three runs — is a markup-injection check of the form
`locator('b')` or `locator('script')`, asserting that user input is not rendered as an element. There
is no role or label for "a tag that should not exist", so those are correct usage in both arms.

**Consistency, which matters more than the mean.** Arm A's raw-locator count per run was 1, 12, 3.
Arm B's was 3, 3, 3. The skill's clearest effect is not that the best run got better — arm A run 1 was
already clean — but that the worst run stopped happening. For anyone deciding whether to write a skill,
that is the argument: it raises the floor.

**Structure.** All three arm B runs produced a `pages/` directory and a `fixtures.ts` supplying a
Playwright fixture; no arm A run created a fixture file at all.

```ts
export const test = base.extend<{ todoPage: TodoPage }>({
  todoPage: async ({ page }, use) => { ... },        // arm B run 1, fixtures.ts
});
```

**Volume.** 209 tests to arm A's 193, about 8% more.

## Where it changed nothing

First-run pass rate was 100% in all six runs, with or without the skill. Isolation and parallel
behaviour were clean in both arms. Flake was indistinguishable from zero in both once measured under
matched conditions — the two flaky results across all twelve measured suites were both navigation
timeouts, and both vanished on re-measurement.

Hard waits were absent from all 402 tests. The failure mode this project was built to catalogue never
appeared, in either arm, and the skill's rule against it had nothing to prevent.

## What it cost

Arm B averaged $3.04 per run against arm A's $2.33, roughly 30% more, and took more turns —
78, 46 and 38 against arm A's 44 and 32. The skill makes the agent work harder. On this evidence it
buys a higher floor on locator quality and a consistent test structure, and buys nothing at all on
pass rate, flake or isolation, because there was nothing left to buy.
