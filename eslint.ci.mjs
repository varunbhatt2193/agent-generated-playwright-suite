import tseslint from 'typescript-eslint';
import playwright from 'eslint-plugin-playwright';
import { gateRules, ignores } from './eslint.config.mjs';

// CI lints the shipped suite with the gate corrected, not the gate as frozen.
//
// `eslint.config.mjs` is the measurement instrument and must not change: metric 6 is defined as the
// hits it produces, and editing it now would silently rewrite results already recorded for six runs.
// But the shipped suite delegates its assertions to page-object helpers, and expect-expect cannot see
// inside them — 28 of the promoted suite's 28 gate hits are that false positive, documented in
// arms/b-skill/repaired/REPAIRS.md. Enforcing a rule we have demonstrated is wrong would mean either
// a permanently red pipeline or deleting a good abstraction to satisfy it.
const assertFunctionNames = [
  'expect',
  'expectCompletion',
  'expectCounter',
  'expectEmptyState',
  'expectVisibleTodos',
];

export default [
  { ignores: [...ignores, 'arms/**'] },
  {
    files: ['tests/**/*.ts', 'smoke/**/*.ts'],
    languageOptions: { parser: tseslint.parser },
    plugins: { playwright },
    rules: {
      ...gateRules,
      'playwright/expect-expect': ['error', { assertFunctionNames }],
    },
  },
];
