/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
// @ts-expect-error missing types
import shuunen from 'eslint-plugin-shuunen'

// biome-ignore lint/style/noDefaultExport: <explanation>
export default [
  ...shuunen.configs.base,
  // ...shuunen.configs.node,
  // ...shuunen.configs.browser,
  ...shuunen.configs.typescript,
  {
    files: ["**/*.ts", "**/*.tsx"],
    name: "stuff-finder-overrides",
    rules: {
      '@typescript-eslint/prefer-readonly-parameter-types': 'off', // annoying
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
