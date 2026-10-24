import type { ChartRow, ChartSeries } from "./data";
import {
  formatValue,
  readLabel,
  readNumber,
  rowKeys,
  seriesColor,
  type ValueFormat,
} from "./format";

type BarChartProps = {
  rows: readonly ChartRow[];
  labelKey: string;
  series: readonly ChartSeries[];
  format: ValueFormat;
  label: string;
};

export function BarChart({ rows, labelKey, series, format, label }: BarChartProps) {
  const largest = Math.max(
    ...rows.flatMap((row) => series.map((item) => Math.max(0, readNumber(row, item.key) ?? 0))),
  );

  const keys = rowKeys(rows, labelKey);

  return (
    <section
      aria-label={label}
      tabIndex={rows.length > 12 ? 0 : undefined}
      className="max-h-[30rem] overflow-y-auto px-4 pt-2 pb-4 outline-offset-[-2px] focus-visible:outline-2 focus-visible:outline-ring @sm:px-5"
    >
      <ul className="flex flex-col gap-3">
        {rows.map((row, rowIndex) => {
          const rowLabel = readLabel(row, labelKey);
          const key = keys[rowIndex];
          return (
            <li
              key={key}
              className="grid grid-cols-1 gap-x-4 gap-y-1 @md:grid-cols-[minmax(0,11rem)_minmax(0,1fr)] @md:items-center"
            >
              <span className="truncate text-sm" title={rowLabel}>
                {rowLabel}
              </span>
              <span className="flex flex-col gap-1">
                {series.map((item, index) => {
                  const value = readNumber(row, item.key);
                  const ratio = largest === 0 || value === null ? 0 : Math.max(0, value) / largest;
                  return (
                    <span key={item.key} className="flex items-center gap-2">
                      <span
                        aria-hidden="true"
                        className="h-2.5 shrink-0 rounded-[3px]"
                        style={{
                          width: `calc((100% - 5rem) * ${ratio})`,
                          minWidth: value !== null && value > 0 ? "2px" : 0,
                          background: seriesColor(index),
                        }}
                      />
                      <span className="text-xs whitespace-nowrap text-muted-foreground tabular-nums">
                        {series.length > 1 ? <span className="sr-only">{item.label}: </span> : null}
                        {formatValue(value, format)}
                      </span>
                    </span>
                  );
                })}
              </span>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
