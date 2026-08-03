# Measurement — `arms/a-baseline/run-2`

10 sequential runs at `workers=1`, one isolated run per test, one fully parallel run at
`workers=4`. Retries are 0, so every status below is a first attempt.

| Metric | Value |
|---|---|
| Tests generated | 61 |
| First-run pass rate | 100% (61/61) |
| Pass rate across 10 runs | mean 100%, range 100–100% |
| Flake rate | 0% (0 inconsistent across 10 runs) |
| Isolation failures | 0 |
| Parallel failures | 1 |
| Never passed | 0 |
| Passed every run | 61 |

## Per test

| Test | Run 1 | Passed | Flaky | Alone | Parallel |
|---|---|---|---|---|---|
| `adding-todos.spec.ts:12` Adding todos > adds a todo and clears the input | passed | 10/10 | no | passed | passed |
| `adding-todos.spec.ts:22` Adding todos > appends todos in the order they were entered | passed | 10/10 | no | passed | passed |
| `adding-todos.spec.ts:29` Adding todos > trims leading and trailing whitespace from the title | passed | 10/10 | no | passed | passed |
| `adding-todos.spec.ts:38` Adding todos > ignores a submit with an empty input | passed | 10/10 | no | passed | passed |
| `adding-todos.spec.ts:45` Adding todos > ignores a whitespace-only submit and keeps the typed text | passed | 10/10 | no | passed | passed |
| `adding-todos.spec.ts:54` Adding todos > allows duplicate titles as separate todos | passed | 10/10 | no | passed | passed |
| `adding-todos.spec.ts:61` Adding todos > renders markup-like titles as literal text | passed | 10/10 | no | passed | passed |
| `adding-todos.spec.ts:70` Adding todos > keeps very long titles intact | passed | 10/10 | no | passed | passed |
| `adding-todos.spec.ts:77` Adding todos > reveals the list and footer only once the first todo exists | passed | 10/10 | no | passed | passed |
| `app-shell-and-persistence.spec.ts:12` App shell > renders the header and focuses the new-todo field on load | passed | 10/10 | no | passed | passed |
| `app-shell-and-persistence.spec.ts:19` App shell > shows the editing hint and credits in the footer | passed | 10/10 | no | passed | passed |
| `app-shell-and-persistence.spec.ts:27` App shell > starts empty with no list, filters or counter | passed | 10/10 | no | passed | passed |
| `app-shell-and-persistence.spec.ts:34` App shell > loads without console errors from the app itself | passed | 10/10 | no | passed | passed |
| `app-shell-and-persistence.spec.ts:50` Persistence > todos, order and completion survive a reload | passed | 10/10 | no | passed | passed |
| `app-shell-and-persistence.spec.ts:63` Persistence > todos are stored with an id, title and completed flag | passed | 10/10 | no | passed | passed |
| `app-shell-and-persistence.spec.ts:74` Persistence > a previously stored list is restored on first load | passed | 10/10 | no | passed | passed |
| `app-shell-and-persistence.spec.ts:86` Persistence > a fresh browser context starts with an empty list | passed | 10/10 | no | passed | passed |
| `completing-todos.spec.ts:13` Completing todos > checking a todo marks it completed and updates the counter | passed | 10/10 | no | passed | passed |
| `completing-todos.spec.ts:22` Completing todos > unchecking a todo makes it active again | passed | 10/10 | no | passed | passed |
| `completing-todos.spec.ts:31` Completing todos > completion state is persisted | passed | 10/10 | no | passed | passed |
| `completing-todos.spec.ts:44` Completing todos > "Mark all as complete" completes every todo | passed | 10/10 | no | passed | passed |
| `completing-todos.spec.ts:54` Completing todos > unchecking "Mark all as complete" reactivates every todo | passed | 10/10 | no | passed | passed |
| `completing-todos.spec.ts:65` Completing todos > "Mark all as complete" completes the todos left active by a partial selection | passed | 10/10 | no | passed | failed **(new failure)** |
| `completing-todos.spec.ts:73` Completing todos > clicking the "Mark all as complete" label toggles all todos | passed | 10/10 | no | passed | passed |
| `completing-todos.spec.ts:80` Completing todos > "Mark all as complete" reflects the state of the individual todos | passed | 10/10 | no | passed | passed |
| `completing-todos.spec.ts:96` Completing todos > the counter is singular for exactly one remaining todo | passed | 10/10 | no | passed | passed |
| `deleting-todos.spec.ts:13` Deleting todos > the delete button appears only while the row is hovered | passed | 10/10 | no | passed | passed |
| `deleting-todos.spec.ts:20` Deleting todos > deleting removes just that todo | passed | 10/10 | no | passed | passed |
| `deleting-todos.spec.ts:27` Deleting todos > deleting a completed todo updates the "Clear completed" button | passed | 10/10 | no | passed | passed |
| `deleting-todos.spec.ts:38` Deleting todos > deleting the last todo returns the app to its empty state | passed | 10/10 | no | passed | passed |
| `deleting-todos.spec.ts:50` Deleting todos > deletions are persisted | passed | 10/10 | no | passed | passed |
| `deleting-todos.spec.ts:67` Clear completed > the button is hidden while nothing is completed | passed | 10/10 | no | passed | passed |
| `deleting-todos.spec.ts:71` Clear completed > removes completed todos and keeps the active ones | passed | 10/10 | no | passed | passed |
| `deleting-todos.spec.ts:81` Clear completed > clearing every todo returns the app to its empty state | passed | 10/10 | no | passed | passed |
| `deleting-todos.spec.ts:90` Clear completed > the clearing is persisted | passed | 10/10 | no | passed | passed |
| `editing-todos.spec.ts:13` Editing todos > double-clicking a title opens a prefilled, focused edit box | passed | 10/10 | no | passed | passed |
| `editing-todos.spec.ts:21` Editing todos > a single click does not start editing | passed | 10/10 | no | passed | passed |
| `editing-todos.spec.ts:29` Editing todos > Enter saves the new title and leaves edit mode | passed | 10/10 | no | passed | passed |
| `editing-todos.spec.ts:37` Editing todos > saving trims surrounding whitespace | passed | 10/10 | no | passed | passed |
| `editing-todos.spec.ts:43` Editing todos > Escape cancels the edit and restores the original title | passed | 10/10 | no | passed | passed |
| `editing-todos.spec.ts:52` Editing todos > blurring the edit box saves the change | passed | 10/10 | no | passed | passed |
| `editing-todos.spec.ts:61` Editing todos > clearing the title and pressing Enter deletes the todo | passed | 10/10 | no | passed | passed |
| `editing-todos.spec.ts:70` Editing todos > a whitespace-only title deletes the todo | passed | 10/10 | no | passed | passed |
| `editing-todos.spec.ts:78` Editing todos > editing a completed todo keeps it completed | passed | 10/10 | no | passed | passed |
| `editing-todos.spec.ts:88` Editing todos > only one todo is in edit mode at a time | passed | 10/10 | no | passed | passed |
| `editing-todos.spec.ts:96` Editing todos > an edit survives a reload | passed | 10/10 | no | passed | passed |
| `filtering.spec.ts:14` Filtering > All shows every todo and is selected by default | passed | 10/10 | no | passed | passed |
| `filtering.spec.ts:20` Filtering > Active shows only the unfinished todos | passed | 10/10 | no | passed | passed |
| `filtering.spec.ts:28` Filtering > Completed shows only the finished todos | passed | 10/10 | no | passed | passed |
| `filtering.spec.ts:36` Filtering > Completed is empty when nothing is finished, but the chrome stays | passed | 10/10 | no | passed | passed |
| `filtering.spec.ts:46` Filtering > the counter always reports active todos, whatever the filter | passed | 10/10 | no | passed | passed |
| `filtering.spec.ts:53` Filtering > completing a todo removes it from the Active view | passed | 10/10 | no | passed | passed |
| `filtering.spec.ts:61` Filtering > reactivating a todo removes it from the Completed view | passed | 10/10 | no | passed | passed |
| `filtering.spec.ts:70` Filtering > a todo added under the Completed filter is stored but not shown | passed | 10/10 | no | passed | passed |
| `filtering.spec.ts:82` Filtering > "Mark all as complete" also affects todos hidden by the filter | passed | 10/10 | no | passed | passed |
| `filtering.spec.ts:92` Filtering > editing works while a filter is applied | passed | 10/10 | no | passed | passed |
| `filtering.spec.ts:101` Filtering > "Clear completed" works while the Completed filter is applied | passed | 10/10 | no | passed | passed |
| `filtering.spec.ts:121` Hash routing > #/active can be opened directly | passed | 10/10 | no | passed | passed |
| `filtering.spec.ts:129` Hash routing > #/completed can be opened directly | passed | 10/10 | no | passed | passed |
| `filtering.spec.ts:137` Hash routing > an unrecognised hash falls back to showing every todo | passed | 10/10 | no | passed | passed |
| `filtering.spec.ts:145` Hash routing > browser back and forward move between filters | passed | 10/10 | no | passed | passed |

## Convention violations

Gate rules (pinned in docs/protocol.md), across 7 file(s):

| Rule | Hits |
|---|---|
| `playwright/expect-expect` | 6 |
| **total** | **6** |

Informational, not part of the repair gate: `playwright/no-raw-locators` — 12 hit(s).

All files parsed.
