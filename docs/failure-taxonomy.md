# Failure taxonomy — arm A (no skill)

Three generation runs, 193 tests, measured under `docs/protocol.md`. Every count below comes from
`metrics/a-run-{1,2,3}/`; every classification comes from reading the code, with the snippet quoted so
the judgment can be argued with.

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

## What this implies for the skill

Arm B's skill is written against what was actually observed rather than what was expected: prefer
semantic locators over CSS classes for structural elements (run 2's nine hits), address items by
content rather than list position (run 3), and assert on what the user can see, with storage checks as
a supplement rather than a substitute (run 3's one test). Whether stating those conventions changes
anything is the question arm B answers — and with a baseline this strong, "no measurable difference"
is a plausible outcome that will be reported as readily as any other.
