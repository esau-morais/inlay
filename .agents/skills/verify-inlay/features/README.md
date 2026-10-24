# Inlay gallery verification map

This directory is the maintained source for verifying what a visitor can do in the Inlay gallery. Read this index, then use the matching feature file as the recipe.

## Baseline preconditions

- Launch the gallery with `scripts/launch.sh <port>` and require `scripts/doctor.sh <port>` to pass.
- Use an agent-browser session scoped to this worktree (`agent-browser session id --scope worktree --prefix verify`).
- `localStorage["inlay-theme"]` is unset, so the site follows the system color scheme. Set the scheme with `agent-browser set media light` or `dark`.
- Never drive a gallery that this run did not launch.

## Driving conventions

- After every `open`, run `agent-browser wait --load networkidle` before clicking.
- Prefer roles and accessible names (`find role button --name …`, `find role radio --name …`) over CSS. Use CSS only for `[data-palette]`, `details`, `input[type=range]` and `table`, which have no unique name.
- Sample and theme choices live in the URL (`?sample=…&palette=…`). Open the URL directly to start a recipe in a given state.
- A block keeps a choice until the page reloads, the sample changes or you press `Reset demo`.

## Proof and skip reporting

- Capture the action and the resulting state: the reply bubble, the status line and the payload, not only the clicked button.
- UI proof is a screenshot at 1440 and 390 px. Interaction proof is a recording under 15 seconds.
- Record the feature ID and the URL with every artifact.
- Report a step that fails with the command you ran and what you saw. Do not swap in a different entry point and call the original verified.

## Feature entry contract

Each feature file starts with an H1 title and one paragraph describing what the visitor sees. It then has exactly four H2 sections in this order: `Sub-features`, `How to get to it (user POV)`, `Driving it with agent-browser` (starting with `Preconditions:`), and `Gotchas`.

## Features

- [Approval card](./approval-card.md) covers choosing an option, the reply, the payload and the empty state.
- [Plan compare](./plan-compare.md) covers picking a plan, the column layout and the stacked layout.
- [Agent queue](./agent-queue.md) covers live timers, collapsed workers and the empty state.
- [Diff review](./diff-review.md) covers severity groups, opening files and long paths.
- [Data chart](./data-chart.md) covers line, bar and treemap charts, keyboard reading and the table view.
- [Themes](./themes.md) covers dark mode and the three host palettes.
- [Pages and metadata](./pages.md) covers the index, the manifesto, block navigation, 404 and link previews.
