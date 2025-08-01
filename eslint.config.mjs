import { FlatCompat } from '@eslint/eslintrc'
import { dirname } from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const compat = new FlatCompat({
  baseDirectory: __dirname,
})

const eslintConfig = [
  ...compat.config({
    plugins: ['@stylistic', 'prettier'],
    extends: ['next', 'prettier', 'next/core-web-vitals', 'next/typescript'],
    rules: {
      quotes: ['error', 'single'],
      semi: ['error', 'never'],
      // '@stylistic/eslint-plugin': ['error', 'prefer-single'],
      'prettier/prettier': [
        'error',
        {
          singleQuote: true,
          semi: false,
          jsxSingleQuote: true,
        },
      ],
    },
  }),
]

export default eslintConfig
