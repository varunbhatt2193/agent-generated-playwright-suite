# Measurement — `arms/b-skill/run-2`

10 sequential runs at `workers=1`, one isolated run per test, one fully parallel run at
`workers=4`. Retries are 0, so every status below is a first attempt.

| Metric | Value |
|---|---|
| Tests generated | 74 |
| First-run pass rate | 100% (74/74) |
| Pass rate across 10 runs | mean 99.9%, range 98.6–100% |
| Flake rate | 1.4% (1 inconsistent across 10 runs) |
| Isolation failures | 0 |
| Parallel failures | 0 |
| Never passed | 0 |
| Passed every run | 73 |

## Per test

| Test | Run 1 | Passed | Flaky | Alone | Parallel |
|---|---|---|---|---|---|
| `adding-todos.spec.ts:4` adding todos > starts with an empty list and no list furniture | passed | 10/10 | no | passed | passed |
| `adding-todos.spec.ts:10` adding todos > adds a todo and reveals the list, counter and filters | passed | 10/10 | no | passed | passed |
| `adding-todos.spec.ts:20` adding todos > clears the input after a todo is added | passed | 10/10 | no | passed | passed |
| `adding-todos.spec.ts:27` adding todos > appends each new todo to the end of the list | passed | 10/10 | no | passed | passed |
| `adding-todos.spec.ts:34` adding todos > pluralises the counter between one and many items | passed | 10/10 | no | passed | passed |
| `adding-todos.spec.ts:42` adding todos > ignores an empty submission | passed | 10/10 | no | passed | passed |
| `adding-todos.spec.ts:48` adding todos > rejects a whitespace-only todo and leaves the text in the input | passed | 10/10 | no | passed | passed |
| `adding-todos.spec.ts:56` adding todos > trims leading and trailing whitespace from the title | passed | 10/10 | no | passed | passed |
| `adding-todos.spec.ts:63` adding todos > leaves an existing list untouched when a whitespace-only todo is submitted | passed | 10/10 | no | passed | passed |
| `adding-todos.spec.ts:72` adding todos > allows duplicate titles as separate todos | passed | 10/10 | no | passed | passed |
| `adding-todos.spec.ts:79` adding todos > accepts a very long title without truncating it | passed | 10/10 | no | passed | passed |
| `adding-todos.spec.ts:88` adding todos > renders markup in a title as text rather than HTML | passed | 10/10 | no | passed | passed |
| `adding-todos.spec.ts:99` adding todos > accepts titles containing quotes, emoji and non-latin script | passed | 10/10 | no | passed | passed |
| `completing-todos.spec.ts:8` completing todos > marks a single todo complete and updates the counter | passed | 10/10 | no | passed | passed |
| `completing-todos.spec.ts:17` completing todos > returns a completed todo to active when toggled again | passed | 10/10 | no | passed | passed |
| `completing-todos.spec.ts:28` completing todos > keeps completed todos in the list on the All view | passed | 10/10 | no | passed | passed |
| `completing-todos.spec.ts:34` completing todos > records completion in storage | passed | 10/10 | no | passed | passed |
| `completing-todos.spec.ts:45` completing todos > shows zero items left once every todo is complete | passed | 10/10 | no | passed | passed |
| `completing-todos.spec.ts:54` completing todos > toggle all > completes every todo | passed | 10/10 | no | passed | passed |
| `completing-todos.spec.ts:64` completing todos > toggle all > returns every todo to active when clicked a second time | passed | 10/10 | no | passed | passed |
| `completing-todos.spec.ts:76` completing todos > toggle all > completes the remaining todos when some are already complete | passed | 10/10 | no | passed | passed |
| `completing-todos.spec.ts:86` completing todos > toggle all > is unchecked while any todo is still active | passed | 10/10 | no | passed | passed |
| `completing-todos.spec.ts:94` completing todos > toggle all > checks itself once the last todo is completed individually | passed | 10/10 | no | passed | passed |
| `completing-todos.spec.ts:102` completing todos > toggle all > unchecks itself when one completed todo is reactivated | passed | 10/10 | no | passed | passed |
| `completing-todos.spec.ts:114` completing todos > clear completed > is not shown while nothing is complete | passed | 10/10 | no | passed | passed |
| `completing-todos.spec.ts:118` completing todos > clear completed > appears as soon as a todo is completed | passed | 10/10 | no | passed | passed |
| `completing-todos.spec.ts:124` completing todos > clear completed > removes only the completed todos | passed | 10/10 | no | passed | passed |
| `completing-todos.spec.ts:136` completing todos > clear completed > disappears again once no completed todos remain | passed | 10/10 | no | passed | passed |
| `completing-todos.spec.ts:143` completing todos > clear completed > empties the app when every todo is complete | passed | 10/10 | no | passed | passed |
| `deleting-todos.spec.ts:8` deleting todos > hides the delete button until its row is hovered | passed | 10/10 | no | passed | passed |
| `deleting-todos.spec.ts:16` deleting todos > removes the todo and updates the counter | passed | 10/10 | no | passed | passed |
| `deleting-todos.spec.ts:24` deleting todos > preserves the order of the remaining todos | passed | 10/10 | no | passed | passed |
| `deleting-todos.spec.ts:30` deleting todos > does not change the count of items left when a completed todo is deleted | passed | 10/10 | no | passed | passed |
| `deleting-todos.spec.ts:41` deleting todos > deletes one of two duplicate titles and leaves the other | passed | 10/10 | no | passed | passed |
| `deleting-todos.spec.ts:53` deleting todos > returns to the empty state when the last todo is deleted | passed | 10/10 | no | passed | passed |
| `deleting-todos.spec.ts:62` deleting todos > empties the list when every todo is deleted one by one | passed | 10/10 | no | passed | passed |
| `editing-todos.spec.ts:8` editing todos > opens an edit box prefilled and focused on double click | passed | 10/10 | no | passed | passed |
| `editing-todos.spec.ts:18` editing todos > does not expose an edit box until editing starts | passed | 10/10 | no | passed | passed |
| `editing-todos.spec.ts:22` editing todos > saves the new title on Enter | passed | 10/10 | no | passed | passed |
| `editing-todos.spec.ts:33` editing todos > saves the new title when the edit box loses focus | passed | 10/10 | no | passed | passed |
| `editing-todos.spec.ts:39` editing todos > trims whitespace around an edited title | passed | 10/10 | no | passed | passed |
| `editing-todos.spec.ts:45` editing todos > discards the change on Escape | passed | 10/10 | no | passed | passed |
| `editing-todos.spec.ts:53` editing todos > can be edited again after a cancelled edit | passed | 10/10 | no | passed | passed |
| `editing-todos.spec.ts:61` editing todos > deletes the todo when the title is cleared and saved | passed | 10/10 | no | passed | passed |
| `editing-todos.spec.ts:68` editing todos > deletes the todo when the title is edited to whitespace only | passed | 10/10 | no | passed | passed |
| `editing-todos.spec.ts:75` editing todos > keeps a todo completed across an edit | passed | 10/10 | no | passed | passed |
| `editing-todos.spec.ts:86` editing todos > leaves the other todos untouched | passed | 10/10 | no | passed | passed |
| `editing-todos.spec.ts:93` editing todos > escapes markup typed into an edit | passed | 10/10 | no | passed | passed |
| `editing-todos.spec.ts:100` editing todos > edits a todo down to a single character | passed | 10/10 | no | passed | passed |
| `filtering-todos.spec.ts:13` filtering todos > shows every todo on the All view | passed | 10/10 | no | passed | passed |
| `filtering-todos.spec.ts:19` filtering todos > shows only unfinished todos on the Active view | passed | 9/10 | **yes** | passed | passed |
| `filtering-todos.spec.ts:27` filtering todos > shows only finished todos on the Completed view | passed | 10/10 | no | passed | passed |
| `filtering-todos.spec.ts:34` filtering todos > counts the active todos on every view | passed | 10/10 | no | passed | passed |
| `filtering-todos.spec.ts:44` filtering todos > opens a filtered view directly from its URL | passed | 10/10 | no | passed | passed |
| `filtering-todos.spec.ts:51` filtering todos > drops a todo out of the Active view as soon as it is completed | passed | 10/10 | no | passed | passed |
| `filtering-todos.spec.ts:60` filtering todos > drops a todo out of the Completed view as soon as it is reactivated | passed | 10/10 | no | passed | passed |
| `filtering-todos.spec.ts:69` filtering todos > shows a newly added todo on the Active view | passed | 10/10 | no | passed | passed |
| `filtering-todos.spec.ts:77` filtering todos > keeps a newly added todo out of the Completed view but stores it | passed | 10/10 | no | passed | passed |
| `filtering-todos.spec.ts:89` filtering todos > completes every todo from the Active view, emptying it | passed | 10/10 | no | passed | passed |
| `filtering-todos.spec.ts:101` filtering todos > deletes a todo from a filtered view | passed | 10/10 | no | passed | passed |
| `filtering-todos.spec.ts:111` filtering todos > edits a todo from a filtered view | passed | 10/10 | no | passed | passed |
| `filtering-todos.spec.ts:119` filtering todos > clears completed todos without leaving the current filter | passed | 10/10 | no | passed | passed |
| `filtering-todos.spec.ts:129` filtering todos > empties the Completed view when completed todos are cleared | passed | 10/10 | no | passed | passed |
| `filtering-todos.spec.ts:138` filtering todos > shows the empty state on a filtered view once the list is emptied | passed | 10/10 | no | passed | passed |
| `filtering-todos.spec.ts:153` filtering todos > restores the previous filter with the browser back button | passed | 10/10 | no | passed | passed |
| `persistence.spec.ts:5` persistence > keeps todos and their order across a reload | passed | 10/10 | no | passed | passed |
| `persistence.spec.ts:14` persistence > keeps completion state across a reload | passed | 10/10 | no | passed | passed |
| `persistence.spec.ts:28` persistence > keeps an edited title across a reload | passed | 10/10 | no | passed | passed |
| `persistence.spec.ts:38` persistence > keeps deletions across a reload | passed | 10/10 | no | passed | passed |
| `persistence.spec.ts:47` persistence > comes back to the empty state after every todo is deleted | passed | 10/10 | no | passed | passed |
| `persistence.spec.ts:56` persistence > keeps the selected filter across a reload | passed | 10/10 | no | passed | passed |
| `persistence.spec.ts:68` persistence > stores each todo with a title, a completed flag and an id | passed | 10/10 | no | passed | passed |
| `persistence.spec.ts:82` persistence > starts empty in a browser session that has no stored todos | passed | 10/10 | no | passed | passed |
| `persistence.spec.ts:93` persistence > does not leak todos into a second, independent browser session | passed | 10/10 | no | passed | passed |

## Convention violations

Gate rules (pinned in docs/protocol.md), across 8 file(s):

| Rule | Hits |
|---|---|
| `playwright/expect-expect` | 16 |
| **total** | **16** |

Informational, not part of the repair gate: `playwright/no-raw-locators` — 3 hit(s).

All files parsed.
