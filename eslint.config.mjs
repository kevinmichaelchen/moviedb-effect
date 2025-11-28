import tseslint from 'typescript-eslint'
import eslint from '@eslint/js'
import globals from 'globals'
import * as effectPlugin from '@effect/eslint-plugin'

export default tseslint.config(
  {
    ignores: ['**/dist', '**/node_modules', '**/coverage', '.nx'],
  },
  eslint.configs.recommended,
  ...tseslint.configs.recommended,
  ...tseslint.configs.stylistic,
  ...effectPlugin.configs.dprint,
  {
    files: ['packages/**/*.ts'],
    rules: {
      '@effect/dprint': ['error', {
        config: {
          semiColons: 'asi',
          quoteStyle: 'preferSingle',
          trailingCommas: 'onlyMultiLine',
        },
      }],
      '@effect/no-import-from-barrel-package': 'error',
    },
    languageOptions: {
      parserOptions: {
        project: ['./packages/*/tsconfig.json'],
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },
  {
    files: ['**/*.js', '**/*.cjs', '**/*.mjs'],
    languageOptions: {
      globals: {
        ...globals.node,
      },
    },
  },
  {
    files: ['**/*.spec.js'],
    rules: {
      '@typescript-eslint/no-require-imports': 'off',
    },
  },
)
