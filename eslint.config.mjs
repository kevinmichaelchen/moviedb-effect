import tseslint from 'typescript-eslint'
import eslint from '@eslint/js'
import globals from 'globals'
import effectPlugin from '@effect/eslint-plugin'

export default tseslint.config(
  {
    ignores: ['**/dist', '**/node_modules', '**/coverage', '.nx'],
  },
  eslint.configs.recommended,
  ...tseslint.configs.recommended,
  ...tseslint.configs.stylistic,
  {
    files: ['packages/**/*.ts'],
    plugins: {
      '@effect': effectPlugin,
    },
    rules: {
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
