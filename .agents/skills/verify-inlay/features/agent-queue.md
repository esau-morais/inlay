# Agent queue

The agent queue shows jobs per worker with running, failed, queued and done states. Running and queued timers tick every second.

## Sub-features

- `aq-timers` running jobs show `running for` time that increases, and queued jobs show `waiting` time.
- `aq-summary` the header counts jobs and workers, and the legend hides statuses with zero jobs.
- `aq-collapse` a worker with more than six jobs shows five and a `Show N more (…)` button.
- `aq-failed` failed jobs show their error in red monospace, clamped to three lines.
- `aq-finished` a finished queue does not tick.
- `aq-empty` an empty queue says jobs show up when the agent starts them.

## How to get to it (user POV)

- Open `/blocks/agent-queue`, or choose `agent-queue` in the index list.

## Driving it with agent-browser

Preconditions:

- Doctor passes. The page is open at `$U/blocks/agent-queue` and `wait --load networkidle` finished.

- **Timers tick.** Run `agent-browser eval "[...document.querySelectorAll('[data-palette] li')].find(l => l.textContent.includes('Move order handlers'))?.lastElementChild.textContent"`, wait 2 seconds, and run it again. The second value is later, for example `running for 4m 19s` then `running for 4m 21s`.
- **Collapse.** Open `$U/blocks/agent-queue?sample=many`. Run `agent-browser find role button click --name "Show 5 more"`. That button now has `aria-expanded="true"`, reads `Show fewer`, and the worker shows ten jobs.
- **Long text.** Open `?sample=long` at 390 px. The long title wraps in full, the email breaks inside the card, and the worker name truncates with an ellipsis.
- **Finished.** Open `?sample=finished`. Read a done job's time twice, two seconds apart. It does not change.
- **Empty.** Open `?sample=empty`. The block reads `Nothing in the queue.`.
- **Proof.** Take screenshots of `[data-palette]` for `typical` and `many` at both widths.

## Gotchas

- Sample timestamps are built from the server's `Date.now()` when the page loads, so the exact seconds differ between runs. Assert that time increases, not a fixed value.
- The server render shows the time at load. The client replaces it after hydration, so read timers only after `networkidle`.
