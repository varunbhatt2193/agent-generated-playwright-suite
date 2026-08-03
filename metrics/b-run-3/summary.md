# Measurement — `arms/b-skill/run-3`

10 sequential runs at `workers=1`, one isolated run per test, one fully parallel run at
`workers=4`. Retries are 0, so every status below is a first attempt.

| Metric | Value |
|---|---|
| Tests generated | 64 |
| First-run pass rate | 100% (64/64) |
| Pass rate across 10 runs | mean 100%, range 100–100% |
| Flake rate | 0% (0 inconsistent across 10 runs) |
| Isolation failures | 0 |
| Parallel failures | 0 |
| Never passed | 0 |
| Passed every run | 64 |

## Per test

| Test | Run 1 | Passed | Flaky | Alone | Parallel |
|---|---|---|---|---|---|
| `adding.spec.ts:4` adding todos > adds a todo and shows it in the list | passed | 10/10 | no | passed | passed |
| `adding.spec.ts:12` adding todos > clears the input after a successful add | passed | 10/10 | no | passed | passed |
| `adding.spec.ts:18` adding todos > appends each new todo to the end of the list | passed | 10/10 | no | passed | passed |
| `adding.spec.ts:25` adding todos > ignores a submission with no text | passed | 10/10 | no | passed | passed |
| `adding.spec.ts:32` adding todos > ignores a whitespace-only submission and keeps the typed text | passed | 10/10 | no | passed | passed |
| `adding.spec.ts:40` adding todos > trims surrounding whitespace from a new todo | passed | 10/10 | no | passed | passed |
| `adding.spec.ts:49` adding todos > allows two todos with the same title | passed | 10/10 | no | passed | passed |
| `adding.spec.ts:56` adding todos > renders markup-like text as plain text | passed | 10/10 | no | passed | passed |
| `adding.spec.ts:64` adding todos > accepts a very long title | passed | 10/10 | no | passed | passed |
| `adding.spec.ts:72` adding todos > reveals the list chrome once the first todo is added | passed | 10/10 | no | passed | passed |
| `completing.spec.ts:8` completing todos > marks a single todo complete and active again | passed | 10/10 | no | passed | passed |
| `completing.spec.ts:21` completing todos > keeps a completed todo in place in the unfiltered list | passed | 10/10 | no | passed | passed |
| `completing.spec.ts:27` completing todos > counts down to a singular label at one remaining todo | passed | 10/10 | no | passed | passed |
| `completing.spec.ts:38` completing todos > completes every todo with mark-all | passed | 10/10 | no | passed | passed |
| `completing.spec.ts:49` completing todos > reactivates every todo when mark-all is unchecked | passed | 10/10 | no | passed | passed |
| `completing.spec.ts:60` completing todos > mark-all checks itself once every todo is completed individually | passed | 10/10 | no | passed | passed |
| `completing.spec.ts:71` completing todos > mark-all unchecks itself as soon as one todo is reactivated | passed | 10/10 | no | passed | passed |
| `completing.spec.ts:81` completing todos > offers Clear completed only while something is completed | passed | 10/10 | no | passed | passed |
| `completing.spec.ts:91` completing todos > Clear completed removes only the completed todos | passed | 10/10 | no | passed | passed |
| `completing.spec.ts:105` completing todos > persists the completed flag for each todo | passed | 10/10 | no | passed | passed |
| `deleting.spec.ts:8` deleting todos > reveals the delete button only while its row is hovered | passed | 10/10 | no | passed | passed |
| `deleting.spec.ts:17` deleting todos > removes only the targeted todo | passed | 10/10 | no | passed | passed |
| `deleting.spec.ts:28` deleting todos > removes a completed todo and leaves the active count alone | passed | 10/10 | no | passed | passed |
| `deleting.spec.ts:39` deleting todos > deletes every todo one at a time | passed | 10/10 | no | passed | passed |
| `deleting.spec.ts:50` deleting todos > deletes the first of two identically titled todos | passed | 10/10 | no | passed | passed |
| `editing.spec.ts:8` editing todos > double-click opens an editor prefilled with the current title | passed | 10/10 | no | passed | passed |
| `editing.spec.ts:17` editing todos > saves the new title on Enter | passed | 10/10 | no | passed | passed |
| `editing.spec.ts:24` editing todos > saves the new title when the editor loses focus | passed | 10/10 | no | passed | passed |
| `editing.spec.ts:30` editing todos > discards the change on Escape | passed | 10/10 | no | passed | passed |
| `editing.spec.ts:37` editing todos > trims surrounding whitespace from the edited title | passed | 10/10 | no | passed | passed |
| `editing.spec.ts:48` editing todos > deletes the todo when the title is cleared | passed | 10/10 | no | passed | passed |
| `editing.spec.ts:55` editing todos > deletes the todo when the title is edited to whitespace only | passed | 10/10 | no | passed | passed |
| `editing.spec.ts:62` editing todos > keeps the completed state of an edited todo | passed | 10/10 | no | passed | passed |
| `editing.spec.ts:71` editing todos > keeps the todo in its original position | passed | 10/10 | no | passed | passed |
| `editing.spec.ts:77` editing todos > renders an edited title containing markup as plain text | passed | 10/10 | no | passed | passed |
| `editing.spec.ts:84` editing todos > edits only the todo that was double-clicked | passed | 10/10 | no | passed | passed |
| `empty-state.spec.ts:4` empty state > starts with no todos and no list chrome | passed | 10/10 | no | passed | passed |
| `empty-state.spec.ts:12` empty state > focuses the new-todo field on load | passed | 10/10 | no | passed | passed |
| `empty-state.spec.ts:16` empty state > shows the editing hint in the page footer | passed | 10/10 | no | passed | passed |
| `empty-state.spec.ts:20` empty state > returns to the empty state after the last todo is deleted | passed | 10/10 | no | passed | passed |
| `empty-state.spec.ts:29` empty state > returns to the empty state after the last todo is cleared | passed | 10/10 | no | passed | passed |
| `filtering.spec.ts:10` filtering todos > shows every todo under All | passed | 10/10 | no | passed | passed |
| `filtering.spec.ts:18` filtering todos > shows only unfinished todos under Active | passed | 10/10 | no | passed | passed |
| `filtering.spec.ts:26` filtering todos > shows only finished todos under Completed | passed | 10/10 | no | passed | passed |
| `filtering.spec.ts:34` filtering todos > keeps the counter on total active todos under every filter | passed | 10/10 | no | passed | passed |
| `filtering.spec.ts:45` filtering todos > shows an empty list when a filter matches nothing | passed | 10/10 | no | passed | passed |
| `filtering.spec.ts:55` filtering todos > drops a todo out of the Active view when it is completed there | passed | 10/10 | no | passed | passed |
| `filtering.spec.ts:65` filtering todos > drops a todo out of the Completed view when it is reactivated there | passed | 10/10 | no | passed | passed |
| `filtering.spec.ts:77` filtering todos > applies mark-all to every todo from the Active view | passed | 10/10 | no | passed | passed |
| `filtering.spec.ts:88` filtering todos > clears completed todos from the Active view | passed | 10/10 | no | passed | passed |
| `filtering.spec.ts:99` filtering todos > edits a todo from a filtered view | passed | 10/10 | no | passed | passed |
| `filtering.spec.ts:109` filtering todos > deletes a todo from a filtered view | passed | 10/10 | no | passed | passed |
| `filtering.spec.ts:119` filtering todos > adds a todo while the Completed filter hides it | passed | 10/10 | no | passed | passed |
| `filtering.spec.ts:135` filtering todos > honours a filter hash typed straight into the address bar | passed | 10/10 | no | passed | passed |
| `filtering.spec.ts:142` filtering todos > falls back to All for an unrecognised hash | passed | 10/10 | no | passed | passed |
| `filtering.spec.ts:149` filtering todos > restores the previous filter with browser back and forward | passed | 10/10 | no | passed | passed |
| `persistence.spec.ts:5` persistence across reloads and sessions > keeps todos and their order after a reload | passed | 10/10 | no | passed | passed |
| `persistence.spec.ts:14` persistence across reloads and sessions > keeps completed states after a reload | passed | 10/10 | no | passed | passed |
| `persistence.spec.ts:26` persistence across reloads and sessions > keeps an edit after a reload | passed | 10/10 | no | passed | passed |
| `persistence.spec.ts:35` persistence across reloads and sessions > keeps a deletion after a reload | passed | 10/10 | no | passed | passed |
| `persistence.spec.ts:45` persistence across reloads and sessions > comes back empty after every todo is deleted and the page reloads | passed | 10/10 | no | passed | passed |
| `persistence.spec.ts:58` persistence across reloads and sessions > reloads straight into a filtered view | passed | 10/10 | no | passed | passed |
| `persistence.spec.ts:70` persistence across reloads and sessions > restores the todos in a brand new tab of the same session | passed | 10/10 | no | passed | passed |
| `persistence.spec.ts:85` persistence across reloads and sessions > starts empty in a session that has no stored todos | passed | 10/10 | no | passed | passed |

## Convention violations

Gate rules (pinned in docs/protocol.md), across 9 file(s):

| Rule | Hits |
|---|---|
| `playwright/expect-expect` | 25 |
| `playwright/valid-expect` | 6 |
| **total** | **31** |

Informational, not part of the repair gate: `playwright/no-raw-locators` — 3 hit(s).

All files parsed.
