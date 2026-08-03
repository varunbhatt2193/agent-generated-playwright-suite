import tseslint from 'typescript-eslint';
import playwright from 'eslint-plugin-playwright';
import { gateRules, lintedFiles, ignores } from './eslint.config.mjs';

// Reported alongside the gate but never part of the repair criterion: no-raw-locators flags some
// legitimate code, so a hit here is a suspect to confirm by hand, not a defect by itself.
export default [
  { ignores },
  {
    files: lintedFiles,
    languageOptions: { parser: tseslint.parser },
    plugins: { playwright },
    rules: { ...gateRules, 'playwright/no-raw-locators': 'error' },
  },
];
