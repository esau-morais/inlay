# Data chart

Data chart draws a line, bar or treemap chart from rows, colored with the host's chart tokens, and switches to a table view.

## Sub-features

- `dc-line` the line chart shows the series, y ticks and thinned x labels.
- `dc-read` hovering or using the arrow keys on the line chart shows a tooltip and announces the point.
- `dc-bar` bar charts print every value, and multi-series bars group by row.
- `dc-treemap` treemap tiles scale to their value, and the tail groups into one `N more` tile.
- `dc-table` the `Table` button lists every row.
- `dc-many` 120 points with one missing value draw a line with a gap.
- `dc-empty` with no rows, the block says there is no data.

## How to get to it (user POV)

- Open `/blocks/data-chart`, or choose `data-chart` in the index list.

## Driving it with agent-browser

Preconditions:

- Doctor passes. The page is open at `$U/blocks/data-chart` and `wait --load networkidle` finished.

- **Keyboard reading.** Run `agent-browser focus 'input[type=range]'`, then `agent-browser press ArrowLeft` three times. `agent-browser eval "document.querySelector('input[type=range]').getAttribute('aria-valuetext')"` returns `Oct 20: p50 171 ms, p95 436 ms`, and a tooltip with the same values sits beside the guide line.
- **Table.** Run `agent-browser find role button click --name "Table"`. `agent-browser eval "document.querySelectorAll('table tbody tr').length"` returns `14`.
- **Bar.** Open `?sample=bar`. Every route prints two values, such as `402.1 kB` and `166.3 kB`.
- **Treemap.** Open `?sample=treemap`. The largest tile reads `@acme/checkout` with `512s · 21%`, and one tile reads `4 more`.
- **Empty.** Open `?sample=empty`. The block reads `No data to chart yet.` and has no `Table` button.
- **Proof.** Take screenshots of `[data-palette]` for `line`, `bar` and `treemap` at both widths, and one in the `Paper` palette.

## Gotchas

- The range input covers the plot and is invisible. Focus it by selector, because it has no visible label.
- The first focus selects the last point, so three `ArrowLeft` presses land on the fourth point from the end.
