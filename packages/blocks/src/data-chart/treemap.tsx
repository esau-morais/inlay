import type { ChartRow, ChartSeries } from "./data";
import { formatValue, readLabel, readNumber, seriesColor, type ValueFormat } from "./format";
import { squarify } from "./layout";

type TreemapProps = {
  rows: readonly ChartRow[];
  labelKey: string;
  series: ChartSeries;
  format: ValueFormat;
  label: string;
};

const MAX_TILES = 12;
const WIDTH = 16;
const HEIGHT = 10;

export function Treemap({ rows, labelKey, series, format, label }: TreemapProps) {
  const items = rows
    .map((row) => ({ label: readLabel(row, labelKey), value: readNumber(row, series.key) ?? 0 }))
    .filter((item) => item.value > 0)
    .toSorted((a, b) => b.value - a.value);
  const shown = items.length > MAX_TILES ? items.slice(0, MAX_TILES - 1) : items;
  const rest = items.slice(shown.length);
  const tiles =
    rest.length === 0
      ? shown
      : [
          ...shown,
          {
            label: `${rest.length} more`,
            value: rest.reduce((sum, item) => sum + item.value, 0),
          },
        ];
  const total = tiles.reduce((sum, item) => sum + item.value, 0);
  const layout = squarify(
    tiles.map((tile) => tile.value),
    WIDTH,
    HEIGHT,
  );
  const summary = tiles
    .slice(0, 3)
    .map((tile) => `${tile.label} ${formatValue(tile.value, format)}`)
    .join(", ");

  return (
    <div className="px-4 pt-2 pb-4 @sm:px-5">
      <p className="sr-only">{`${label}. Largest: ${summary}. Switch to the table for every value.`}</p>
      <div aria-hidden="true" className="relative aspect-[16/10] w-full">
        {layout.map((rect) => {
          const tile = tiles[rect.index];
          if (tile === undefined) {
            return null;
          }
          const color = seriesColor(rect.index);
          const share = tile.value / total;
          const roomy = rect.width >= 2.4 && rect.height >= 1.6;
          return (
            <div
              key={`${rect.index}:${tile.label}`}
              className="absolute p-px"
              style={{
                left: `${(rect.x / WIDTH) * 100}%`,
                top: `${(rect.y / HEIGHT) * 100}%`,
                width: `${(rect.width / WIDTH) * 100}%`,
                height: `${(rect.height / HEIGHT) * 100}%`,
              }}
            >
              <div
                className="flex size-full flex-col gap-0.5 overflow-hidden rounded-sm border-l-[3px] px-2 py-1.5"
                style={{
                  borderLeftColor: color,
                  background: `color-mix(in oklab, ${color} 16%, var(--card))`,
                }}
              >
                {roomy ? (
                  <>
                    <span className="truncate text-xs font-medium">{tile.label}</span>
                    <span className="truncate text-xs text-muted-foreground tabular-nums">
                      {formatValue(tile.value, format, true)}
                      {share >= 0.05 ? ` · ${Math.round(share * 100)}%` : null}
                    </span>
                  </>
                ) : null}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
