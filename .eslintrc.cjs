const rules = {
  '@stylistic/array-element-newline': 'off',
  '@stylistic/arrow-parens': 'off',
  '@stylistic/brace-style': 'off',
  '@stylistic/comma-dangle': [
    'error',
    'always-multiline',
  ],
  '@stylistic/dot-location': 'off',
  '@stylistic/function-call-argument-newline': 'off',
  '@stylistic/indent': [
    'error',
    2, // eslint-disable-line no-magic-numbers
  ],
  '@stylistic/lines-around-comment': 'off',
  '@stylistic/member-delimiter-style': [
    'error',
    {
      multiline: {
        delimiter: 'none',
      },
    },
  ],
  '@stylistic/multiline-comment-style': 'off', // not needed
  '@stylistic/multiline-ternary': 'off',
  '@stylistic/object-curly-spacing': [
    'error',
    'always',
  ],
  '@stylistic/object-property-newline': 'off',
  '@stylistic/padded-blocks': 'off',
  '@stylistic/quote-props': [
    'error',
    'consistent-as-needed',
  ],
  '@stylistic/quotes': [
    'error',
    'single',
  ],
  '@stylistic/semi': [
    'error',
    'never',
  ],
  '@typescript-eslint/array-type': 'off',
  '@typescript-eslint/consistent-indexed-object-style': 'off',
  '@typescript-eslint/consistent-type-definitions': 'off',
  '@typescript-eslint/consistent-type-imports': [
    'error',
    {
      fixStyle: 'inline-type-imports',
      prefer: 'type-imports',
    },
  ],
  '@typescript-eslint/explicit-function-return-type': 'off',
  '@typescript-eslint/lines-between-class-members': 'off',
  '@typescript-eslint/no-confusing-void-expression': 'off',
  '@typescript-eslint/no-misused-promises': 'off',
  '@typescript-eslint/no-type-alias': 'off',
  '@typescript-eslint/no-unused-vars': [
    'error',
    {
      argsIgnorePattern: '^_',
      varsIgnorePattern: '^(_|global)',
    },
  ],
  '@typescript-eslint/parameter-properties': [
    'error',
    {
      prefer: 'parameter-property',
    },
  ],
  '@typescript-eslint/prefer-destructuring': 'off',
  '@typescript-eslint/prefer-readonly-parameter-types': 'off',
  'capitalized-comments': 'off',
  'compat/compat': 'off',
  'curly': [
    'error',
    'multi',
  ],
  'eslint-comments/no-use': 'off',
  'etc/no-commented-out-code': 'off',
  'etc/no-const-enum': 'off',
  'etc/no-deprecated': 'off',
  'etc/no-enum': 'off',
  'etc/no-internal': 'off',
  'etc/no-misused-generics': 'off',
  'etc/prefer-interface': 'off',
  'ext/lines-between-object-properties': 'off',
  'func-names': [
    'error',
    'always',
  ],
  'functional/no-loop-statements': 'off',
  'id-length': [
    'error',
    {
      exceptions: ['t'],
      min: 2,
    },
  ],
  'import/default': 'off',
  'import/export': 'off',
  'import/extensions': 'off',
  'import/first': 'off',
  'import/named': 'off',
  'import/namespace': 'off',
  'import/newline-after-import': 'off',
  'import/no-absolute-path': 'off',
  'import/no-amd': 'off',
  'import/no-cycle': 'off',
  'import/no-deprecated': 'off',
  'import/no-duplicates': 'off',
  'import/no-dynamic-require:': 'off',
  'import/no-extraneous-dependencies': 'off',
  'import/no-import-module-exports': 'off',
  'import/no-mutable-exports': 'off',
  'import/no-named-as-default': 'off',
  'import/no-named-as-default-member': 'off',
  'import/no-named-default': 'off',
  'import/no-relative-packages': 'off',
  'import/no-self-import': 'off',
  'import/no-unassigned-import': 'off',
  'import/no-unresolved': 'off',
  'import/no-unused-modules': 'off',
  'import/no-useless-path-segments': 'off',
  'import/no-webpack-loader-syntax': 'off',
  'import/order': 'off',
  'import/prefer-default-export': 'off',
  'jest/no-deprecated-functions': 'off',
  'jsx-a11y/click-events-have-key-events': 'off',
  'jsx-a11y/no-noninteractive-element-interactions': 'off',
  'jsx-a11y/no-static-element-interactions': 'off',
  'line-comment-position': 'off',
  'lines-around-comment': 'off',
  'lines-between-class-members': 'off',
  'logical-assignment-operators': 'off',
  'max-len': 'off',
  'max-statements-per-line': 'off',
  'no-console': 'error',
  'no-inline-comments': 'off',
  'no-restricted-imports': [
    'error',
    {
      paths: [
        {
          importNames: ['storage'],
          message: 'Please import \'storage\' from \'@/utils/storage.utils\' instead.',
          name: 'shuutils',
        },
        {
          message: 'Please use import specific components from @mui/material',
          name: '@mui/material',
        },
        {
          message: 'Please import from preact/hooks instead',
          name: 'react',
        },
      ],
    },
  ],
  'no-restricted-syntax': [
    'error',
    {
      message: 'Avoid using Class, just use good old unit-testable functions :)',
      selector: 'ClassDeclaration',
    },
  ],
  'padding-line-between-statements': 'off',
  'prefer-destructuring': 'off',
  'prettier/prettier': 'off',
  'putout/putout': 'off',
  'quotes': 'off',
  'regexp/require-unicode-sets-regexp': 'off',
  'require-atomic-updates': [
    'error',
    {
      allowProperties: true, // eslint-disable-line @typescript-eslint/naming-convention
    },
  ],
  'simple-import-sort/imports': 'off',
  'space-before-function-paren': [
    'error',
    'always',
  ],
  'ssr-friendly/no-dom-globals-in-module-scope': 'off',
  'strict': 'off',
  'total-functions/no-partial-division': 'off',
  'total-functions/no-unsafe-readonly-mutable-assignment': 'off',
  'unicorn/no-array-callback-reference': 'off',
  'unicorn/no-array-for-each': 'off',
  'unicorn/no-process-exit': 'off',
  'unicorn/prefer-module': 'off',
  'unicorn/prefer-node-protocol': 'off',
  'unicorn/prefer-spread': 'off',
  'unicorn/prefer-string-replace-all': 'off',
  'unicorn/prefer-switch': 'off',
  'unicorn/prevent-abbreviations': [
    'error',
    {
      allowList: {
        args: true, // eslint-disable-line @typescript-eslint/naming-convention
        pkg: true, // eslint-disable-line @typescript-eslint/naming-convention
        str: true, // eslint-disable-line @typescript-eslint/naming-convention
      },
    },
  ],
  'unicorn/switch-case-braces': 'off',
}

