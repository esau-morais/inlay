import { useState, type PointerEvent } from "react";

import { cn } from "../lib/utils";
import type { ChartRow, ChartSeries } from "./data";
import {
  formatValue,
  readLabel,
  readNumber,
  rowKeys,
  seriesColor,
  type ValueFormat,
} from "./format";
import { niceTicks } from "./layout";

type LineChartProps = {
  rows: readonly ChartRow[];
  labelKey: string;
  series: readonly ChartSeries[];
  format: ValueFormat;
  label: string;
};

function position(index: number, count: number) {
  return count === 1 ? 50 : (index / (count - 1)) * 100;
}

function linePath(values: readonly (number | null)[], toY: (value: number) => number) {
  let path = "";
  let drawing = false;
  values.forEach((value, index) => {
    if (value === null) {
      drawing = false;
      return;
    }
    path += `${drawing ? "L" : "M"}${position(index, values.length)} ${toY(value)}`;
    drawing = true;
  });
  return path;
}

function labelStride(count: number, slots: number) {
  return Math.max(1, Math.ceil((count - 1) / slots));
}

export function LineChart({ rows, labelKey, series, format, label }: LineChartProps) {
  const [active, setActive] = useState<number | null>(null);
  const values = series.map((item) => rows.map((row) => readNumber(row, item.key)));
  const numbers = values.flat().filter((value): value is number => value !== null);
  const scale = niceTicks(Math.min(...numbers), Math.max(...numbers), 4);
  const toY = (value: number) => 100 - ((value - scale.min) / (scale.max - scale.min)) * 100;
  const count = rows.length;
  const narrowStride = labelStride(count, 3);
  const wideStride = labelStride(count, 6);
  const activeRow = active === null ? undefined : rows[active];
  const tickLabels = scale.ticks.map((tick) => formatValue(tick, format, true));
  const gutter = `${Math.max(...tickLabels.map((text) => text.length)) + 1.5}ch`;
  const keys = rowKeys(rows, labelKey);
  const current = active ?? count - 1;

  function describe(index: number) {
    const row = rows[index];
    const readings = series
      .map((item) => `${item.label} ${formatValue(readNumber(row ?? {}, item.key), format)}`)
      .join(", ");
    return `${row === undefined ? "" : readLabel(row, labelKey)}: ${readings}`;
  }

  function pointAt(event: PointerEvent<HTMLDivElement>) {
    const box = event.currentTarget.getBoundingClientRect();
    const ratio = Math.min(1, Math.max(0, (event.clientX - box.left) / box.width));
    setActive(Math.round(ratio * (count - 1)));
  }

  function leave(event: PointerEvent<HTMLDivElement>) {
    if (!event.currentTarget.contains(document.activeElement)) {
      setActive(null);
    }
  }

  return (
    <div className="px-4 pt-2 pb-4 @sm:px-5">
      <div className="flex">
        <div
          aria-hidden="true"
          className="relative h-44 shrink-0 text-xs tabular-nums @md:h-56"
          style={{ width: gutter }}
        >
          {scale.ticks.map((tick, index) => (
            <span
              key={tick}
              className="absolute right-2 -translate-y-1/2 whitespace-nowrap text-muted-foreground"
              style={{ top: `${toY(tick)}%` }}
            >
              {tickLabels[index]}
            </span>
          ))}
        </div>
        <div
          onPointerMove={pointAt}
          onPointerLeave={leave}
          className="relative h-44 min-w-0 flex-1 touch-pan-y rounded-xs outline-offset-4 has-focus-visible:outline-2 has-focus-visible:outline-ring @md:h-56"
        >
          <div aria-hidden="true">
            {scale.ticks.map((tick) => (
              <div
                key={tick}
                className="absolute inset-x-0 h-px bg-border"
                style={{ top: `${toY(tick)}%` }}
              />
            ))}
            <svg
              viewBox="0 0 100 100"
              preserveAspectRatio="none"
              className="absolute inset-0 size-full overflow-visible"
            >
              {values.length === 1 && values[0] !== undefined ? (
                <path
                  d={`${linePath(values[0], toY)}V100H0Z`}
                  fill={seriesColor(0)}
                  fillOpacity={0.08}
                  className={cn(values[0].includes(null) && "hidden")}
                />
              ) : null}
              {values.map((line, index) => (
                <path
                  key={series[index]?.key}
                  d={linePath(line, toY)}
                  fill="none"
                  stroke={seriesColor(index)}
                  strokeWidth={2}
                  strokeLinejoin="round"
                  strokeLinecap="round"
                  vectorEffect="non-scaling-stroke"
                />
              ))}
            </svg>
            {active === null ? null : (
              <>
                <div
                  className="absolute inset-y-0 w-px bg-foreground/25"
                  style={{ left: `${position(active, count)}%` }}
                />
                {values.map((line, index) => {
                  const value = line[active];
                  return value === null || value === undefined ? null : (
                    <span
                      key={series[index]?.key}
                      className="absolute size-2.5 -translate-1/2 rounded-full ring-2 ring-card"
                      style={{
                        left: `${position(active, count)}%`,
                        top: `${toY(value)}%`,
                        background: seriesColor(index),
                      }}
                    />
                  );
                })}
              </>
            )}
          </div>
          {activeRow === undefined || active === null ? null : (
            <div
              aria-hidden="true"
              className={cn(
                "pointer-events-none absolute top-1 z-10 flex max-w-56 min-w-36 flex-col gap-1 rounded-md border bg-popover px-2.5 py-2 text-xs text-popover-foreground shadow-md",
                position(active, count) < 50
                  ? "translate-x-3"
                  : "-translate-x-[calc(100%+0.75rem)]",
              )}
              style={{ left: `${position(active, count)}%` }}
            >
              <span className="font-medium">{readLabel(activeRow, labelKey)}</span>
              {series.map((item, index) => (
                <span key={item.key} className="flex items-center gap-2">
                  <span
                    className="size-2 shrink-0 rounded-full"
                    style={{ background: seriesColor(index) }}
                  />
                  <span className="min-w-0 flex-1 truncate text-muted-foreground">
                    {item.label}
                  </span>
                  <span className="font-medium tabular-nums">
                    {formatValue(values[index]?.[active] ?? null, format)}
                  </span>
                </span>
              ))}
            </div>
          )}
          <input
            type="range"
            min={0}
            max={Math.max(0, count - 1)}
            step={1}
            value={current}
            aria-label={`${label}. Use the arrow keys to read each point.`}
            aria-valuetext={describe(current)}
            onChange={(event) => setActive(Number(event.target.value))}
            onFocus={() => setActive(current)}
            onBlur={() => setActive(null)}
            className="absolute inset-0 m-0 size-full cursor-crosshair appearance-none opacity-0"
          />
        </div>
      </div>
      <div aria-hidden="true" className="mt-2 flex text-xs">
        <span className="shrink-0" style={{ width: gutter }} />
        <div className="relative h-4 min-w-0 flex-1">
          {rows.map((row, index) => {
            const inNarrow = index % narrowStride === 0;
            const inWide = index % wideStride === 0;
            if (!inNarrow && !inWide) {
              return null;
            }
            const left = position(index, count);
            return (
              <span
                key={keys[index]}
                className={cn(
                  "absolute max-w-24 truncate whitespace-nowrap text-muted-foreground",
                  left < 8 ? "translate-x-0" : left > 92 ? "-translate-x-full" : "-translate-x-1/2",
                  inNarrow && !inWide && "@md:hidden",
                  !inNarrow && inWide && "hidden @md:block",
                )}
                style={{ left: `${left}%` }}
              >
                {readLabel(row, labelKey)}
              </span>
            );
          })}
        </div>
      </div>
    </div>
  );
}
