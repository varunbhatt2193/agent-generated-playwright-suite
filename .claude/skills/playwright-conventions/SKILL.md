---
name: playwright-conventions
description: Conventions for writing Playwright end-to-end tests and page objects. Use whenever writing, generating, refactoring or reviewing Playwright tests, locators, fixtures or page objects.
---

# Playwright test conventions

Rules for writing an end-to-end suite that still passes next month, when the markup has moved and the
tests run in a different order on a slower machine.

## Locators

Choose the locator by how a user identifies the element, in this order:

1. `getByRole(...)` with an accessible name — covers buttons, links, checkboxes, headings, textboxes
2. `getByLabel(...)` — form fields with a visible label
3. `getByPlaceholder(...)` — inputs with no label
4. `getByText(...)` — static content
5. `getByTestId(...)` — when nothing above identifies the element
6. A CSS or XPath selector — last resort, and worth a comment saying why

**Address elements by what they contain, not where they sit.** Filter a list by its content:

```ts
const row = page.getByTestId('item').filter({ hasText: 'Ada Lovelace' });
```

Not by index:

```ts
const row = page.getByTestId('item').nth(2);   // breaks when anything is inserted above it
```

Positional access couples every test to list order, so inserting a row makes the suite fail without
the application having broken. Use `.nth()` only when the position *is* the thing under test, such as
asserting sort order.

**Structural containers need semantic locators too.** `page.locator('.footer')` is the same mistake as
any other CSS selector — reach for the landmark role (`getByRole('contentinfo')`) or a test id. Class
names are styling, and styling gets refactored.

## Waiting

Use web-first assertions and let them wait:

```ts
await expect(page.getByRole('listitem')).toHaveCount(3);
```

Never `waitForTimeout`, `networkidle`, or a bare `waitForSelector` before an assertion that already
auto-waits. A fixed sleep is either too short, and the test is flaky, or too long, and the suite is
slow — usually both on different machines. If something genuinely needs waiting for, assert on the
observable state that proves it happened.

## Assertions

**Every test asserts something a user could observe.** Assert on state, never on the existence of a
locator object — `expect(locator)` without a matcher passes no matter what the page does.

**Await every assertion.** An unawaited `expect` reports nothing and turns the test green regardless.

**Check the view, not just the model.** Reading `localStorage`, an API, or internal state is a useful
*extra* assertion, never the only one. A test named for user-visible behaviour that asserts only
against storage will pass while the screen shows something else entirely:

```ts
// insufficient on its own
await expect.poll(() => readStorage()).toEqual([{ title: 'walk the dog' }]);

// assert what is rendered, then optionally corroborate with storage
await expect(page.getByTestId('item-title')).toHaveText(['walk the dog']);
```

A test that cannot fail is worse than no test: it costs the same to run and it buys false confidence.

## Isolation

Every test must pass alone, in any order, and in parallel with the others.

- Set up the state a test needs inside that test, or in a `beforeEach` / fixture — never rely on what
  an earlier test left behind.
- No mutable module-level state shared across tests.
- No `test.describe.serial` unless the sequence itself is what is under test, and then say why in a
  comment.

Before considering a suite finished, run it with `--workers=1` and again fully parallel, and run at
least one test on its own. A test that only passes with its neighbours is a bug in the test.

## Structure

- One page object per screen or major component. Locators are defined once, in its constructor.
- Actions are methods that express intent (`addItem`, `signIn`), not click sequences copied into every
  test.
- Prefer a Playwright fixture for setup that most tests in a file need.
- Name tests for the behaviour they verify — `adds an item to the list`, not `test 2`.

Assertion helpers on a page object are fine and often better than repeating three assertions
everywhere. Be aware that `eslint-plugin-playwright`'s `expect-expect` only recognises `expect` called
directly in the test body, so a suite that delegates assertions to helpers may look assertion-less to
that rule. Configure `assertFunctionNames` rather than abandoning the abstraction.

## Coverage

The happy path is the beginning, not the deliverable. For each feature also cover:

- the empty state, and the transition into and out of it
- invalid input — empty, whitespace-only, over-long, duplicate
- boundaries and off-by-one cases
- state that must survive a reload or a fresh session
- content that could be interpreted as markup, if the app renders user input

## Setting up state

Drive the application through its interface for the behaviour under test. Seeding storage or calling
an API to arrange *preconditions* is legitimate and often faster — seeding a list so a routing test
has something to filter is fine. Using it to perform the action the test claims to exercise is not: a
test called "adds an item" that writes the item straight into storage verifies nothing about adding.

The question to ask is whether the bypass skips the thing named in the test title. If it does, drive
the UI instead.
