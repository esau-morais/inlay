# Inlay

Open-source view blocks for agent UI. An agent sends a block name and data, and the app draws the block with its own theme. The agent never writes HTML.

v0 ships five blocks: `approval-card`, `agent-queue`, `diff-review`, `plan-compare` and `data-chart`. Each is a React component with a Zod schema, installable with the shadcn CLI and callable through one MCP tool, `show_view`.

Status: pre-release. See [docs/plan.md](docs/plan.md) for the v0 plan and [docs/ideas.md](docs/ideas.md) for how this project was picked.

MIT licensed.
