# Measurement protocol

Frozen before any generation run. This file is committed and tagged `protocol-frozen`; nothing in it
changes after that tag. Definitions written after seeing results are how you get the answer you wanted,
so all of them are written here first.

## Question

Does a Claude Skill encoding Playwright conventions measurably change the quality of an
agent-generated test suite — and in what specific ways?

## Fixed setup, identical across all runs

- **Target:** https://demo.playwright.dev/todomvc — Playwright's own demo app, static, known-good.
  Every failure is therefore attributed to the generated test, not the application.
- **Runner:** `@playwright/test` 1.62.1 (exact pin), TypeScript, Chromium only, `retries: 0`.
  Retries stay at 0 everywhere including CI: retries hide exactly the flake this project measures.
  Chromium-only is a deliberate scope cut — cross-browser differences would add noise unrelated to
  the question.
- **Generator:** Claude Code CLI 2.1.220, model pinned `claude-opus-5`, run headless (`claude -p`)
  so every run receives the byte-identical prompt with zero human steering.
- **Browser tools:** `@playwright/mcp` 0.0.78 (exact pin, not `@latest`), launched
  `--browser chromium --headless --isolated`. `chromium` resolves to the pinned chrome-for-testing
  build rather than the machine's auto-updating Google Chrome, so the browser stays a fixed quantity
  across all six runs, and `--isolated` gives each session a fresh in-memory profile so no page state
  survives from one run into the next. No `--caps` is passed, leaving the optional `vision`, `pdf` and
  `devtools` groups off; `--codegen` is left at its shipped default of `typescript`. That default is
  deliberately not overridden — the baseline should be what a developer actually gets from this
  version, not a configuration tuned for the experiment. Exact tool inventory in `docs/mcp-notes.md`.
- **No `baseURL`.** The config deliberately omits it: the app is served from a subpath and
  `https://demo.playwright.dev/` is a 404, so a generated `page.goto('/')` would fail for harness
  reasons rather than test-quality ones — contaminating exactly the metric this measures. Tests use
  the absolute URL, which the prompt supplies.
- **Prompt:** `prompts/generation-prompt.md`, identical in both arms. It says what to build, not how —
  no locator, waiting, or structure guidance, because that guidance is the experimental variable.
- **Isolation, and what the agent is allowed to see.** Each run happens in a throwaway `git archive`
  export of a tagged generation base, in a fresh session with no conversation history and no access to
  any other run's output. The base is an orphan commit holding four files — `package.json`,
  `package-lock.json`, `playwright.config.ts`, `.gitignore` — and deliberately **not** this repo's
  README, `CLAUDE.md`, protocol, ESLint config, or git history. That exclusion is load-bearing rather
  than tidiness: Claude Code loads `CLAUDE.md` automatically, so a plain worktree would have announced
  to the agent that it was being measured, and the committed ESLint config enumerates the exact rules
  its output is scored against. An agent that can read the rubric is not the thing being measured.
  The base also carries no example test, so nothing in it demonstrates a locator or waiting style.
  Its `playwright.config.ts` is functionally identical to this repo's — same env switches, same
  `retries: 0` — differing only in comments, which are written neutrally for the same reason.
  Arm A uses `gen-base-a`. Arm B uses `gen-base-b`: the same tree plus
  `.claude/skills/playwright-conventions/SKILL.md`. Nothing else differs between the arms.
- **The agent may run its suite while generating.** That is how these tools are actually used, and
  forbidding it would measure something no one ships. All metrics below come from our re-execution
  of the committed raw output afterward.
- **Runs per arm: 3.** LLM output varies; one run is an anecdote. Every run's raw output is committed
  untouched under `arms/`, and every session transcript is committed under `logs/`.

## Metrics

