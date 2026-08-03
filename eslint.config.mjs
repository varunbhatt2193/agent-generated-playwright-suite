import tseslint from 'typescript-eslint';
import playwright from 'eslint-plugin-playwright';

// The convention gate. This rule set is pinned by docs/protocol.md and must not drift once the
// protocol is frozen: metric 6 (convention violations) is defined as the hits these rules produce.
export const gateRules = {
  'playwright/no-wait-for-timeout': 'error',
  'playwright/no-wait-for-selector': 'error',
  'playwright/no-force-option': 'error',
  'playwright/no-element-handle': 'error',
  'playwright/no-eval': 'error',
  'playwright/no-networkidle': 'error',
  'playwright/no-conditional-in-test': 'error',
  'playwright/no-conditional-expect': 'error',
  'playwright/expect-expect': 'error',
  'playwright/valid-expect': 'error',
  'playwright/prefer-web-first-assertions': 'error',
  'playwright/missing-playwright-await': 'error',
  'playwright/no-page-pause': 'error',
  'playwright/no-focused-test': 'error',
  'playwright/no-skipped-test': 'error',
  'playwright/no-standalone-expect': 'error',
};

export const lintedFiles = ['tests/**/*.ts', 'arms/**/*.ts', 'smoke/**/*.ts'];

export const ignores = [
  'node_modules/**',
  'test-results/**',
  'playwright-report/**',
  'blob-report/**',
  'planning/**',
];

export default [
  { ignores },
  {
    files: lintedFiles,
    languageOptions: { parser: tseslint.parser },
    plugins: { playwright },
    rules: gateRules,
  },
];
