# Plan compare

Plan compare lays two to four plans side by side with cost, pros and cons on aligned rows. Picking a plan locks the block, sends `onPick({ optionId, name })`, and adds `Go with <name>.` to the thread.

## Sub-features

- `pc-pick` picking a plan locks the block and marks it `Picked`.
- `pc-reply` the thread gains `Go with <name>.`.
- `pc-payload` `What comes back` shows the `onPick` payload.
- `pc-columns` in a wide container the plans sit in columns with aligned rows. In a narrow one they stack.
- `pc-four` four plans fit side by side at 1440 px.
- `pc-empty` with no plans, the block asks for options.

## How to get to it (user POV)

- Open `/blocks/plan-compare`, or choose `plan-compare` in the index list.

## Driving it with agent-browser

Preconditions:

- Doctor passes. The page is open at `$U/blocks/plan-compare` and `wait --load networkidle` finished.

- **Pick.** Run `agent-browser find role button click --name "Pick this plan: Meilisearch"`. That button now reads `Picked`, the other columns fade, and the label above the question reads `Plan picked`.
- **Status and reply.** `agent-browser eval "document.querySelector('[data-palette] output').textContent"` returns `Sent Meilisearch, self-hosted to the agent.`. The last item of the `Demo conversation` list reads `Go with Meilisearch, self-hosted.`.
- **Payload.** `agent-browser find text "onPick(" text` contains `"optionId": "meilisearch"`.
- **Aligned rows.** At 1440 px, run `agent-browser eval "[...document.querySelectorAll('[data-palette] fieldset > div')].map(c => [...c.querySelectorAll('p')].find(p => p.textContent === 'Cost')?.getBoundingClientRect().top)"`. The `Cost` rows share one value even though the summaries above them differ in length.
- **Stacked.** Run `agent-browser set viewport 390 844` and reload. The plans stack vertically, one per row.
- **Four plans.** Run `find role radio check --name "Four plans"` at 1440 px. There are four columns and no horizontal scroll.
- **Proof.** Record the pick, then take screenshots of `[data-palette]` at both widths.

## Gotchas

- A button's accessible name is `Pick this plan: <plan name>`, or `Picked: <plan name>` after the pick. Its visible text is only `Pick this plan` or `Picked`.
- Two plans switch to columns at a narrower container width than three or four.
