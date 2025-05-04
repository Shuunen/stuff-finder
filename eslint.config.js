import { base } from 'eslint-plugin-shuunen/configs/base'
import { browser } from 'eslint-plugin-shuunen/configs/browser'
import { typescript } from 'eslint-plugin-shuunen/configs/typescript'

// biome-ignore lint/style/noDefaultExport: <explanation>
export default [
  ...base,
  ...browser,
  ...typescript,
  {
    files: ["**/*.ts", "**/*.tsx"],
    name: "stuff-finder-overrides",
    rules: {
      '@typescript-eslint/prefer-readonly-parameter-types': 'off', // annoying
      'unicorn/no-useless-undefined': 'off', // annoying
    },
  },
  {
    files: ["**/*.tsx"],
    name: "stuff-finder-tsx-overrides",
    rules: {
      "@typescript-eslint/no-misused-promises": "off", // annoying
      "jsdoc/require-jsdoc": "off", // no thanks :p
    },
  },
]
