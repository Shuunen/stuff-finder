import shuunen from 'eslint-plugin-shuunen'

const noRestrictedSyntaxRule = shuunen.configs.base[1]?.rules?.['no-restricted-syntax']
const /** @type {object[]} */ noRestrictedSyntaxRules = Array.isArray(noRestrictedSyntaxRule) ? noRestrictedSyntaxRule.slice(1) : []

// biome-ignore lint/style/noDefaultExport: <explanation>
export default [
  ...shuunen.configs.base,
  // ...shuunen.configs.node,
  ...shuunen.configs.browser,
  ...shuunen.configs.typescript,
  {
    files: ["**/*.ts", "**/*.tsx"],
    name: "stuff-finder-overrides",
    rules: {
      '@typescript-eslint/prefer-readonly-parameter-types': 'off', // annoying
      'no-restricted-syntax': [
        'error',
        ...noRestrictedSyntaxRules,
        {
          message: 'Throw statements are not allowed, use Result pattern or something else',
          selector: 'ThrowStatement',
        },
      ],
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
