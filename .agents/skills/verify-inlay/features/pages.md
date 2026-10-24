# Pages and metadata

The index lists the five blocks under a live approval-card thread. The manifesto shows the plan's text. Block pages link to their neighbors, unknown blocks return a 404 page, and every page renders on the server with link-preview metadata.

## Sub-features

- `pg-index` the index lists `01` to `05` with block names and summaries, each linking to its page.
- `pg-manifesto` `/manifesto` shows `Chat is where you start` in a serif.
- `pg-pager` block pages end with `Previous` and `Next` links.
- `pg-404` `/blocks/<unknown>` shows `This page does not exist.` with status 404 and `noindex`.
- `pg-meta` each page has a title, a description, a canonical URL, og:* and twitter:* tags, and an og:image that exists.
- `pg-skip` the first Tab shows a `Skip to content` link.

## How to get to it (user POV)

- Header links `Blocks` (the index) and `Manifesto`, and the logo.
- The index list rows, and the pager at the bottom of each block page.

## Driving it with agent-browser

Preconditions:

- Doctor passes.

- **Index.** Open `$U/`. `agent-browser find role link click --name "plan-compare"` lands on `/blocks/plan-compare`.
- **Pager.** On `/blocks/plan-compare`, `agent-browser find role link click --name "Next Data chart"` lands on `/blocks/data-chart`.
- **Manifesto.** Open `$U/manifesto`. The `h1` reads `Chat is where you start`, and the last paragraph ends with `But the answer should look like the work.`.
- **404.** Run `curl -s -o /dev/null -w '%{http_code}' $U/blocks/nope`. It returns `404`. The rendered page reads `This page does not exist.`.
- **Metadata.** For each page, run `curl -s $U/<path> | grep -oE '<title>[^<]*|<meta (name|property)="(description|og:[a-z:]+|twitter:[a-z]+)"[^>]*|<link rel="canonical"[^>]*'`. There is exactly one title, one description and one canonical, and og:url equals the canonical. Each `og:image` path exists under `apps/gallery/public/og/`.
- **Skip link.** Open any page, run `agent-browser press Tab` and take a screenshot. `Skip to content` is visible at the top left.
- **Proof.** Take screenshots of the index and manifesto at 1440 and 390 px, in light and dark.

## Gotchas

- Metadata URLs point at `https://inlayui.dev`, which is not deployed yet. Check that the files exist locally, not that the URLs load.
- Regenerate the preview images with `pnpm --filter @inlay/gallery og` while a gallery runs on 4310. Set `GALLERY_URL` for another port.