| # | Metric | Operational definition |
|---|--------|------------------------|
| 1 | Tests generated | Count from `npx playwright test --list` on the raw output. |
| 2 | First-run pass rate | % of tests passing on measurement run 1 (`workers=1`), zero edits. Mean and min–max over all 10 runs reported alongside. |
| 3 | Flake rate | % of tests with at least one pass **and** one fail across 10 consecutive `workers=1` runs of the unedited suite. A timeout counts as a fail. |
| 4 | Isolation failures | Each test executed alone (`file:line`); count of tests whose solo result differs from their run-1 full-suite result. |
| 5 | Parallel failures | One run at `workers=4`, fully parallel; count of tests failing there that passed at `workers=1` run 1. |
| 6 | Convention violations | Automated ESLint hits from the pinned rule set below, reported per rule. Grep heuristics are suspect-flags only: each hit is counted **only after manual confirmation**, with the confirming snippet quoted in the taxonomy doc. |
| 7 | Manual repair rate | % of run-1 tests requiring any code edit to reach **both** (a) 10/10 passes at `workers=1` and (b) zero lint-gate violations. Formatting-only edits do not count. A test asserting behavior the app does not have is discarded and counts as repaired. Repair is performed on run 1 of each arm only; runs 2–3 get automated metrics only. Every repair is logged in `arms/<arm>/repaired/REPAIRS.md` with its taxonomy category. |

## Lint gate

`eslint-plugin-playwright` 2.11.0, all at `error`:

`no-wait-for-timeout`, `no-wait-for-selector`, `no-force-option`, `no-element-handle`, `no-eval`,
`no-networkidle`, `no-conditional-in-test`, `no-conditional-expect`, `expect-expect`, `valid-expect`,
`prefer-web-first-assertions`, `missing-playwright-await`, `no-page-pause`, `no-focused-test`,
`no-skipped-test`, `no-standalone-expect`.

Reported separately as informational (not part of the repair gate, because it flags some legitimate
code): `no-raw-locators` — a proxy for "used a CSS selector where a role/label locator exists."

Files that fail to parse are reported as `unparseable` — that is itself a finding, not an exclusion.

### Grep heuristics (suspect flags → taxonomy category, manual confirmation required)

| Pattern | Suspected category |
|---------|--------------------|
| `waitForTimeout\(` / `setTimeout\(` | Hard waits |
| `nth-child` / `nth-of-type` / `\.nth\(` / `nth=` | Brittle selectors |
| `locator\(['"][.#]` (class/id CSS) | Brittle selectors |
| `localStorage` / `sessionStorage` / `addInitScript` / `page\.evaluate` | UI bypass |
| `describe\.serial` | Order dependence |
| Top-level mutable state shared across tests (manual read) | Order dependence |

## Failure taxonomy

Every failing or violating test gets one primary classification:

1. **Hard waits** — fixed timeouts instead of auto-waiting assertions
2. **Brittle selectors** — positional or generated-class selectors where a role/label exists
3. **Order dependence** — passes in sequence, fails alone, or vice versa; shared mutable state
4. **Assertions that cannot fail** — always-true assertions, unawaited assertions, asserting the locator rather than its state
5. **Missing negative cases** — happy path only; no empty state, validation, or boundaries
6. **UI bypass** — seeding state through storage/JS while claiming to exercise the UI

Examples with real snippets live in `docs/failure-taxonomy.md`.

## Decision rules, fixed in advance

- The CI suite in `tests/` is **repaired arm B run 1** — chosen now because it should embody the
  conventions. If arm B is unusable, repaired arm A run 1 is promoted instead and the swap disclosed.
- If the skill does not trigger in an arm B session (verified in the session transcript), that run is
  discarded and re-run once with the line "Use the playwright-conventions skill." appended to the
  prompt. The deviation is disclosed in the README next to the results.
- If the target site is unreachable during a measurement block, the block restarts once it is back.
  The target never changes mid-experiment.
- Results are published whatever they show. A null or negative skill effect is a finding, not a
  problem, and gets reported with the same prominence a positive one would.
