# Diff review

Diff review groups changed files by severity with the agent's notes. High-severity files start open. Others open on click, and long groups collapse.

## Sub-features

- `dr-groups` groups appear in the order `Needs a close look`, `Worth a look`, `Routine`.
- `dr-open` high-severity files start open, and the others open when their row is clicked.
- `dr-notes` file notes and hunk notes render under the file.
- `dr-paths` long paths truncate the directory and keep the file name visible, and hunks scroll sideways.
- `dr-collapse` a group with more than eight files shows six and a `Show N more files` button.
- `dr-empty` with no files, the block says there is nothing to review.

## How to get to it (user POV)

- Open `/blocks/diff-review`, or choose `diff-review` in the index list.

## Driving it with agent-browser

Preconditions:

- Doctor passes. The page is open at `$U/blocks/diff-review` and `wait --load networkidle` finished.

- **Initial state.** Run `agent-browser eval "document.querySelectorAll('[data-palette] details[open]').length"`. It returns `2`.
- **Open a file.** Run `agent-browser find text "limits.ts" click`. The count becomes `3`, and the note `The limit is a constant for now.` is visible.
- **Collapse.** Open `?sample=many`. Run `agent-browser find role button click --name "Show 26 more files"`. All 32 routine files are listed.
- **Long paths.** Open `?sample=long` at 390 px. Each file row shows a file name ending in `.ts`, preceded by a truncated directory. The hunk scrolls sideways and the card does not.
- **Empty.** Open `?sample=empty`. The block reads `No changed files to review.`.
- **Proof.** Take screenshots of `[data-palette]` for `typical` and `long` at both widths.

## Gotchas

- Under the Neutral palette `primary` is near-black, so added lines get a gray tint. Use the `+` marker to tell them apart. Paper and Harbor show a colored tint.
- File rows are `summary` elements and have no button role. Click them by their path text.
