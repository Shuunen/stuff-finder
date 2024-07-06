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
    files: ["**/*.tsx"],
    rules: {
      "@typescript-eslint/no-misused-promises": "off", // annoying
      "jsdoc/require-jsdoc": "off", // no thanks :p
    },
  },
]
