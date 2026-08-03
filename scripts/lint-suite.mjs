#!/usr/bin/env node
//
// Convention-violation pass for one suite.
//
//   node scripts/lint-suite.mjs <suiteDir> <outDir>
//
// Runs the pinned gate rules, then the informational config (adds no-raw-locators), then the
// protocol's grep heuristics. Writes lint.json, appends a violations table to summary.md if one is
// there, and writes grep-suspects.md — which is a worklist of things to confirm by hand, not a count
// of defects. Per docs/protocol.md a grep hit is only counted once a human has confirmed it.
//
import { spawnSync } from 'node:child_process';
import { mkdirSync, writeFileSync, appendFileSync, existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { join, resolve, relative } from 'node:path';

const [suiteDir, outDir] = process.argv.slice(2);
if (!suiteDir || !outDir) {
  console.error('usage: lint-suite.mjs <suiteDir> <outDir>');
  process.exit(2);
}

const repoRoot = resolve(new URL('..', import.meta.url).pathname);
mkdirSync(outDir, { recursive: true });

function eslint(extra) {
  const res = spawnSync('npx', ['eslint', ...extra, suiteDir, '--format', 'json'], {
    cwd: repoRoot,
    encoding: 'utf8',
    maxBuffer: 64 * 1024 * 1024,
  });
  // eslint exits 1 when it finds errors, which is the normal case here.
  try {
    return JSON.parse(res.stdout);
  } catch {
    console.error(res.stderr?.slice(0, 4000));
    return null;
  }
}

function tally(results) {
  const byRule = {};
  let unparseable = [];
  for (const file of results ?? []) {
    for (const m of file.messages ?? []) {
      if (m.fatal || !m.ruleId) {
        unparseable.push({ file: relative(repoRoot, file.filePath), line: m.line, message: m.message });
        continue;
      }
      byRule[m.ruleId] = (byRule[m.ruleId] ?? 0) + 1;
    }
  }
  return { byRule, unparseable };
}

const gate = tally(eslint([]));
const info = tally(eslint(['-c', 'eslint.informational.mjs']));

const gateTotal = Object.values(gate.byRule).reduce((a, b) => a + b, 0);
const rawLocators = info.byRule['playwright/no-raw-locators'] ?? 0;

// --- grep heuristics -------------------------------------------------------------------------
const HEURISTICS = [
  { category: 'Hard waits', re: /waitForTimeout\(|setTimeout\(/ },
  { category: 'Brittle selectors', re: /nth-child|nth-of-type|\.nth\(|nth=/ },
  { category: 'Brittle selectors', re: /locator\(\s*['"`][.#]/ },
  { category: 'UI bypass', re: /localStorage|sessionStorage|addInitScript|page\.evaluate/ },
  { category: 'Order dependence', re: /describe\.serial/ },
];

function walk(dir, acc = []) {
  for (const entry of readdirSync(dir)) {
    const p = join(dir, entry);
    if (statSync(p).isDirectory()) walk(p, acc);
    else if (p.endsWith('.ts')) acc.push(p);
  }
  return acc;
}

const suspects = new Map();
const files = existsSync(suiteDir) ? walk(suiteDir) : [];
for (const f of files) {
  const lines = readFileSync(f, 'utf8').split('\n');
  lines.forEach((text, i) => {
    // Several patterns map to one category, so a line matching two of them is still one suspect.
    const matched = new Set(HEURISTICS.filter((h) => h.re.test(text)).map((h) => h.category));
    for (const category of matched) {
      if (!suspects.has(category)) suspects.set(category, []);
      suspects.get(category).push({ file: relative(repoRoot, f), line: i + 1, text: text.trim() });
    }
  });
}

const suspectCount = [...suspects.values()].reduce((a, b) => a + b.length, 0);

writeFileSync(
  join(outDir, 'lint.json'),
  JSON.stringify(
    {
      suiteDir,
      files: files.length,
      gate: { total: gateTotal, byRule: gate.byRule, unparseable: gate.unparseable },
      informational: { noRawLocators: rawLocators },
      grepSuspects: Object.fromEntries([...suspects].map(([k, v]) => [k, v.length])),
    },
    null,
    2,
  ),
);

const ruleRows = Object.entries(gate.byRule).sort((a, b) => b[1] - a[1]);
const table = [
  '',
  '## Convention violations',
  '',
  `Gate rules (pinned in docs/protocol.md), across ${files.length} file(s):`,
  '',
  '| Rule | Hits |',
  '|---|---|',
  ...(ruleRows.length ? ruleRows.map(([r, n]) => `| \`${r}\` | ${n} |`) : [['| _none_ | 0 |']]),
  `| **total** | **${gateTotal}** |`,
  '',
  `Informational, not part of the repair gate: \`playwright/no-raw-locators\` — ${rawLocators} hit(s).`,
  '',
  gate.unparseable.length
    ? `**${gate.unparseable.length} file(s) failed to parse** — recorded, not excluded:\n\n` +
      gate.unparseable.map((u) => `- \`${u.file}:${u.line}\` ${u.message}`).join('\n') + '\n'
    : 'All files parsed.\n',
].join('\n');

const summaryPath = join(outDir, 'summary.md');
if (existsSync(summaryPath)) appendFileSync(summaryPath, table);
else writeFileSync(summaryPath, `# Lint — \`${suiteDir}\`\n${table}`);

const suspectDoc = [
  `# Grep suspects — \`${suiteDir}\``,
  '',
  'Pattern matches only. Per the protocol these are **not** counted as violations until confirmed by',
  'reading the code: `page.evaluate` in a test that is genuinely about storage is not a UI bypass, and',
  '`.nth()` on a genuinely positional assertion is not a brittle selector. Tick a box once confirmed.',
  '',
  ...(suspectCount === 0
    ? ['No pattern matches.']
    : [...suspects].flatMap(([category, hits]) => [
        `## ${category} (${hits.length})`,
        '',
        ...hits.map((h) => `- [ ] \`${h.file}:${h.line}\` — \`${h.text.slice(0, 160)}\``),
        '',
      ])),
].join('\n');
writeFileSync(join(outDir, 'grep-suspects.md'), suspectDoc);

console.log(
  `lint ${suiteDir}: ${gateTotal} gate violation(s) across ${files.length} file(s), ` +
    `${rawLocators} raw-locator hit(s), ${suspectCount} grep suspect(s) to confirm`,
);
