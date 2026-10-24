# Agent UI ideas and plan

Oct 24, 2026 · @Esaú

## The bet

Chat stays as the place where you state intent, and the agent builds the right view around it for each job. Today every agent app builds those views on its own, which is why seven forks of T3 Code each reimplemented `html_render`. The opening is a shared set of views that any harness can use, inside an app people are expected to fork and make their own.

## Ideas

### 1. View blocks for agents

A shadcn-style registry of views an agent can show: a queue of running jobs, a diff review grouped by importance, a side-by-side plan comparison, an approval card, a repo treemap, a PR explainer. Developers copy a block into their app with a CLI, as with shadcn/ui. Agents reach the same blocks through one MCP tool, for example `show_view(type, data)`, so the harness sends data and the app draws a native view instead of raw HTML.

- **Who it's for:** people building agent apps, including the T3 Code forks.
- **Why now:** T3 Code, ChatGPT and at least seven forks shipped rich output inside the thread in October, each with its own code.
- **Risk:** affectui, CopilotKit, a2ui and json-render are close. The difference has to be taste and coverage of agent-specific views, which fits a front-end engineer.

**Stack by surface.** Each block gets one schema and a renderer per surface. React on the web comes first, and the other surfaces render from the same schema. json-render already does this with React, Vue, Svelte, Solid, React Native and Ink renderers from one catalog.

| Surface | Options | Pick | Why |
| --- | --- | --- | --- |
| Web and desktop apps | React + Tailwind (shadcn registry), Lit web components | React + Tailwind | Same stack as T3 Code. Electron and Tauri both render web code. Agents write React best |
| Claude, ChatGPT, VS Code | Standalone HTML build, `@json-render/mcp` | HTML build of each React block | MCP Apps hosts render HTML in a sandboxed iframe |
| Terminal | OpenTUI (React bindings), Ink | OpenTUI, later | OpenCode runs it in production, and its React bindings reuse block logic. Terminal versions are simpler: tables, lists, progress |
| Mobile | WebView of the HTML build, React Native renderer | WebView first | Free once the HTML build exists. Native only if a mobile client needs it |

### 2. A forkable agent app shell

A small, source-first agent client (web first, desktop later) that connects to any harness through adapters: Claude Agent SDK, Codex App Server, Pi, OpenCode. It is built to be forked. Your changes live in one folder, like qm's `deploy/layers/<org>/`, and an agent skill merges upstream updates into your fork.

- **Who it's for:** developers who like T3 Code but want their own version.
- **Why now:** Theo's harness article and qm both show the interface is separable from the harness.
- **Risk:** T3 Code is already open source. This only wins if forking and staying up to date is much easier than with T3 Code.

**Stack by surface.** A local server holds the harness adapters, and thin clients connect to it, as in T3 Code and Happy. Build web and desktop first, then the terminal, then mobile.

| Surface | Options | Pick | Why |
| --- | --- | --- | --- |
| Web | Vite + React with TanStack Router, TanStack Start | Vite + React | Matches T3 Code, so forks merge cleanly. The local server already does the backend work Start would add |
| Desktop | Electron, Tauri 2 | Electron first | Matches T3 Code and stays JavaScript-only. Tauri installers run about 3 to 15 MB against 50 to 150 MB, but it would need the Node server as a sidecar |
| Terminal | OpenTUI, Ink | OpenTUI | t1code ("T3Code, but in your terminal", 468 stars) shows interest, and OpenCode proves OpenTUI at scale |
| Mobile | Expo remote client, Tauri 2 mobile, PWA | Expo remote client, later | Happy (23.5k stars) does this: the phone controls sessions running on your computer. Tauri's mobile support is newer |

### 3. An app that rebuilds its own UI

Ideas 1 and 2 combined. You tell the app "add a board for my open PRs" and the agent edits the app's own code, using the view blocks, then reloads. Personal software in the levelsio and shadcn sense, applied to the agent client itself.

- **Who it's for:** power users who want their tools to fit them.
- **Why now:** coding agents can already edit a React app reliably. Nobody I found ships a client designed for this.
- **Risk:** hard to keep stable. It needs ideas 1 and 2 to exist first.

**Stack by surface.** Same stack as idea 2, but only web and desktop make sense at first.

