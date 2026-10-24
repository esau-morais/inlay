# Approval card

The approval card shows a question from the agent with its options and the recommended one. Choosing an option locks the card, shows that the choice was sent, and adds the choice to the thread as the visitor's next message.

## Sub-features

- `ac-decide` choosing an option sends `onDecide({ optionId, label })` and locks the card.
- `ac-reply` the chosen label appears as a new user message in the thread.
- `ac-payload` the `What comes back` section shows the `onDecide` payload.
- `ac-reset` `Reset demo` unlocks the card and removes the reply.
- `ac-long` long questions, emails and paths wrap without overflow.
- `ac-empty` with no options, the card says to reply in the chat.

## How to get to it (user POV)

- Open `/blocks/approval-card`, or choose `approval-card` in the index list.
- The index page (`/`) shows the same card with the `Typical` sample in its hero thread.

## Driving it with agent-browser

Preconditions:

- Doctor passes. The page is open at `$U/blocks/approval-card` and `wait --load networkidle` finished.

- **Decide.** Choose the recommended option. Run `agent-browser find role button click --name "Run it in batches of 50,000"`. The card label changes from `Needs your decision` to `Decided`, a check mark fills the chosen option, and the other options fade.
- **Status.** Run `agent-browser eval "document.querySelector('[data-palette] output').textContent"`. It returns `Sent Run it in batches of 50,000 to the agent.`.
- **Reply.** Run `agent-browser eval "document.querySelector('[data-palette] ol > li:last-child').textContent"`. It returns `Run it in batches of 50,000`.
- **Payload.** Run `agent-browser find text "onDecide(" text`. It contains `"optionId": "run-batched"`.
- **Locked.** Choose a second option with `agent-browser find role button click --name "Cancel the migration"`. Nothing changes and the thread still ends with the first reply.
- **Reset.** Run `agent-browser find role button click --name "Reset demo"`. The label returns to `Needs your decision` and the thread has two items.
- **Edge samples.** Run `agent-browser find role radio check --name "Long text"` and take a screenshot at 390 px. No text leaves the card. Then run `find role radio check --name "No options"`. The card reads `No options to choose from. Reply in the chat instead.`.
- **Proof.** Record the decide step: `record start`, then decide, wait 1 second, and `record stop`. Take a screenshot of `[data-palette]` after the decision.

## Gotchas

- Option buttons stay focusable after a choice through `aria-disabled`, so `is enabled` still reports true. Check the label text instead.
- An option's accessible name includes its description and the `Why:` line. Match on the start of the label.
- Changing the sample remounts the demo and clears the choice.
- The status line splits its text across elements, so `find text` cannot match it. Read the `output` element instead.
