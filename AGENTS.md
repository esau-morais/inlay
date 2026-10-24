# Inlay agent guide

Inlay ships view blocks that agents show instead of chat text. Read [docs/plan.md](docs/plan.md) before any product work. The plan is fixed. Raise disagreements with Esaú instead of working around the plan.

Claude builds and Esaú (`esau-morais`) reviews. Agents open PRs and never merge them.

## Load the skill before the task

Skills live in `.agents/skills/<name>/SKILL.md`. `.claude/skills` points at the same folder. Most pstack skills set `disable-model-invocation`, so read the `SKILL.md` file directly instead of calling the Skill tool. pstack skills use Cursor names. Map them with [.agents/docs/harness/claude-code.md](.agents/docs/harness/claude-code.md). [.agents/skills/SOURCES.md](.agents/skills/SOURCES.md) says where each skill came from and what changes in this repo.

| Task | Skills |
| --- | --- |
| Any prose a person reads: PR bodies, docs, commit bodies, replies, UI copy | `unslop` first. Add `technical-writing` for docs and PR bodies. |
| TypeScript | `typescript-best-practices` |
| React components | `react-best-practices`, `composition-patterns` |
| Logic with a cheap test, such as schemas, `show_view`, or the registry build | `tdd`, `principle-test-behavior-not-implementation` |
| Any visual work | `baseline-ui` and `emil-design-eng` while building. `break-ui` on each block. `fixing-accessibility` and `web-design-guidelines` before review. |
| Animation | `review-animations`, `fixing-motion-performance` |
| Gallery pages | `fixing-metadata` |
| The shadcn registry | `shadcn` |
| Running the gallery or checking that a block works | `verify-inlay` |
| Before review | `verify-inlay`, `no-comments`, then `attach-proof` |
| Long or unattended runs | `show-me-your-work` |
| End of each milestone in docs/plan.md | `reflect`, to turn the session into skill edits |
| Esaú corrects the same mistake twice | `correct` |

## Commits and PRs

- Every commit message and PR title follows [Conventional Commits](https://www.conventionalcommits.org/): `feat`, `fix`, `chore`, `docs`, `refactor`, `test`, `ci`, `perf`, `build`, `style`, or `revert`. Name the block or area as the scope: `feat(approval-card): add recommended option`.
- Keep commits small, with one logical change each.
- Open PRs against `main` and leave them for Esaú. Never merge a PR or turn on auto-merge.
- Write the PR body as a briefing Esaú can read in a minute: what changed, why, how you verified it, and open questions.

## Code

- Write no comment the code can say itself. Keep a comment only for a non-obvious reason the code cannot show, such as a constraint from a dependency.
- Parse untrusted data with Zod at the boundary, and trust the types after that.
- Run `pnpm check` before you push. It runs lint, the lint self-test, the format check, and the type check.

## Proof of work

Every PR carries evidence in its body. What counts as evidence depends on what the PR changes.

| The PR changes | Evidence |
| --- | --- |
| UI or behavior | Screenshots at desktop (1440 px) and phone (390 px) widths for every changed screen, and a short recording for every interaction. Capture with `agent-browser` (`~/.npm-global/bin/agent-browser`, see `agent-browser --help`) and attach with `scripts/attach-proof.ts`, following the `attach-proof` skill. |
| Only docs, config, or CI | No screenshots or recordings. When the change describes or alters architecture or a flow, put a Mermaid diagram of it in the PR body. GitHub renders `mermaid` code blocks. Otherwise, say in one sentence how you checked the change. |

Launch and drive the gallery with the `verify-inlay` skill. Its helpers start the dev server on a port you choose, check that the instance is yours, and stop it afterwards. Its feature map lists the recipe and the expected end state for each block. When a block, a sample, or a gallery route changes, update the map in the same PR, or run `maintain-verification-skill`.

## Rules and what enforces them

When a review correction repeats, enforce it with a check and add it here, following `correct`.

| Rule | Enforced by |
| --- | --- |
| Conventional commit messages | `commitlint` in the lefthook `commit-msg` hook, and the CI `Conventional commits` job |
| Conventional PR titles | The `PR title` workflow |
| No `any`, no non-null assertions, exhaustive `switch`, no floating promises, no unsafe `any` flow | oxlint type-aware rules in `.oxlintrc.json` |
| Hook rules, React Compiler rules, and jsx-a11y | oxlint `react` and `jsx-a11y` plugins |
| The lint rules above still fire | `pnpm lint:selftest` on `tests/lint/fixtures/` |
| Formatting | oxfmt in the `pre-commit` hook and in CI |
| No unnecessary comments | The `no-comments` skill before review. No check enforces it yet. |
| Proof on UI and behavior PRs | Review by Esaú. No check enforces it yet. |
