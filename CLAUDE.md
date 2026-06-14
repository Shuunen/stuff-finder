# CLAUDE

## Skill routing

Always invoke a skill FIRST for matching requests — do not answer directly.

- Brainstorm / product idea → office-hours
- Bug / error → investigate
- Ship / deploy / PR → ship
- QA / find bugs → qa
- Code review → review
- Update docs → document-release
- Weekly retro → retro
- Design system → design-consultation
- Visual audit → design-review
- Architecture review → plan-eng-review
- Save / resume progress → context-save / context-restore
- Code quality → health

## Project docs

- `docs/benchmarks.md` — build and tooling benchmarks

## After any codebase change

Run `pnpm check` (types, formatting, lint, build, tests). Fix all failures before done.

## Linting rules

Never disable a lint rule without asking the user. Try to fix the code first then if too complex, ask the user if they want to disable the rule for that line/file.

## Code practices

- **Constants**: camelCase only, never UPPER_SNAKE_CASE
- **Absent values**: `undefined`, never `null`; use `isNil` from es-toolkit to check
- **Narrowing**: use `invariant(x, "msg")` from es-toolkit — never `x!` or silent `if (!x) return`
- **Semantic CSS**: Use only semantic class names in markup; centralize shared styling css files via CSS selectors and tailwind `@apply`, not scattered utility classes
- **Colors in TSX**: Only use colors from the Semantic palette (e.g. `primary`, `background`, ...) — never raw color palette names (`red`, `cream`, etc.) or hardcoded hex values

## Testing practices

- **Globals**: `describe`, `it`, `expect` are global — do not import them
- **File naming**: `.test.ts` / `.test.tsx` only, never `.spec.ts`
- **Spacing in tests**: in unit and e2e files, inside `test`/`it` blocks, do not include empty lines for visual spacing
- **Selectors**: `getByTestId` / `queryByTestId` / `getAllByTestId` only — no role/text/label queries
- **testid format**: kebab-case; use `kebabCase` from es-toolkit for dynamic ids
- **Assertions**: never `toBeInTheDocument()` after `getByTestId` (redundant); use `toHaveTextContent`, `toHaveClass`, `toHaveAttribute` instead
- **Fail loudly**: pair `expect(x).toBeDefined()` with `invariant(x, "msg")` — never `if (!x) return`
- **Type checks**: `toBeTypeOf("number")` over `expect(typeof x).toBe("number")`

## Graphify

This project has a knowledge graph at graphify-out/ with god nodes, community structure, and cross-file relationships.

Rules:

- For codebase questions, first run `graphify query "<question>"` when graphify-out/graph.json exists. Use `graphify path "<A>" "<B>"` for relationships and `graphify explain "<concept>"` for focused concepts. These return a scoped subgraph, usually much smaller than GRAPH_REPORT.md or raw grep output.
- If graphify-out/wiki/index.md exists, use it for broad navigation instead of raw source browsing.
- Read graphify-out/GRAPH_REPORT.md only for broad architecture review or when query/path/explain do not surface enough context.
- After modifying code, run `graphify update .` to keep the graph current (AST-only, no API cost).
