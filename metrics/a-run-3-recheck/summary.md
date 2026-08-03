# Measurement — `arms/a-baseline/run-3`

10 sequential runs at `workers=1`, one isolated run per test, one fully parallel run at
`workers=4`. Retries are 0, so every status below is a first attempt.

| Metric | Value |
|---|---|
| Tests generated | 66 |
| First-run pass rate | 100% (66/66) |
| Pass rate across 10 runs | mean 100%, range 100–100% |
| Flake rate | 0% (0 inconsistent across 10 runs) |
| Isolation failures | 0 |
| Parallel failures | 0 |
| Never passed | 0 |
| Passed every run | 66 |

## Per test

| Test | Run 1 | Passed | Flaky | Alone | Parallel |
|---|---|---|---|---|---|
| `adding.spec.ts:4` adding todos > starts empty with a focused input and no list chrome | passed | 10/10 | no | passed | passed |
| `adding.spec.ts:15` adding todos > adds a todo, clears the input and persists it | passed | 10/10 | no | passed | passed |
| `adding.spec.ts:25` adding todos > appends multiple todos in entry order | passed | 10/10 | no | passed | passed |
| `adding.spec.ts:37` adding todos > trims surrounding whitespace from the title | passed | 10/10 | no | passed | passed |
| `adding.spec.ts:44` adding todos > keeps internal whitespace intact | passed | 10/10 | no | passed | passed |
| `adding.spec.ts:50` adding todos > ignores an empty submission | passed | 10/10 | no | passed | passed |
| `adding.spec.ts:58` adding todos > rejects a whitespace-only title and leaves the draft in the input | passed | 10/10 | no | passed | passed |
| `adding.spec.ts:66` adding todos > Escape does not clear the draft in the new-todo input | passed | 10/10 | no | passed | passed |
| `adding.spec.ts:74` adding todos > allows duplicate titles as separate todos | passed | 10/10 | no | passed | passed |
| `adding.spec.ts:85` adding todos > renders markup-like titles as text instead of HTML | passed | 10/10 | no | passed | passed |
| `adding.spec.ts:94` adding todos > gives every todo a distinct id in storage | passed | 10/10 | no | passed | passed |
| `app-shell.spec.ts:4` page chrome and accessibility > shows the header, hint and credits on an empty list | passed | 10/10 | no | passed | passed |
| `app-shell.spec.ts:22` page chrome and accessibility > reveals the list section and footer once a todo exists, and hides them again | passed | 10/10 | no | passed | passed |
| `app-shell.spec.ts:43` page chrome and accessibility > exposes accessible names for the item controls | passed | 10/10 | no | passed | passed |
| `app-shell.spec.ts:62` page chrome and accessibility > keeps the new-todo input focused for consecutive entries | passed | 10/10 | no | passed | passed |
| `app-shell.spec.ts:72` page chrome and accessibility > handles a long title without losing it | passed | 10/10 | no | passed | passed |
| `completing.spec.ts:8` completing todos > marks a single todo complete and back again | passed | 10/10 | no | passed | passed |
| `completing.spec.ts:33` completing todos > uses singular wording for exactly one remaining item | passed | 10/10 | no | passed | passed |
| `completing.spec.ts:44` completing todos > shows "Clear completed" only while something is completed | passed | 10/10 | no | passed | passed |
| `completing.spec.ts:54` completing todos > "Mark all as complete" completes every todo | passed | 10/10 | no | passed | passed |
| `completing.spec.ts:69` completing todos > unchecking "Mark all as complete" reactivates every todo | passed | 10/10 | no | passed | passed |
| `completing.spec.ts:80` completing todos > "Mark all as complete" mirrors the individual checkboxes | passed | 10/10 | no | passed | passed |
| `completing.spec.ts:94` completing todos > "Mark all as complete" also affects todos hidden by the current filter | passed | 10/10 | no | passed | passed |
| `completing.spec.ts:111` completing todos > completion state survives a reload | passed | 10/10 | no | passed | passed |
| `deleting.spec.ts:8` deleting todos > the delete button is revealed by hovering its row | passed | 10/10 | no | passed | passed |
| `deleting.spec.ts:17` deleting todos > deletes the clicked todo only | passed | 10/10 | no | passed | passed |
| `deleting.spec.ts:28` deleting todos > deletes a completed todo and updates the counter | passed | 10/10 | no | passed | passed |
| `deleting.spec.ts:39` deleting todos > deleting the last todo returns the app to its empty state | passed | 10/10 | no | passed | passed |
| `deleting.spec.ts:51` deleting todos > deletions survive a reload | passed | 10/10 | no | passed | passed |
| `deleting.spec.ts:64` clear completed > removes only the completed todos | passed | 10/10 | no | passed | passed |
| `deleting.spec.ts:76` clear completed > clearing every completed todo empties the app | passed | 10/10 | no | passed | passed |
| `deleting.spec.ts:85` clear completed > works while the Completed filter is active and keeps the route | passed | 10/10 | no | passed | passed |
| `deleting.spec.ts:100` clear completed > an emptied list stays empty after a reload | passed | 10/10 | no | passed | passed |
| `editing.spec.ts:8` editing todos > double-clicking a title opens an editor seeded with the current title | passed | 10/10 | no | passed | passed |
| `editing.spec.ts:19` editing todos > Enter saves the new title in place | passed | 10/10 | no | passed | passed |
| `editing.spec.ts:31` editing todos > blurring the editor also saves the edit | passed | 10/10 | no | passed | passed |
| `editing.spec.ts:45` editing todos > Escape cancels the edit and restores the original title | passed | 10/10 | no | passed | passed |
| `editing.spec.ts:59` editing todos > reopening an editor after Escape shows the original title again | passed | 10/10 | no | passed | passed |
| `editing.spec.ts:67` editing todos > saved titles are trimmed | passed | 10/10 | no | passed | passed |
| `editing.spec.ts:78` editing todos > saving an empty title deletes the todo | passed | 10/10 | no | passed | passed |
| `editing.spec.ts:89` editing todos > saving a whitespace-only title deletes the todo | passed | 10/10 | no | passed | passed |
| `editing.spec.ts:96` editing todos > blurring an emptied editor deletes the todo | passed | 10/10 | no | passed | passed |
| `editing.spec.ts:104` editing todos > editing preserves the completed state and list position | passed | 10/10 | no | passed | passed |
| `editing.spec.ts:119` editing todos > only one todo can be edited at a time | passed | 10/10 | no | passed | passed |
| `editing.spec.ts:129` editing todos > an edit survives a reload | passed | 10/10 | no | passed | passed |
| `editing.spec.ts:136` editing todos > a single click on the title does not start editing | passed | 10/10 | no | passed | passed |
| `filtering.spec.ts:9` filtering > All shows every todo and is selected by default | passed | 10/10 | no | passed | passed |
| `filtering.spec.ts:15` filtering > Active shows only unfinished todos | passed | 10/10 | no | passed | passed |
| `filtering.spec.ts:24` filtering > Completed shows only finished todos | passed | 10/10 | no | passed | passed |
| `filtering.spec.ts:32` filtering > the counter always reports active todos regardless of the filter | passed | 10/10 | no | passed | passed |
| `filtering.spec.ts:42` filtering > completing a todo removes it from the Active view | passed | 10/10 | no | passed | passed |
| `filtering.spec.ts:52` filtering > reactivating a todo removes it from the Completed view | passed | 10/10 | no | passed | passed |
| `filtering.spec.ts:62` filtering > a todo added while filtered is stored even though it is hidden | passed | 10/10 | no | passed | passed |
| `filtering.spec.ts:74` filtering > editing works inside a filtered view | passed | 10/10 | no | passed | passed |
| `filtering.spec.ts:84` filtering > deleting works inside a filtered view | passed | 10/10 | no | passed | passed |
| `filtering.spec.ts:94` filtering > the filter links point at the expected routes | passed | 10/10 | no | passed | passed |
| `filtering.spec.ts:100` filtering > back and forward navigation restores the previous filter | passed | 10/10 | no | passed | passed |
| `filtering.spec.ts:119` filtering > an unknown route leaves the current view untouched | passed | 10/10 | no | passed | passed |
| `filtering.spec.ts:135` filtering > loading the app without a hash normalises the URL to #/ | passed | 10/10 | no | passed | passed |
| `persistence.spec.ts:4` persistence > stores todos under the react-todos key as id/title/completed records | passed | 10/10 | no | passed | passed |
| `persistence.spec.ts:14` persistence > restores todos, order and completion after a reload | passed | 10/10 | no | passed | passed |
| `persistence.spec.ts:25` persistence > keeps the active filter across a reload | passed | 10/10 | no | passed | passed |
| `persistence.spec.ts:37` persistence > reloads an all-completed list with the toggle-all box checked | passed | 10/10 | no | passed | passed |
| `persistence.spec.ts:47` persistence > renders todos that were already in localStorage on first load | passed | 10/10 | no | passed | passed |
| `persistence.spec.ts:70` persistence > does not write to storage until the first todo is created | passed | 10/10 | no | passed | passed |
| `persistence.spec.ts:77` persistence > starts from an empty list in a fresh browser context | passed | 10/10 | no | passed | passed |

## Convention violations

Gate rules (pinned in docs/protocol.md), across 8 file(s):

| Rule | Hits |
|---|---|
| `playwright/expect-expect` | 1 |
| **total** | **1** |

Informational, not part of the repair gate: `playwright/no-raw-locators` — 3 hit(s).

All files parsed.
