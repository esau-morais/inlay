---
name: attach-proof
description: Capture screenshots and recordings with agent-browser and attach them to an Inlay pull request through scripts/attach-proof.ts. Use before asking for review on any PR that changes UI or behavior, or when asked to attach proof or evidence to a PR.
---

# Attach proof

Esaú reviews every PR that changes UI or behavior against evidence from the running app, not against the diff alone. This skill captures that evidence with `agent-browser` and puts it in the PR body with `scripts/attach-proof.ts`.

A PR that only changes docs, config, or CI gets no screenshots or recordings, so skip this skill. When that change describes or alters architecture or a flow, put a Mermaid diagram of it in the PR body instead. AGENTS.md has the full rule.

## 1. Capture

Use a session named after the worktree, so you never drive another agent's browser. Save every capture in `.proof/`, which git ignores. Pass absolute paths. The agent-browser daemon resolves a relative path from its own directory and saves the file somewhere else.

```sh
export AGENT_BROWSER_SESSION="$(agent-browser session id --scope worktree --prefix proof)"
mkdir -p .proof
P="$PWD/.proof"

agent-browser set viewport 1440 900
agent-browser open <url>
agent-browser wait --text "<text that only renders when the change works>"
agent-browser screenshot "$P/<subject>-desktop.png"

agent-browser set viewport 390 844
agent-browser reload
agent-browser wait --text "<same text>"
agent-browser screenshot "$P/<subject>-phone.png"
```

If Chrome exits with `No usable sandbox!`, the host blocks unprivileged user namespaces (Ubuntu 23.10 and later). Point agent-browser at the system Chrome, which ships an AppArmor profile, with `export AGENT_BROWSER_EXECUTABLE_PATH=/opt/google/chrome/chrome`. Do not pass `--no-sandbox`.

Capture every changed screen at both widths. Add `--full` to `screenshot` when the change sits below the fold.

Record when the change involves interaction, such as a click, a state change, or an animation. Keep each recording under 15 seconds and cover one interaction.

```sh
agent-browser set viewport 1440 900
agent-browser open <url>
agent-browser record start "$P/<subject>-<action>.webm" --cursor
# drive the interaction with snapshot, click, fill, and wait
agent-browser record stop
agent-browser close
```

Open each PNG with the `Read` tool before you attach it. For a recording, pull one frame with `ffmpeg -ss 3 -i <file> -frames:v 1 /tmp/frame.png` and open that. Throw away any capture that shows a spinner, an error page, a blank frame, or a page other than the one you meant.

TODO: once the gallery runs, the next thread creates the `verify-inlay` skill with `create-verification-skill`. After that, launch and drive the app with `verify-inlay` and use this skill only for the capture and attach steps.

## 2. Attach

```sh
node scripts/attach-proof.ts --pr <number> --note "<one sentence on what to look at>" .proof/<files>
```

The script does the following:

1. Pushes the files to the orphan `proof-assets` branch under `pr-<number>/<timestamp>/`. It writes the commit with git plumbing and a temporary index, so your checkout and working tree stay untouched.
2. Builds `raw.githubusercontent.com` URLs pinned to that commit. A later upload never changes what an older PR shows.
3. Converts each `.webm` or `.mp4` to a GIF with `ffmpeg` and embeds the GIF, with a link to the original. GitHub does not play a linked video inline. Without `ffmpeg`, the PR gets only the link.
4. Replaces the text between `<!-- proof:start -->` and `<!-- proof:end -->` in the PR body, or appends the section when it is missing.

Each run replaces the whole section. Pass every file the PR needs in one call.

The script needs `gh` logged in with push access to the repo, and an open PR. `--pr` defaults to the PR for the current branch.

## 3. Check the PR

Open the PR with `agent-browser`, scroll to the Proof section, and confirm each image renders. A broken image means the push or the URL failed. Rerun the script, and do not hand the PR to Esaú until the images show.

## Why this design

- `gh` has no command that uploads an image to a PR body. GitHub has no public API for the attachment upload that the web editor uses.
- Committing captures to the feature branch would put binary files into `main` when the PR merges.
- The `proof-assets` branch never merges, and deleting it removes every capture at once.
