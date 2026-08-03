# Repairs — arm A, run 1

**No repairs were required. This directory is byte-identical to `../run-1/`.**

Manual repair rate: **0%** (0 of 66 tests).

The protocol's repair criterion is that every test must reach both (a) 10 passes out of 10 at
`workers=1` and (b) zero lint-gate violations. Run 1 met both as generated:

- 66/66 tests passed on all 10 sequential runs (`metrics/a-run-1/summary.json`)
- 0 gate violations, and the single informational `no-raw-locators` hit was confirmed by hand as
  correct usage — `expect(app.titles.first().locator('b')).toHaveCount(0)` asserts that markup in a
  title renders as literal text, which has no role or label equivalent
- 0 isolation failures and 0 new failures under `workers=4` fully parallel

Because this directory is identical to the raw output, the measurement in `metrics/a-run-1/` is
itself the verification; re-running it against a copy would produce the same numbers from the same
bytes. `diff -r arms/a-baseline/run-1 arms/a-baseline/repaired` is empty apart from this file.

The directory exists anyway so that both arms have the same shape and the promotion step in the CI
suite works the same way for either. An empty repair log is a result, not an omission — the
alternative, inventing edits to justify the stage, would have corrupted the metric it exists to
produce.

Two things were noted during the read but deliberately **not** repaired, because they are outside the
pre-registered criterion and changing them would make this directory something other than "run 1 made
to pass and lint clean":

- `filters.spec.ts` and `persistence.spec.ts` seed `localStorage` through `addInitScript` to arrange
  preconditions. Confirmed legitimate in `docs/failure-taxonomy.md` §6.
- Several `describe` blocks share a `let app` reassigned in `beforeEach`. Confirmed safe, empirically,
  by the isolation and parallel probes.
