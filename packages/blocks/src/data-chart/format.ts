import type { ChartRow, DataChartData } from "./data";

export type ValueFormat = DataChartData["format"];

const formatters = new Map<string, Intl.NumberFormat>();

function numberFormat(decimals: number | undefined, compact: boolean) {
  const key = `${decimals ?? "auto"}-${compact}`;
  let formatter = formatters.get(key);
  if (formatter === undefined) {
    formatter = new Intl.NumberFormat("en-US", {
      notation: compact ? "compact" : "standard",
      minimumFractionDigits: compact ? 0 : (decimals ?? 0),
      maximumFractionDigits: compact ? 1 : (decimals ?? 2),
    });
    formatters.set(key, formatter);
  }
  return formatter;
}

export function formatValue(value: number | null, format: ValueFormat, compact = false) {
  if (value === null) {
    return "No value";
  }
  const sign = value < 0 ? "−" : "";
  const digits = numberFormat(format?.decimals, compact).format(Math.abs(value));
  return `${sign}${format?.prefix ?? ""}${digits}${format?.suffix ?? ""}`;
}

export function readNumber(row: ChartRow, key: string) {
  const value = row[key];
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

export function readLabel(row: ChartRow, key: string) {
  const value = row[key];
  return value === null || value === undefined ? "" : String(value);
}

export function seriesColor(index: number) {
  return `var(--chart-${(index % 5) + 1})`;
}

export function rowKeys(rows: readonly ChartRow[], labelKey: string) {
  const seen = new Map<string, number>();
  return rows.map((row) => {
    const label = readLabel(row, labelKey);
    const count = (seen.get(label) ?? 0) + 1;
    seen.set(label, count);
    return count === 1 ? label : `${label} (${count})`;
  });
}
