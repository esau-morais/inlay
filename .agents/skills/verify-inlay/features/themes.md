# Themes

Blocks style only through shadcn tokens, so the host's theme applies unchanged. The gallery shows this with a site-wide dark mode and three host palettes for the demo thread.

## Sub-features

- `th-dark` the `Dark mode` button switches the whole site, persists across reloads, and follows the system setting when unset.
- `th-palette` the `Theme` radios restyle only the demo thread: colors, radius, chart colors and font (Paper uses a serif).
- `th-palette-dark` each palette has a dark variant.
- `th-index` the index hero has the same theme radios.

## How to get to it (user POV)

- The `Dark mode` button in the header on every page.
- The `Theme` group on each block page and on the index.

## Driving it with agent-browser

Preconditions:

- Doctor passes. `localStorage["inlay-theme"]` is unset. Run `agent-browser eval "localStorage.removeItem('inlay-theme')"` if unsure.

- **System dark.** Run `agent-browser set media dark` and reload. `agent-browser eval "document.documentElement.className"` returns `dark`, with no flash of the light theme in a recording.
- **Toggle.** Run `agent-browser find role button click --name "Dark mode"`. The `dark` class flips and `aria-pressed` flips with it. Reload, and the choice persists.
- **Palette.** On `/blocks/plan-compare`, run `agent-browser find role radio check --name "Paper"`. `agent-browser eval "getComputedStyle(document.querySelector('[data-palette]')).fontFamily"` starts with `"Newsreader Variable"`, and the recommended button turns rust brown.
- **Palette in dark.** With dark mode on, choose `Harbor`. The thread turns navy and the primary color turns light blue.
- **Proof.** Take screenshots of the same block in `Neutral`, `Paper` and `Harbor`, in light and dark.
- **Cleanup.** Run `agent-browser eval "localStorage.removeItem('inlay-theme')"` and `agent-browser set media light`.

## Gotchas

- The palette changes only the `[data-palette]` thread, never the site chrome around it.
- `set media` affects the system preference only. A stored `inlay-theme` value wins over it.
