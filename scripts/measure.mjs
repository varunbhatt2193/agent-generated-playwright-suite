#!/usr/bin/env node
//
// Measures one suite against the protocol in docs/protocol.md.
//
//   node scripts/measure.mjs <suiteDir> <outDir> [--runs 10]
//
// Runs the suite N times sequentially, then once per test in isolation, then once fully parallel,
// and writes summary.json + summary.md. Never edits the suite. Exits 0 even when tests fail —
// failures are the measurement, not an error.
//
import { spawnSync } from 'node:child_process';
import { mkdirSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';

const args = process.argv.slice(2);
const suiteDir = args[0];
const outDir = args[1];
const runsFlag = args.indexOf('--runs');
const RUNS = runsFlag === -1 ? 10 : Number(args[runsFlag + 1]);

if (!suiteDir || !outDir) {
  console.error('usage: measure.mjs <suiteDir> <outDir> [--runs 10]');
  process.exit(2);
}

const repoRoot = resolve(new URL('..', import.meta.url).pathname);
mkdirSync(outDir, { recursive: true });

const MAX_BUFFER = 256 * 1024 * 1024;

function playwright(extraArgs, env) {
  const res = spawnSync(
    'npx',
    ['playwright', 'test', '--reporter=json', ...extraArgs],
    {
      cwd: repoRoot,
      encoding: 'utf8',
      maxBuffer: MAX_BUFFER,
      env: { ...process.env, PW_TEST_DIR: suiteDir, ...env },
    },
  );
  return res;
}

// Playwright prints the JSON report to stdout, but a crash or a config error can prepend noise,
// so fall back to slicing between the outermost braces before giving up.
function parseReport(stdout) {
  if (!stdout) return null;
  try {
    return JSON.parse(stdout);
  } catch {
    const start = stdout.indexOf('{');
    const end = stdout.lastIndexOf('}');
    if (start === -1 || end <= start) return null;
    try {
      return JSON.parse(stdout.slice(start, end + 1));
    } catch {
      return null;
    }
  }
}

// A report's suites nest: the outermost level is one suite per file, describes nest inside it.
function collectSpecs(suite, ancestorTitles, depth, out) {
  const titles = depth === 0 ? ancestorTitles : [...ancestorTitles, suite.title];
  for (const spec of suite.specs ?? []) {
    out.push({
      file: spec.file ?? suite.file,
      line: spec.line,
      title: [...titles, spec.title].join(' > '),
    });
  }
  for (const child of suite.suites ?? []) {
    collectSpecs(child, titles, depth + 1, out);
  }
}

function specsOf(report) {
  const out = [];
  for (const suite of report?.suites ?? []) collectSpecs(suite, [], 0, out);
  return out;
}

const idOf = (s) => `${s.file}:${s.line} :: ${s.title}`;

// Status of every spec in a report, keyed by id. A spec absent from the report simply has no entry.
function statusesOf(report) {
  const map = new Map();
  const walk = (suite, ancestorTitles, depth) => {
    const titles = depth === 0 ? ancestorTitles : [...ancestorTitles, suite.title];
    for (const spec of suite.specs ?? []) {
      const id = idOf({ file: spec.file ?? suite.file, line: spec.line, title: [...titles, spec.title].join(' > ') });
      const results = (spec.tests ?? []).flatMap((t) => t.results ?? []);
      const last = results[results.length - 1];
      map.set(id, last?.status ?? 'missing');
    }
    for (const child of suite.suites ?? []) walk(child, titles, depth + 1);
  };
  for (const suite of report?.suites ?? []) walk(suite, [], 0);
  return map;
}

const pct = (n, d) => (d === 0 ? 0 : Math.round((n / d) * 1000) / 10);

console.log(`measuring ${suiteDir} -> ${outDir} (${RUNS} sequential runs)`);

// --- inventory -------------------------------------------------------------------------------
const listRes = playwright(['--list'], { PW_WORKERS: '1' });
const listReport = parseReport(listRes.stdout);
const specs = specsOf(listReport);
writeFileSync(join(outDir, 'list.json'), listRes.stdout ?? '');

if (specs.length === 0) {
  const note =
    `# ${suiteDir}\n\n**No tests found.** Playwright listed 0 tests in this directory.\n\n` +
    `That is a measurement result, not a failure of the harness: an agent that produced no runnable\n` +
    `tests scores zero on every metric below.\n\n` +
    '```\n' + (listRes.stderr ?? '').slice(0, 2000) + '\n```\n';
  writeFileSync(join(outDir, 'summary.md'), note);
  writeFileSync(
    join(outDir, 'summary.json'),
    JSON.stringify({ suiteDir, testCount: 0, tests: [] }, null, 2),
  );
  console.log('no tests found — wrote summary and stopped');
  process.exit(0);
}

// Duplicate ids would silently merge two different tests into one row.
const seen = new Map();
for (const s of specs) {
  const base = idOf(s);
  const n = (seen.get(base) ?? 0) + 1;
  seen.set(base, n);
  s.id = n === 1 ? base : `${base} #${n}`;
}
console.log(`  ${specs.length} tests`);

// --- sequential runs -------------------------------------------------------------------------
const runStatuses = [];
for (let i = 1; i <= RUNS; i++) {
  const res = playwright([], { PW_WORKERS: '1' });
  const report = parseReport(res.stdout);
  writeFileSync(join(outDir, `run-${i}.json`), res.stdout ?? '');
  if (!report) {
    console.log(`  run ${i}: report unreadable — recorded as error`);
    runStatuses.push(new Map());
    continue;
  }
  const statuses = statusesOf(report);
  runStatuses.push(statuses);
  const passed = [...statuses.values()].filter((s) => s === 'passed').length;
  console.log(`  run ${i}: ${passed}/${specs.length} passed`);
}

// --- isolation -------------------------------------------------------------------------------
// Each test alone, to catch order dependence: a test that only passes with its neighbours.
console.log('  isolation pass...');
const soloStatus = new Map();
for (const [idx, s] of specs.entries()) {
  let res = playwright([`${s.file}:${s.line}`], { PW_WORKERS: '1' });
  let report = parseReport(res.stdout);
  // Depending on how the report reports paths, the filter may need the suite dir prefix.
  if (specsOf(report).length === 0) {
    res = playwright([`${join(suiteDir, s.file)}:${s.line}`], { PW_WORKERS: '1' });
    report = parseReport(res.stdout);
  }
  writeFileSync(join(outDir, `iso-${idx + 1}.json`), res.stdout ?? '');
  const statuses = statusesOf(report);
  soloStatus.set(s.id, statuses.get(s.id) ?? [...statuses.values()][0] ?? 'missing');
}

// --- parallel probe --------------------------------------------------------------------------
console.log('  parallel probe (workers=4)...');
const parRes = playwright([], { PW_WORKERS: '4', PW_FULLY_PARALLEL: '1' });
writeFileSync(join(outDir, 'parallel.json'), parRes.stdout ?? '');
const parStatus = statusesOf(parseReport(parRes.stdout));

// --- aggregate -------------------------------------------------------------------------------
const tests = specs.map((s) => {
  const statuses = runStatuses.map((m) => m.get(s.id) ?? 'missing');
  const passCount = statuses.filter((x) => x === 'passed').length;
  const run1 = statuses[0];
  const solo = soloStatus.get(s.id) ?? 'missing';
  const par = parStatus.get(s.id) ?? 'missing';
  return {
    id: s.id,
    file: s.file,
    line: s.line,
    title: s.title,
    statuses,
    passCount,
    run1,
    flaky: passCount > 0 && passCount < statuses.length,
    solo,
    soloDiffers: (solo === 'passed') !== (run1 === 'passed'),
    parallel: par,
    parallelNewFailure: run1 === 'passed' && par !== 'passed',
  };
});

const run1Passed = tests.filter((t) => t.run1 === 'passed').length;
const perRunPassRates = runStatuses.map(
  (m) => pct([...m.values()].filter((x) => x === 'passed').length, specs.length),
);

const summary = {
  suiteDir,
  measuredRuns: RUNS,
  testCount: specs.length,
  run1PassRate: pct(run1Passed, specs.length),
  meanPassRate: Math.round((perRunPassRates.reduce((a, b) => a + b, 0) / RUNS) * 10) / 10,
  minPassRate: Math.min(...perRunPassRates),
  maxPassRate: Math.max(...perRunPassRates),
  perRunPassRates,
  flakeRate: pct(tests.filter((t) => t.flaky).length, specs.length),
  flakyCount: tests.filter((t) => t.flaky).length,
  isolationDiffCount: tests.filter((t) => t.soloDiffers).length,
  parallelNewFailures: tests.filter((t) => t.parallelNewFailure).length,
  neverPassed: tests.filter((t) => t.passCount === 0).length,
  alwaysPassed: tests.filter((t) => t.passCount === RUNS).length,
  tests,
};
writeFileSync(join(outDir, 'summary.json'), JSON.stringify(summary, null, 2));

const md = [
  `# Measurement — \`${suiteDir}\``,
  '',
  `${RUNS} sequential runs at \`workers=1\`, one isolated run per test, one fully parallel run at`,
  '`workers=4`. Retries are 0, so every status below is a first attempt.',
  '',
  '| Metric | Value |',
  '|---|---|',
  `| Tests generated | ${summary.testCount} |`,
  `| First-run pass rate | ${summary.run1PassRate}% (${run1Passed}/${summary.testCount}) |`,
  `| Pass rate across ${RUNS} runs | mean ${summary.meanPassRate}%, range ${summary.minPassRate}–${summary.maxPassRate}% |`,
  `| Flake rate | ${summary.flakeRate}% (${summary.flakyCount} inconsistent across ${RUNS} runs) |`,
  `| Isolation failures | ${summary.isolationDiffCount} |`,
  `| Parallel failures | ${summary.parallelNewFailures} |`,
  `| Never passed | ${summary.neverPassed} |`,
  `| Passed every run | ${summary.alwaysPassed} |`,
  '',
  '## Per test',
  '',
  '| Test | Run 1 | Passed | Flaky | Alone | Parallel |',
  '|---|---|---|---|---|---|',
  ...tests.map(
    (t) =>
      `| \`${t.file}:${t.line}\` ${t.title} | ${t.run1} | ${t.passCount}/${RUNS} | ${t.flaky ? '**yes**' : 'no'} | ${t.solo}${t.soloDiffers ? ' **(differs)**' : ''} | ${t.parallel}${t.parallelNewFailure ? ' **(new failure)**' : ''} |`,
  ),
  '',
].join('\n');
writeFileSync(join(outDir, 'summary.md'), md);

console.log(
  `done: ${summary.testCount} tests, first-run ${summary.run1PassRate}%, flake ${summary.flakeRate}%`,
);
