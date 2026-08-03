# Measurement — `arms/b-skill/run-1`

10 sequential runs at `workers=1`, one isolated run per test, one fully parallel run at
`workers=4`. Retries are 0, so every status below is a first attempt.

| Metric | Value |
|---|---|
| Tests generated | 71 |
| First-run pass rate | 100% (71/71) |
| Pass rate across 10 runs | mean 100%, range 100–100% |
| Flake rate | 0% (0 inconsistent across 10 runs) |
| Isolation failures | 0 |
| Parallel failures | 0 |
| Never passed | 0 |
| Passed every run | 71 |

## Per test

| Test | Run 1 | Passed | Flaky | Alone | Parallel |
|---|---|---|---|---|---|
| `add-todo.spec.ts:4` adding todos > starts on an empty list with the input focused | passed | 10/10 | no | passed | passed |
| `add-todo.spec.ts:10` adding todos > adds a todo and clears the input, keeping focus for the next one | passed | 10/10 | no | passed | passed |
| `add-todo.spec.ts:18` adding todos > shows the counter, filters and toggle-all once the first todo exists | passed | 10/10 | no | passed | passed |
| `add-todo.spec.ts:31` adding todos > appends todos in the order they were entered | passed | 10/10 | no | passed | passed |
| `add-todo.spec.ts:38` adding todos > adds todos as active | passed | 10/10 | no | passed | passed |
| `add-todo.spec.ts:45` adding todos > trims surrounding whitespace from the title | passed | 10/10 | no | passed | passed |
| `add-todo.spec.ts:54` adding todos > ignores a whitespace-only entry and leaves the text in the input | passed | 10/10 | no | passed | passed |
| `add-todo.spec.ts:62` adding todos > ignores Enter on an empty input | passed | 10/10 | no | passed | passed |
| `add-todo.spec.ts:73` adding todos > keeps duplicate titles as separate todos | passed | 10/10 | no | passed | passed |
| `add-todo.spec.ts:80` adding todos > renders a title that looks like markup as literal text | passed | 10/10 | no | passed | passed |
| `add-todo.spec.ts:91` adding todos > keeps a long title intact | passed | 10/10 | no | passed | passed |
| `add-todo.spec.ts:99` adding todos > preserves internal whitespace and punctuation | passed | 10/10 | no | passed | passed |
| `add-todo.spec.ts:105` adding todos > adds a todo while the Completed filter hides it | passed | 10/10 | no | passed | passed |
| `app-shell.spec.ts:4` app shell > shows the app title and prompt | passed | 10/10 | no | passed | passed |
| `app-shell.spec.ts:10` app shell > explains how to edit a todo | passed | 10/10 | no | passed | passed |
| `app-shell.spec.ts:16` app shell > links out to the TodoMVC project | passed | 10/10 | no | passed | passed |
| `app-shell.spec.ts:26` app shell > names the todo controls for assistive technology | passed | 10/10 | no | passed | passed |
| `app-shell.spec.ts:36` app shell > reaches the filters by keyboard | passed | 10/10 | no | passed | passed |
| `complete-todo.spec.ts:4` completing todos > marks a todo complete and decrements the counter | passed | 10/10 | no | passed | passed |
| `complete-todo.spec.ts:19` completing todos > un-completes a todo and restores the counter | passed | 10/10 | no | passed | passed |
| `complete-todo.spec.ts:30` completing todos > pluralises the counter across zero, one and many | passed | 10/10 | no | passed | passed |
| `complete-todo.spec.ts:41` completing todos > persists the completed flag to storage | passed | 10/10 | no | passed | passed |
| `complete-todo.spec.ts:52` completing todos > completing the last active todo checks the toggle-all control | passed | 10/10 | no | passed | passed |
| `complete-todo.spec.ts:63` completing todos > re-activating one todo unchecks the toggle-all control | passed | 10/10 | no | passed | passed |
| `complete-todo.spec.ts:76` completing todos > toggle-all completes every todo, including ones already complete | passed | 10/10 | no | passed | passed |
| `complete-todo.spec.ts:94` completing todos > toggle-all re-activates every todo when they are all complete | passed | 10/10 | no | passed | passed |
| `complete-todo.spec.ts:110` completing todos > toggle-all completes hidden todos too when a filter is applied | passed | 10/10 | no | passed | passed |
| `complete-todo.spec.ts:131` completing todos > completing a todo moves it out of the Active view and into Completed | passed | 10/10 | no | passed | passed |
| `complete-todo.spec.ts:145` completing todos > un-completing a todo from the Completed view removes it from that view | passed | 10/10 | no | passed | passed |
| `delete-todo.spec.ts:4` deleting todos > reveals the delete button only while the row is hovered | passed | 10/10 | no | passed | passed |
| `delete-todo.spec.ts:17` deleting todos > deletes the chosen todo and leaves the rest | passed | 10/10 | no | passed | passed |
| `delete-todo.spec.ts:29` deleting todos > deletes only the clicked one of two identically titled todos | passed | 10/10 | no | passed | passed |
| `delete-todo.spec.ts:42` deleting todos > deletes a completed todo and leaves the counter alone | passed | 10/10 | no | passed | passed |
| `delete-todo.spec.ts:55` deleting todos > returns to the empty state when the last todo is deleted | passed | 10/10 | no | passed | passed |
| `delete-todo.spec.ts:66` clearing completed todos > hides the button until something is completed | passed | 10/10 | no | passed | passed |
| `delete-todo.spec.ts:77` clearing completed todos > removes every completed todo and keeps the active ones | passed | 10/10 | no | passed | passed |
| `delete-todo.spec.ts:91` clearing completed todos > empties the list when every todo is completed | passed | 10/10 | no | passed | passed |
| `delete-todo.spec.ts:102` clearing completed todos > empties the Completed view it was pressed from | passed | 10/10 | no | passed | passed |
| `delete-todo.spec.ts:118` clearing completed todos > clears completed todos hidden by the Active filter | passed | 10/10 | no | passed | passed |
| `edit-todo.spec.ts:4` editing todos > opens an editor pre-filled with the current title on double-click | passed | 10/10 | no | passed | passed |
| `edit-todo.spec.ts:15` editing todos > a single click does not start editing | passed | 10/10 | no | passed | passed |
| `edit-todo.spec.ts:24` editing todos > saves the new title on Enter | passed | 10/10 | no | passed | passed |
| `edit-todo.spec.ts:36` editing todos > saves the new title when focus leaves the editor | passed | 10/10 | no | passed | passed |
| `edit-todo.spec.ts:44` editing todos > discards the change on Escape | passed | 10/10 | no | passed | passed |
| `edit-todo.spec.ts:55` editing todos > reopens the editor with the original title after Escape | passed | 10/10 | no | passed | passed |
| `edit-todo.spec.ts:66` editing todos > trims surrounding whitespace from the edited title | passed | 10/10 | no | passed | passed |
| `edit-todo.spec.ts:77` editing todos > deletes the todo when the title is cleared and saved | passed | 10/10 | no | passed | passed |
| `edit-todo.spec.ts:86` editing todos > deletes the todo when the title is edited to whitespace only | passed | 10/10 | no | passed | passed |
| `edit-todo.spec.ts:94` editing todos > deleting the only todo by clearing its title empties the list | passed | 10/10 | no | passed | passed |
| `edit-todo.spec.ts:102` editing todos > keeps a completed todo complete after an edit | passed | 10/10 | no | passed | passed |
| `edit-todo.spec.ts:115` editing todos > keeps the todo in place in the list | passed | 10/10 | no | passed | passed |
| `edit-todo.spec.ts:123` editing todos > escapes markup typed into the editor | passed | 10/10 | no | passed | passed |
| `edit-todo.spec.ts:132` editing todos > edits a todo while a filter is active and keeps it in view | passed | 10/10 | no | passed | passed |
| `filters.spec.ts:12` filtering > All shows every todo | passed | 10/10 | no | passed | passed |
| `filters.spec.ts:21` filtering > Active shows only unfinished todos | passed | 10/10 | no | passed | passed |
| `filters.spec.ts:30` filtering > Completed shows only finished todos | passed | 10/10 | no | passed | passed |
| `filters.spec.ts:39` filtering > highlights the active filter | passed | 10/10 | no | passed | passed |
| `filters.spec.ts:56` filtering > opens straight into the Active view from its URL | passed | 10/10 | no | passed | passed |
| `filters.spec.ts:63` filtering > opens straight into the Completed view from its URL | passed | 10/10 | no | passed | passed |
| `filters.spec.ts:70` filtering > falls back to All for an unknown route | passed | 10/10 | no | passed | passed |
| `filters.spec.ts:80` filtering > keeps the counter on the total of active todos in every view | passed | 10/10 | no | passed | passed |
| `filters.spec.ts:91` filtering > keeps the footer visible when a filter matches nothing | passed | 10/10 | no | passed | passed |
| `filters.spec.ts:106` filtering > goes back and forward through the filter history | passed | 10/10 | no | passed | passed |
| `filters.spec.ts:122` filtering > a filtered view updates as todos change underneath it | passed | 10/10 | no | passed | passed |
| `persistence.spec.ts:5` persistence > keeps todos and their completed state across a reload | passed | 10/10 | no | passed | passed |
| `persistence.spec.ts:20` persistence > keeps an edited title across a reload | passed | 10/10 | no | passed | passed |
| `persistence.spec.ts:29` persistence > keeps deletions across a reload | passed | 10/10 | no | passed | passed |
| `persistence.spec.ts:39` persistence > keeps a cleared list empty across a reload | passed | 10/10 | no | passed | passed |
| `persistence.spec.ts:49` persistence > keeps the current filter across a reload | passed | 10/10 | no | passed | passed |
| `persistence.spec.ts:61` persistence > keeps todos when navigating away and back | passed | 10/10 | no | passed | passed |
| `persistence.spec.ts:70` persistence > starts empty in a fresh browser session | passed | 10/10 | no | passed | passed |

## Convention violations

Gate rules (pinned in docs/protocol.md), across 9 file(s):

| Rule | Hits |
|---|---|
| `playwright/expect-expect` | 28 |
| **total** | **28** |

Informational, not part of the repair gate: `playwright/no-raw-locators` — 3 hit(s).

All files parsed.
