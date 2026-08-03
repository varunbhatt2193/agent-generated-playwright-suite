# Measurement — `arms/a-baseline/run-1`

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
| `adding.spec.ts:11` adding todos > adds a todo and clears the input | passed | 10/10 | no | passed | passed |
| `adding.spec.ts:20` adding todos > appends new todos to the bottom of the list | passed | 10/10 | no | passed | passed |
| `adding.spec.ts:25` adding todos > creates todos in the active state | passed | 10/10 | no | passed | passed |
| `adding.spec.ts:33` adding todos > trims leading and trailing whitespace from the title | passed | 10/10 | no | passed | passed |
| `adding.spec.ts:40` adding todos > preserves whitespace inside the title | passed | 10/10 | no | passed | passed |
| `adding.spec.ts:45` adding todos > ignores Enter on an empty input | passed | 10/10 | no | passed | passed |
| `adding.spec.ts:50` adding todos > ignores a whitespace-only title and keeps the text in the input | passed | 10/10 | no | passed | passed |
| `adding.spec.ts:59` adding todos > allows duplicate titles as separate todos | passed | 10/10 | no | passed | passed |
| `adding.spec.ts:67` adding todos > renders markup in a title as literal text | passed | 10/10 | no | passed | passed |
| `adding.spec.ts:75` adding todos > accepts a long title without truncating it | passed | 10/10 | no | passed | passed |
| `app-shell.spec.ts:11` application shell > renders the document title and heading | passed | 10/10 | no | passed | passed |
| `app-shell.spec.ts:16` application shell > normalises the entry URL to the "all" route | passed | 10/10 | no | passed | passed |
| `app-shell.spec.ts:20` application shell > focuses the new-todo input on load | passed | 10/10 | no | passed | passed |
| `app-shell.spec.ts:25` application shell > hides the list and footer while there are no todos | passed | 10/10 | no | passed | passed |
| `app-shell.spec.ts:33` application shell > shows the list and footer as soon as a todo exists, and hides them again when it is gone | passed | 10/10 | no | passed | passed |
| `app-shell.spec.ts:45` application shell > shows the informational footer links | passed | 10/10 | no | passed | passed |
| `completing.spec.ts:12` completing todos > marks a single todo complete and back to active | passed | 10/10 | no | passed | passed |
| `completing.spec.ts:23` completing todos > keeps completed todos in place in the list | passed | 10/10 | no | passed | passed |
| `completing.spec.ts:28` completing todos > counts down the remaining items and switches to the singular form at one | passed | 10/10 | no | passed | passed |
| `completing.spec.ts:41` completing todos > "mark all as complete" completes every todo | passed | 10/10 | no | passed | passed |
| `completing.spec.ts:52` completing todos > "mark all as complete" clears every todo when all are already complete | passed | 10/10 | no | passed | passed |
| `completing.spec.ts:62` completing todos > "mark all as complete" reflects the state of the individual todos | passed | 10/10 | no | passed | passed |
| `completing.spec.ts:76` completing todos > completing a todo only affects that todo | passed | 10/10 | no | passed | passed |
| `editing.spec.ts:12` editing todos > a double click opens the editor prefilled and focused | passed | 10/10 | no | passed | passed |
| `editing.spec.ts:20` editing todos > a single click does not open the editor | passed | 10/10 | no | passed | passed |
| `editing.spec.ts:25` editing todos > Enter saves the new title and closes the editor | passed | 10/10 | no | passed | passed |
| `editing.spec.ts:32` editing todos > blurring the editor saves the new title | passed | 10/10 | no | passed | passed |
| `editing.spec.ts:39` editing todos > Escape discards the change and closes the editor | passed | 10/10 | no | passed | passed |
| `editing.spec.ts:46` editing todos > a todo can be edited again after an escaped edit | passed | 10/10 | no | passed | passed |
| `editing.spec.ts:53` editing todos > trims whitespace around the edited title | passed | 10/10 | no | passed | passed |
| `editing.spec.ts:59` editing todos > saving an empty title deletes the todo | passed | 10/10 | no | passed | passed |
| `editing.spec.ts:66` editing todos > saving a whitespace-only title deletes the todo | passed | 10/10 | no | passed | passed |
| `editing.spec.ts:72` editing todos > blurring an emptied editor deletes the todo | passed | 10/10 | no | passed | passed |
| `editing.spec.ts:78` editing todos > editing a completed todo keeps it completed | passed | 10/10 | no | passed | passed |
| `editing.spec.ts:87` editing todos > an unchanged title survives a save | passed | 10/10 | no | passed | passed |
| `editing.spec.ts:94` editing todos > editing does not disturb the other todos | passed | 10/10 | no | passed | passed |
| `filters.spec.ts:13` filtering > "All" is selected by default and shows everything | passed | 10/10 | no | passed | passed |
| `filters.spec.ts:18` filtering > "Active" shows only the unfinished todos | passed | 10/10 | no | passed | passed |
| `filters.spec.ts:27` filtering > "Completed" shows only the finished todos | passed | 10/10 | no | passed | passed |
| `filters.spec.ts:35` filtering > returning to "All" restores the full list | passed | 10/10 | no | passed | passed |
| `filters.spec.ts:43` filtering > the remaining counter is not affected by the active filter | passed | 10/10 | no | passed | passed |
| `filters.spec.ts:53` filtering > "Clear completed" stays available under every filter | passed | 10/10 | no | passed | passed |
| `filters.spec.ts:60` filtering > completing a todo removes it from the active view | passed | 10/10 | no | passed | passed |
| `filters.spec.ts:70` filtering > reactivating a todo removes it from the completed view | passed | 10/10 | no | passed | passed |
| `filters.spec.ts:80` filtering > a todo added from a filtered view still joins the list | passed | 10/10 | no | passed | passed |
| `filters.spec.ts:92` filtering > a todo can be edited from a filtered view | passed | 10/10 | no | passed | passed |
| `filters.spec.ts:99` filtering > a todo can be deleted from a filtered view | passed | 10/10 | no | passed | passed |
| `filters.spec.ts:109` filtering > "mark all as complete" acts on every todo, not just the visible ones | passed | 10/10 | no | passed | passed |
| `filters.spec.ts:122` filtering > "mark all as complete" reactivates everything when the active view is empty | passed | 10/10 | no | passed | passed |
| `filters.spec.ts:136` filter routing > a filter route can be opened directly | passed | 10/10 | no | passed | passed |
| `filters.spec.ts:148` filter routing > an unknown route falls back to showing everything | passed | 10/10 | no | passed | passed |
| `filters.spec.ts:160` filter routing > browser back and forward move between filters | passed | 10/10 | no | passed | passed |
| `persistence.spec.ts:5` persistence > todos, completion and edits survive a reload | passed | 10/10 | no | passed | passed |
| `persistence.spec.ts:18` persistence > deletions survive a reload | passed | 10/10 | no | passed | passed |
| `persistence.spec.ts:28` persistence > the selected filter survives a reload | passed | 10/10 | no | passed | passed |
| `persistence.spec.ts:41` persistence > writes the list to localStorage under "react-todos" | passed | 10/10 | no | passed | passed |
| `persistence.spec.ts:59` persistence > restores a list written by a previous session | passed | 10/10 | no | passed | passed |
| `persistence.spec.ts:72` persistence > starts empty in a fresh browser session | passed | 10/10 | no | passed | passed |
| `removing.spec.ts:12` deleting todos > the delete button is revealed by hovering its row | passed | 10/10 | no | passed | passed |
| `removing.spec.ts:20` deleting todos > the delete button removes only its own todo | passed | 10/10 | no | passed | passed |
| `removing.spec.ts:27` deleting todos > deleting every todo returns the app to its empty state | passed | 10/10 | no | passed | passed |
| `removing.spec.ts:36` deleting todos > a completed todo can be deleted | passed | 10/10 | no | passed | passed |
| `removing.spec.ts:53` clear completed > the button only appears once something is completed | passed | 10/10 | no | passed | passed |
| `removing.spec.ts:63` clear completed > removes the completed todos and leaves the active ones | passed | 10/10 | no | passed | passed |
| `removing.spec.ts:73` clear completed > clearing everything returns the app to its empty state | passed | 10/10 | no | passed | passed |
| `removing.spec.ts:82` clear completed > works from the completed filter, leaving that view empty | passed | 10/10 | no | passed | passed |

## Convention violations

Gate rules (pinned in docs/protocol.md), across 8 file(s):

| Rule | Hits |
|---|---|
| _none_ | 0 |
| **total** | **0** |

Informational, not part of the repair gate: `playwright/no-raw-locators` — 1 hit(s).

All files parsed.