| Surface | Fit | Why |
| --- | --- | --- |
| Web and desktop | Main target | Vite hot reload shows the agent's edits to the app within a second, without a restart |
| Terminal | Later | Possible with OpenTUI, but each change needs a restart and the views are simpler |
| Mobile | Skip | App store review limits apps that change their own code after release |

### 4. A morning view for background agents

One screen for agents that ran while you were away: what finished, what needs a decision, and a short explainer per change, in the style of Kit Langton's PR videos and Karpathy's explainer pages. poteto's profile ends on this question: what the screen should look like when you wake up.

- **Who it's for:** people running agents overnight or in CI.
- **Why now:** Cline Kanban, octomux and the agent inbox idea show demand, but each covers one piece.
- **Risk:** it depends on where the agents run. It works best as a view inside idea 1 or 2.

**Stack by surface.** Mobile matters most here, because people check overnight results on their phone.

| Surface | Options | Pick | Why |
| --- | --- | --- | --- |
| Mobile | PWA with web push, Expo app | PWA first | Cheapest. iOS supports web push for apps added to the home screen. Move to Expo if push delivery proves unreliable |
| Web and desktop | Standalone page, a view inside the shell | A view inside idea 2 | Reuses the shell's sessions and blocks |
| Terminal | A digest command | A `morning` command | Prints what finished and what needs a decision. Little work |

### 5. An agent UI pattern gallery and essay

A public site that answers poteto's question with working examples: inline HTML, boards, canvas, inbox, explainer videos. Each pattern has a live demo and the code behind it. An essay goes with it.

- **Who it's for:** other builders, and your own audience.
- **Why now:** the poll drew 25,074 votes and over 1,200 replies, so people are looking for answers.
- **Risk:** low. It's content, not a product, but it seeds idea 1.

**Stack.** The gallery is a website, so only the web framework matters. Terminal and mobile patterns appear as recorded demos.

| Option | Server rendering | Fit with the blocks | Pick |
| --- | --- | --- | --- |
| TanStack Start | Yes, with streaming and typed server functions | Same React code, and json-render has a Start renderer | Chosen |
| Plain Vite + React | No. Weak for search and for link previews when the essay is shared on X | Same React code | No |

Start's docs still call it a release candidate (1.168 line) with a stable API, and it releases often, so pin versions.

### 6. Source licenses for agent software

diegohaz's point as a business model. Sell a license to the source of an app or a block set, so buyers self-host and change it with agents. It can sit on top of ideas 1 or 2 later.

- **Who it's for:** teams leaving SaaS, as in Andy Wang's Linear post.
- **Risk:** it's a business model, not a product. It needs something worth licensing first.

## How they compare

Idea 1 is the best starting point. It is small enough to ship alone, it is the piece ideas 2, 3 and 4 need, and it uses your front-end skills directly. Effort is relative, since Claude builds each one.

| Idea | Effort to a first release | Closest competition | Fit for you | Feeds into |
| --- | --- | --- | --- | --- |
| 1. View blocks | Medium | affectui, CopilotKit, a2ui | High | 2, 3, 4 |
| 2. Forkable shell | Large | T3 Code, qm | High | 3 |
| 3. Self-rebuilding app | Largest, after 1 and 2 | None found | High | None |
| 4. Morning view | Medium | Cline Kanban, octomux | Medium | None |
| 5. Gallery and essay | Small | Blog posts, generative-ui-wiki | High | 1 |
| 6. Source licenses | Depends on 1 or 2 | None direct | Low at first | None |

## Scores

View blocks and the gallery score highest at 19 of 25, and the morning view scores lowest at 12 because Anthropic and OpenAI already ship it. Each factor runs from 1 (bad) to 5 (good).

| Idea | Safe from Anthropic and OpenAI | Evidence of demand | Room next to competitors | Fits open source | Path to revenue | Total |
| --- | --- | --- | --- | --- | --- | --- |
| 1. View blocks | 4 | 4 | 3 | 5 | 3 | 19 |
| 5. Gallery and essay | 5 | 4 | 4 | 5 | 1 | 19 |
| 2. Forkable shell | 4 | 5 | 2 | 5 | 2 | 18 |
| 3. Self-rebuilding app | 3 | 3 | 5 | 4 | 3 | 18 |
| 6. Source licenses | 5 | 2 | 4 | 1 | 4 | 16 |
| 4. Morning view | 1 | 4 | 1 | 3 | 3 | 12 |

What drives the scores:

