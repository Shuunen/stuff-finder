# Benchmarks

## Eslint

`hyperfine --runs 3 --warmup 1 'npx eslint --ext .js,.ts,.tsx .'`

|     date     | delay | node  |   machine    | comment                           |
| :----------: | :---: | :---: | :----------: | --------------------------------- |
| 2024-01-27#1 |  25s  | 20.11 | romain win11 | initial mesure, see note 0        |
| 2024-02-16#1 |  25s  | 20.11 | romain win11 | stable                            |
| 2024-02-16#2 |  15s  | 20.11 | romain win11 | removed some import rules... lol  |
| 2024-03-18#1 |  10s  | 20.10 | romain zorin | did nothing but the cpu is better |

Note 0 : with plugin:tailwindcss/recommended,  plugin:unicorn/all, hardcore, hardcore/react, hardcore/ts
Note 1 : to show time taken by rules : `TIMING=1 npx eslint --ext .js,.ts,.tsx .`
Note 2 : to view final config : `npx eslint --print-config src/utils/parsers.utils.ts > eslint.config.json`
Note 3 : to list eslint scanned files : `DEBUG=eslint:cli-engine npx eslint --ext .js,.ts,.tsx .`

## Eslint on a single file

`hyperfine --runs 3 --warmup 1 'npx eslint src/utils/parsers.utils.ts'`

|     date     | delay | node  |   machine    | comment                      |
| :----------: | :---: | :---: | :----------: | ---------------------------- |
| 2024-01-27#1 | 9.5s  | 20.11 | romain win11 | initial mesure, see note 0   |
| 2024-01-27#2 | 9.5s  | 20.11 | romain win11 | + root true                  |
| 2024-01-27#3 | 3.5s  | 20.11 | romain win11 | eslint-config-preact only    |
| 2024-01-27#4 | 9.0s  | 20.11 | romain win11 | hardcore + hc/ts, see note 7 |
| 2024-01-27#5 |  10s  | 20.11 | romain win11 | + all rules cleaned          |

Note 0 : with eslint-config-preact, plugin:tailwindcss/recommended,  plugin:unicorn/all, hardcore, hardcore/react, hardcore/ts
Note 1 : to show time taken by rules : `TIMING=1 npx eslint src/utils/parsers.utils.ts`
Note 2 : to view final config : `npx eslint --print-config src/utils/parsers.utils.ts > eslint.config.json`
Note 3 : to list eslint scanned files : `DEBUG=eslint:cli-engine npx eslint src/utils/parsers.utils.ts`
Note 4 : to debug the whole process : `npx eslint src/utils/parsers.utils.ts --debug > eslint.debug.log 2>&1`
Note 5 : eslint-config-preact use "react-hooks", "jest", "react" & "compat" plugins, does not seems useful when already using hardcore plugin
Note 6 : delays are rounded to 0.5s
Note 7 : it's already way too long
Note 8 : to list files from tsc pov : `npx tsc --listFiles --noEmit > tsc.files.txt`
Note 9 : 1100+ files picked by tsc, let's try to narrow down the `tsconfig.json` to only the files we need
Note 10 : excluding common folders didn't change a byte of the 1100+ files picked by tsc, let's create a narrowed tsconfig.lint.json and recheck `npx tsc --listFiles --noEmit --project tsconfig.lint.json > tsc.lint.files.txt`
Note 11 : impossible to go under 1000 files, let's try to clean all 50+ rules I had
Note 12 : forced to give up, I just tried to setup a fresh ts project with hardcore, can't go under 7 seconds to parse a single file, I raised [an issue](https://github.com/EvgenyOrekhov/eslint-config-hardcore/issues/881) on the repo

Conclusion : eslint is slow, but eslint-config-hardcore is even slower, I need to either :

- find a replacement to eslint-config-hardcore, a nice collection of rules that are fast to parse
- create my own eslint config, with only the rules I need, and that are fast to parse
