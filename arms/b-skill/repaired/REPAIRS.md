# Repairs — arm B, run 1

**No repairs were made. This directory is byte-identical to `../run-1/`.**

Manual repair rate: **0%** (0 of 71 tests) — with a documented deviation from the pre-registered
criterion, explained below. Read that part before quoting the number.

## Against the criterion as written

The protocol requires a repaired suite to reach both (a) 10 passes out of 10 at `workers=1` and
(b) zero lint-gate violations. Run 1 meets (a) outright: 71/71 tests passed on all 10 sequential runs,
0 isolation failures, 0 new failures at `workers=4` (`metrics/b-run-1/summary.json`).

It does **not** meet (b). The gate reports 28 violations, all `playwright/expect-expect`. Every one is
a false positive: the tests assert through four page-object helpers — `expectCompletion`,
`expectCounter`, `expectEmptyState`, `expectVisibleTodos` — and the rule only recognises `expect`
called directly in a test body.

## Why nothing was changed anyway

Satisfying the criterion literally would mean inlining those helpers so the linter can see the
assertions, deleting an abstraction in order to score better against a rule that is wrong about it.
That would make the code worse, inflate arm B's repair rate to roughly 40%, and manufacture exactly
the result the measurement exists to avoid.

The pre-registered criterion is what is faulty here, not the code, and the honest response is to say
so rather than either quietly rewriting the rule or quietly mangling the suite. Both readings are
therefore published:

| Reading | Arm B run 1 repair rate |
|---|---|
| Criterion as written (zero gate hits) | ~40% — 28 hits across the suite, every one a false positive |
| Confirmed defects only | 0% |

The second number is the one used in the README, and this file is the reason it can be.

The deeper finding — that the gate's raw counts invert the comparison between the two arms — is in
`docs/failure-taxonomy.md`. It is the most interesting thing this project produced, and it came out of
refusing to make this edit.

## Note for CI

The promoted copy of this suite in `tests/` is linted with `eslint.ci.mjs`, which sets
`assertFunctionNames` so the gate can see the helpers. `eslint.config.mjs` is left untouched: it is
the frozen measurement instrument and changing it after the fact would invalidate metric 6 for every
run already measured.