module.exports = {
  overrides: [
    {
      extends: [
        'plugin:unicorn/all',
        'hardcore',
        'hardcore/fp',
        'hardcore/ts',
        'plugin:@stylistic/all-extends',
      ],
      files: ['*.ts'],
      rules,
    },
    {
      env: {
        browser: true, // eslint-disable-line @typescript-eslint/naming-convention
      },
      extends: [
        'plugin:tailwindcss/recommended',
        'plugin:unicorn/all',
        'hardcore',
        'hardcore/react',
        'hardcore/react-performance',
        'hardcore/fp',
        'hardcore/ts',
        'plugin:@stylistic/all-extends',
      ],
      files: ['*.tsx'],
      rules,
      settings: {
        react: {
          version: '18',
        },
        tailwindcss: {
          cssFiles: ['src/assets/*.css'],
          whitelist: [String.raw`app-[a-z\d-]+`],
        },
      },
    },
    {
      extends: [
        'plugin:unicorn/all',
        'hardcore',
        'hardcore/ts-for-js',
        'plugin:@stylistic/all-extends',
      ],
      files: [
        '*.cjs',
        '*.js',
      ],
      rules,
    },
  ],
  parserOptions: {
    project: true, // eslint-disable-line @typescript-eslint/naming-convention
  },
  root: true, // eslint-disable-line @typescript-eslint/naming-convention
}
