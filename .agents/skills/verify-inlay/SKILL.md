---
name: verify-inlay
description: Launch the Inlay gallery (TanStack Start, apps/gallery) and drive its block demos, themes and manifesto with agent-browser to prove UI behavior. Use before claiming a block or gallery change works, before attach-proof, or when asked to run, check or screenshot the gallery.
---

# Verify Inlay

The gallery in `apps/gallery` is the only thing in Inlay a user runs. It renders the five blocks from `packages/blocks` inside a mock agent thread, with sample data, a host theme switch and the payload each block sends back. Verifying a block means driving its gallery page the way a visitor does.

Helpers live in `.agents/skills/verify-inlay/scripts/`. Run them from anywhere inside the worktree.

## Launch

```sh
S="$(git rev-parse --show-toplevel)/.agents/skills/verify-inlay/scripts"
"$S/launch.sh"          # port 4310, the gallery's default
"$S/launch.sh" 4320     # any free port, for a second worktree or agent
```

`launch.sh` runs `pnpm install` if `apps/gallery/node_modules` is missing. It then starts `vite dev` on `127.0.0.1:<port>` in its own process group and waits until `/blocks/approval-card` renders its `<title>`. It prints `ready: http://127.0.0.1:<port>` and the log path, which is `$TMPDIR/verify-inlay-<port>/log`. There is no database or seed data. Every sample comes from `packages/blocks/src/<block>/examples.ts`.

Bind to `127.0.0.1`, not `localhost`. On this host `localhost` also tries `::1`, and vite then reports the port as in use.

Two worktrees can each run a gallery on different ports. Never drive a gallery you did not launch. Port 4310 may belong to another agent or to Esaú.

## Doctor

```sh
"$S/doctor.sh" <port>
```

It changes nothing. It checks that `launch.sh` started the process from this worktree and that the port belongs to that process group. It also checks that the index title renders, that all five block pages and `/manifesto` return 200, and that `/blocks/nope` returns 404. It exits 1 on any `FAIL`. Run it first whenever a page looks wrong. A `FAIL` on the ownership lines means someone else's server answered.

## Drive

Use agent-browser (`~/.npm-global/bin/agent-browser`) with a session per worktree, so you never drive another agent's browser:

```sh
export AGENT_BROWSER_SESSION="$(agent-browser session id --scope worktree --prefix verify)"
export AGENT_BROWSER_EXECUTABLE_PATH=/opt/google/chrome/chrome   # only if Chrome reports "No usable sandbox!"
U=http://127.0.0.1:<port>
agent-browser set viewport 1440 900
agent-browser open "$U/blocks/approval-card"
agent-browser wait --load networkidle
```

Always `wait --load networkidle` after `open`. The server sends finished HTML, so the page looks ready before React hydrates, and clicks before hydration do nothing while still printing `✓ Done`.

Shared handles on every block page (`/blocks/<name>`):

- Sample radios in the `Sample` group: `agent-browser find role radio check --name "<label>"`. The URL gains `?sample=<id>`.
- Theme radios in the `Theme` group, named `Neutral`, `Paper` and `Harbor`. The URL gains `palette=<value>`, and the thread element `[data-palette]` changes its colors, radius and font.
- The `Reset demo` button appears once a block sent something.
- The `Demo conversation` list holds the thread. A choice shows up as a new last item.
- The site-wide `Dark mode` toggle button sets `aria-pressed` and the `dark` class on `<html>`. It persists in `localStorage["inlay-theme"]`. Clear that key when you finish.
- Read state with `agent-browser eval`, for example `document.querySelectorAll('[data-palette] ol > li').length`.

Each feature file in [features/](features/README.md) has the exact recipe and the end state that proves it.

## Evidence

Save captures under `.proof/` at the repo root. Git ignores that folder. Pass absolute paths, because the agent-browser daemon resolves relative paths from its own directory.

- Screenshot every changed page at 1440 px and 390 px wide, in light and dark. Use `--full` for anything below the fold. To capture only the demo, pass the selector `[data-palette]` to `screenshot`.
- Record one interaction per clip, under 15 seconds: `agent-browser record start "$PWD/.proof/<name>.webm" --cursor` … `agent-browser record stop`.
- Prove the result, not the click. After choosing an option, show the reply bubble in `Demo conversation`, the `Sent … to the agent.` status, and the `What comes back` payload.
- Open every PNG before you use it. For a video, pull a frame with `ffmpeg -ss 3 -i <file> -frames:v 1 /tmp/frame.png` and open that. Discard captures of error overlays, blank frames or the wrong page.
- Then attach with the `attach-proof` skill.

## Cleanup

```sh
agent-browser close
"$S/stop.sh" <port>
```

`stop.sh` kills only the process group that `launch.sh` started on that port and deletes its state directory. It never touches `.proof/`. Never kill vite or node by name. Other worktrees run them too.

## Helpers

| Script | Does |
| --- | --- |
| `scripts/launch.sh [port]` | Installs deps if needed, starts the gallery, waits until it renders |
| `scripts/doctor.sh [port]` | Read-only health and ownership check, exits 1 on failure |
| `scripts/stop.sh [port]` | Stops what `launch.sh` started on that port |

Keep the feature map current with `maintain-verification-skill` when blocks, samples or gallery routes change.
