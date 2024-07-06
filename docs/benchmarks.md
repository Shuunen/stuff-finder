# Benchmarks

## Eslint

`hyperfine --runs 3 --warmup 1 'npx eslint src'`

|     date     | delay | node  |      machine      | comment                                             |
| :----------: | :---: | :---: | :---------------: | --------------------------------------------------- |
| 2024-01-27#1 |  25s  | 20.11 | romain nzxl win11 | initial mesure, see note 0                          |
| 2024-02-16#1 |  25s  | 20.11 | romain nzxl win11 | stable                                              |
| 2024-02-16#2 |  15s  | 20.11 | romain nzxl win11 | removed some import rules... lol                    |
| 2024-03-18#1 |  10s  | 20.10 | romain gram zorin | did nothing but the cpu is better                   |
| 2024-04-06#1 |  16s  | 20.11 | romain nzxl win11 | bump deps                                           |
| 2024-04-07#1 |  18s  | 20.11 | romain nzxl win11 | + hc/react-performance + hc/fp                      |
| 2024-04-07#2 |  20s  | 20.11 | romain nzxl win11 | override .js (standard)                             |
| 2024-04-07#3 |  18s  | 20.11 | romain nzxl win11 | override .ts, .tsx / override .js                   |
| 2024-04-07#4 |  16s  | 20.11 | romain nzxl win11 | override .ts / override .tsx / override .js         |
| 2024-04-07#5 |  16s  | 20.11 | romain nzxl win11 | avoid "**/*" in files specifiers                    |
| 2024-04-07#6 |  14s  | 20.11 | romain nzxl win11 | targeting only src directory instead of "."         |
| 2024-04-07#7 |  14s  | 20.11 | romain nzxl win11 | targeting only src directory + no --ext .ts,.tsx    |
| 2024-04-07#8 |  14s  | 20.11 | romain nzxl win11 | targeting . + --ext .ts,.tsx +  no ignorePatterns   |
| 2024-04-07#9 |  14s  | 20.11 | romain nzxl win11 | targeting src + no ignorePatterns                   |
| 2024-04-07#a |  15s  | 20.11 | romain nzxl win11 | .eslintrc.json => .eslintrc.cjs                     |
| 2024-04-07#b |  16s  | 20.11 | romain nzxl win11 | use new @stylistic/eslint-plugin                    |
| 2024-04-17#1 |  10s  | 20.10 | romain gram zorin | did nothing but the cpu is better ^^                |
| 2024-04-19#1 |  12s  | 20.12 | romain nzxl fed39 | nice improvement on Fedora for the same hardware ^^ |
| 2024-04-20#1 |  8s   | 20.12 | romain duc win11  | better (new) hardware ^^                            |
| 2024-06-12#1 |  8s   | 20.14 | romain duc win11  | bigger codebase                                     |

Note 0 : with plugin:tailwindcss/recommended,  plugin:unicorn/all, hardcore, hardcore/react, hardcore/ts
Note 1 : to show time taken by rules : `TIMING=1 npx eslint src`
Note 2 : to view final config : `npx eslint --print-config src/utils/parsers.utils.ts > eslint.config.json`
Note 3 : to list eslint scanned files : `DEBUG=eslint:cli-engine npx eslint src`

## Eslint on a single file

`hyperfine --runs 3 --warmup 1 'npx eslint src/utils/parsers.utils.ts'`

|     date     | delay | node  |      machine      | comment                               |
| :----------: | :---: | :---: | :---------------: | ------------------------------------- |
| 2024-01-27#1 | 9.5s  | 20.11 | romain nzxl win11 | initial mesure, see note 0            |
| 2024-01-27#2 | 9.5s  | 20.11 | romain nzxl win11 | + root true                           |
| 2024-01-27#3 | 3.5s  | 20.11 | romain nzxl win11 | eslint-config-preact only             |
| 2024-01-27#4 | 9.0s  | 20.11 | romain nzxl win11 | hardcore + hc/ts, see note 7          |
| 2024-01-27#5 |  10s  | 20.11 | romain nzxl win11 | + all rules cleaned                   |
| 2024-04-07#1 | 8.3s  | 20.11 | romain nzxl win11 | before @stylistic/eslint-plugin       |
| 2024-04-07#2 | 8.9s  | 20.11 | romain nzxl win11 | after @stylistic/eslint-plugin        |
| 2024-04-17#1 | 4.3s  | 20.10 | romain gram zorin | did nothing but the cpu is better ^^  |
| 2024-06-12#1 | 5.0s  | 20.14 | romain duc win11  | not sure why it's longer than gram    |
| 2024-07-06#1 | 2.9s  | 20.10 | romain gram zorin | after eslint-plugin-shuunen migration |
| 2024-07-06#2 | 2.9s  | 20.15 | romain gram zorin | 5 minors didn't changed anything      |

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