- **View blocks.** OpenAI built a private screen library for Intelligent UI, but it only works inside ChatGPT. Labs have no reason to ship an open, cross-harness set, and the shared MCP Apps standard means one block can reach Claude, ChatGPT and VS Code. Demand shows in the seven `html_render` ports and Flo's queue component (281 bookmarks). affectui, CopilotKit and json-render are close, so taste has to win.
- **Gallery.** No lab will write a neutral catalog of patterns. poteto's poll drew 25,074 votes. It earns nothing directly.
- **Forkable shell.** T3 Code has about 29.6k stars and 7.9k forks, the strongest demand signal here. That same success leaves little room unless forking and staying current is much easier.
- **Self-rebuilding app.** No one ships it yet, but Anthropic launched Claude Code mods on Oct 1, small TypeScript functions that change how Claude Code works. That moves the labs toward user customization.
- **Source licenses.** It conflicts with the decision to stay fully open source, and the demand evidence is one post with 106 likes.
- **Morning view.** Anthropic shipped Agent View for Claude Code on May 11, a table of every session grouped by what needs your input. Codex CLI added an agent command center on Oct 15. Cline Kanban and Capy cover the rest.

Sources: [Claude Code Agent View](https://rits.shanghai.nyu.edu/ai/anthropic-ships-agent-view-a-multi-session-dashboard-for-claude-code/), [October 2026 tools roundup](https://claude-world.com/articles/ai-coding-models-tools-october-2026/), [Capy](https://capy.ai/), [T3 Code star history](https://www.star-history.com/pingdotgg/t3code).

## Plan

Start with the gallery and the first blocks together, then grow into the shell. Each phase ends with something public, so you get feedback before the next one.

Everything is open source under a permissive license such as MIT. It starts as a side project and may become a startup. If it does, revenue would come from a hosted version, paid support or premium block sets, not from closing the code, which makes idea 6 a later option rather than the core model. Claude builds each phase and Esaú reviews, so a phase ends when its check passes, not on a date.

1. **Gallery and essay.** Pick 5 patterns: approval card, agent queue, diff review, plan comparison, data chart. Build a working demo of each and write the essay answering poteto's poll. This proves whether people care, measured by views, stars and replies.
2. **View blocks v0.** Turn the 5 demos into installable blocks with a CLI and a registry, using the shadcn registry format. Add one MCP tool that lets an agent show a block with data. Test it inside a fork of T3 Code, replacing raw `html_render` pages with native blocks. This proves blocks beat raw HTML for speed and fit with the app's theme.
3. **Forkable shell v0.** Build a minimal web client on the blocks with two harness adapters, Claude Agent SDK and Codex App Server. Put all user changes in one layers folder and write the skill that merges upstream updates. This proves a fork can stay current without manual merges.
4. **Self-rebuilding app.** Let the agent in the shell add or change views in its own code, using the blocks. Only start this if phases 2 and 3 got real users.

The morning view and source licenses can join later as one block set and one pricing option.

## Shared decisions

Each idea above now has its own stack table by surface. Three choices apply across all of them.

- **Test bed: a fork of T3 Code.** It runs React 19, Vite, TanStack Router, Tailwind 4 and Electron, has real users, and its `html_render` tool shows exactly where native blocks would replace raw HTML. Phase 3 can later pull the client out into its own shell.
- **One schema format for blocks:** Zod schemas in json-render's catalog shape, so React, terminal and mobile renderers can share them.
- **TanStack Start only for the gallery site.** Blocks and the shell stay plain React on Vite. Both use TanStack Router, so moving later is cheap.

Sources: [MCP Apps build guide](https://ecorpit.com/mcp-apps-server-rendered-ui-extension-build-guide-2026/), [json-render README](https://cdn.jsdelivr.net/gh/vercel-labs/json-render@main/README.md), [T3 Code monorepo docs](https://mintlify.wiki/pingdotgg/t3code/development/monorepo-structure), [TanStack Start v1 announcement](https://tanstack.com/blog/announcing-tanstack-start-v1), [MakerKit guide to TanStack Start](https://makerkit.dev/blog/tutorials/what-is-tanstack-start), [OpenTUI README](https://cdn.jsdelivr.net/gh/anomalyco/opentui@main/README.md), [t1code](https://gittrend.io/repo/maria-rcks/t1code), [Happy](https://github.com/slopus/happy), [Electron vs Tauri 2026](https://www.pkgpulse.com/guides/electron-vs-tauri-2026).
