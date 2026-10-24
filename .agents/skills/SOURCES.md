# Skill sources

Every skill in this folder is a verbatim copy of an upstream folder at the commit listed below. `.claude/skills` is a symlink to this folder, so Claude Code and every other agent read the same files. Edit a vendored skill only to sync it with upstream. Put Inlay-specific behavior in `AGENTS.md` or in an Inlay-owned skill, and record it in the tweaks column here.

License notices for the copied files live in [`../licenses/`](../licenses/).

## Upstreams

| Source | Commit | Path copied |
| --- | --- | --- |
| [cursor/plugins](https://github.com/cursor/plugins) (pstack, Claude Code build) | `9580c23696ac8d7abed0c166f2f9918800afb819` | `harness/pstack/claude-code/skills/<name>/` |
| [vercel-labs/agent-skills](https://github.com/vercel-labs/agent-skills) | `063bee94c3f4df8453406c830b0a7df0f2860278` | `skills/<name>/` |
| [ibelick/ui-skills](https://github.com/ibelick/ui-skills) (the repo behind ui-skills.com) | `55363c305097d4c84487bd5f323d29b3f067bf72` | `skills/<name>/` |
| [emilkowalski/skills](https://github.com/emilkowalski/skills) (listed on ui-skills.com) | `2d228630ba1446365f614a108cb8252f1feda202` | `skills/<name>/` |
| [shadcn-ui/ui](https://github.com/shadcn-ui/ui) (listed on ui-skills.com) | `617134d5810bba521803b3ed787190bacbb80b35` | `skills/shadcn/` |

The pstack copy also brings two files outside `skills/`:

- `.agents/docs/harness/claude-code.md` from `harness/pstack/claude-code/docs/harness/claude-code.md`. Most pstack skills link to it as `../../docs/harness/claude-code.md`. It maps Cursor tool names, subagent fields, and paths to Claude Code. `.claude/docs` is a symlink to `.agents/docs`, so the link also resolves when an agent opens a skill through `.claude/skills`.
- `.agents/agents/comment-sicko.md` from `harness/pstack/claude-code/agents/comment-sicko.md`. `no-comments` spawns it. `.claude/agents` is a symlink to `.agents/agents`, so Claude Code registers it as the `comment-sicko` subagent type.

## Skills

### pstack

| Skill | Why it is here | Degrades outside Cursor | Inlay tweaks |
| --- | --- | --- | --- |
| `unslop` | Cuts AI tells from prose. Required before any PR body, doc, or reply. | Nothing. | None. |
| `technical-writing` | Structure and sentence rules for docs, PR bodies, and commit messages. The manifesto page and block docs need it. | Nothing. | None. |
| `typescript-best-practices` | Discriminated unions, branded types, and boundary parsing. Every block is a Zod schema plus a typed React component. | Nothing. | None. |
| `tdd` | Failing test first for bugs with a cheap test path. Schema validation and the `show_view` handler are pure logic with cheap tests. | Nothing. | None. |
| `no-comments` | Strips comments before review through the Comment Sicko subagent. | Points at the Subagents section of `poteto-mode`, which is not vendored. Pick the effort yourself. Comment Sicko calls `/how` and `/why`, which are not vendored, so it reads the nearby code instead. | None. |
| `reflect` | After each milestone, three reviewers mine the session and propose edits to existing skills. | Reviewer models default to Cursor slugs. The adapter maps them to `opus` or the session model. It hands larger edits to Cursor's `create-skill`. Use Claude Code's skill-creator skill when it is installed, or the [Agent Skills format](https://agentskills.io/) otherwise. | Upstream says to copy a skill into `.cursor/skills/` and never open a PR. Here the skills are already in the repo, so edit `.agents/skills/<name>/` in place and ship the edit as its own PR for Esaú to review. |
| `correct` | Turns repeated review corrections into lint rules, types, or tests, and keeps the rule table in `AGENTS.md`. | Nothing. | None. |
| `show-me-your-work` | A TSV decision log for unattended runs. Claude builds and Esaú reviews later, so the log is the review trail. | The closing audit spawns a reviewer on a different model family. Claude Code only offers Claude models, so the audit runs on a different Claude model and says so. | None. |
| `sharpen` | Rewrites a task prompt to be deeper before Esaú hands it to the next thread. Runs only when typed. | Nothing. | None. |
| `create-verification-skill` | **Temporary.** Generates Inlay's `verify-inlay` skill once the gallery runs. Delete this folder after `verify-inlay` exists. | It writes `.cursor/skills/verify-<app>/`. | Write to `.agents/skills/verify-inlay/` instead. |
| `maintain-verification-skill` | Keeps `verify-inlay` honest as the gallery and blocks change. | It looks for `.cursor/skills/verify-*/`. | Look in `.agents/skills/verify-*/`. |
| `automate-me` | **Temporary.** Turns how Esaú and the agents work in this repo into Inlay's own process skills, starting with `attach-proof`. Delete this folder once those skills exist. | It uses Cursor's built-in `create-skill`, which Claude Code lacks. It cites `poteto-mode` as a shape example; read it [upstream](https://github.com/cursor/plugins/tree/main/pstack/skills/poteto-mode) instead. Its mining step reads Cursor transcripts. The adapter maps that to `~/.claude/projects/<slug>/`. | Write output skills to `.agents/skills/<name>/`, not `.cursor/skills/`. |

The principle skills below are short rules that the skills above cite by name. Only the ones that a vendored skill cites, or that match Inlay's v0 work, are here.

| Skill | Why it is here |
| --- | --- |
| `principle-type-system-discipline` | `typescript-best-practices` applies it first. |
| `principle-boundary-discipline` | Cited by `typescript-best-practices`. `show_view` parses agent data at the MCP boundary. |
| `principle-encode-lessons-in-structure` | Cited by `typescript-best-practices`, `reflect`, and `show-me-your-work`. Prefer a lint rule over another line in `AGENTS.md`. |
| `principle-fix-root-causes` | Cited by `no-comments`. |
| `principle-redesign-from-first-principles` | Cited by `no-comments`. |
| `principle-prove-it-works` | The proof-of-work rule in `AGENTS.md` rests on it. |
| `principle-test-behavior-not-implementation` | Pairs with `tdd`. Block tests assert rendered output, not internals. |
| `principle-model-the-domain` | Five blocks share one schema-to-renderer shape. Encode it once. |
| `principle-experience-first` | The project competes on taste against affectui and CopilotKit. |
| `principle-laziness-protocol` | Keeps the v0 diff small. |

Left out, with the reason:

- `poteto-mode` and `poteto-help`. They are poteto's personal router, they pull in most of pstack, and many playbooks need Cursor-only tools (Bugbot, `deslop`, `control-ui`, Grok models). `automate-me` replaces them with an Inlay-specific mode.
- `architect`, `arena`, `swarm`, `interrogate`, `how`, `why`, `teach`, `figure-it-out`. They are built around multi-model panels. In Claude Code every panel runs on Claude, so the cross-model check that justifies them is gone. Revisit when a design is contested.
- `statechart`, `create-formal-verification-skill`, `maintain-formal-verification-skill`. They are built around TLA+ models. No v0 block has state complex enough to need them.
- `make-bot-ui` needs Grok Bot webhooks. `setup-pstack` only writes model role lines for poteto-mode. `ketchup`, `ketchup-video`, `recall`, `bro`, `in-your-own-words`, `blast-radius`, and `benchmark-checklist` do not match v0 work.
- The other 14 principle skills. No vendored skill cites them.

### Vercel

| Skill | Why it is here | Degrades | Inlay tweaks |
| --- | --- | --- | --- |
| `react-best-practices` | 70 React performance rules. Frontmatter name is `vercel-react-best-practices`. The Next.js-only rules do not apply to blocks or the TanStack Start gallery. | Nothing. | None. |
| `composition-patterns` | Compound components and no boolean-prop sprawl. Blocks are a public component API that developers edit after `shadcn add`. Frontmatter name is `vercel-composition-patterns`. | Nothing. | None. |
| `web-design-guidelines` | Reviews UI files against Vercel's Web Interface Guidelines, covering accessibility and UX. | It fetches its rules from `vercel-labs/web-interface-guidelines` on `main` at run time, so results are not pinned and need network access. Upstream declares no license for this skill. | None. |

Left out: `react-view-transitions`, because blocks are copied into host apps and should not depend on a React API the host may not ship. Revisit for gallery page transitions. `writing-guidelines`, because `unslop` and `technical-writing` cover the same ground. The rest are for Vercel deploys or React Native.

### UI skills

ui-skills.com is a directory of about 420 skills from many authors. Its own skills live in `ibelick/ui-skills`. Fetch any listed skill with `npx ui-skills get <slug>`, or from its MCP server at `https://www.ui-skills.com/mcp`. The copies here come from the git repos at the commits above, so they stay pinned.

| Skill | Source | Why it is here |
| --- | --- | --- |
| `baseline-ui` | ibelick | Hard rules against generic AI UI: Tailwind defaults, accessible primitives, no animation unless asked, `h-dvh`, typography rules. |
| `fixing-accessibility` | ibelick | ARIA, keyboard, focus, and contrast fixes. `approval-card` and `plan-compare` are interactive controls. |
| `fixing-motion-performance` | ibelick | Compositor-only animation and layout thrash. `agent-queue` updates live. |
| `fixing-metadata` | ibelick | Titles, Open Graph, and canonical URLs. The plan picks TanStack Start for link previews when gallery pages are shared. |
| `emil-design-eng` | emilkowalski | Taste and polish rules for components and animation from the author of Sonner and Vaul. |
| `review-animations` | emilkowalski | Reviews motion code. Run it on any block that animates. |
| `break-ui` | emilkowalski | Feeds worst-case data through the same boundary as demo data and reports what breaks. Blocks render agent-written data, so long names, empty lists, and "1 members" will happen. It reads limits from the schema, and every block has a Zod schema. |
| `shadcn` | shadcn-ui | The registry the plan ships through. `registry.md` covers authoring `registry.json` and running `shadcn build`. |

Notes on the UI skills:

- `baseline-ui` says to use `motion/react` when JavaScript animation is needed. Every block dependency becomes a dependency of the app that installs it, so ask Esaú before a block adds one.
- `shadcn` runs `npx shadcn@latest info --json` when it loads. Until a `components.json` exists, that command prints an error, and it always needs network access.
- `improve-ui`, `create-design-md`, `component-canvas`, and `create-canvas` from ibelick were left out for v0. `create-design-md` is worth adding once the gallery has a visual language to document.
