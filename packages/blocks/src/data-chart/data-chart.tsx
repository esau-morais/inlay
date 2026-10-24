import { useId, useState } from "react";

import { cn } from "../lib/utils";
import { BarChart } from "./bar-chart";
import type { DataChartData } from "./data";
import { formatValue, readLabel, readNumber, rowKeys, seriesColor } from "./format";
import { LineChart } from "./line-chart";
import { Treemap } from "./treemap";

type DataChartProps = {
  data: DataChartData;
  className?: string | undefined;
};

type View = "chart" | "table";

const typeNames = { line: "Line chart", bar: "Bar chart", treemap: "Treemap" } as const;

export function DataChart({ data, className }: DataChartProps) {
  const [view, setView] = useState<View>("chart");
  const titleId = useId();
  const series = data.type === "treemap" ? data.series.slice(0, 1) : data.series;
  const hasValues =
    series.length > 0 &&
    data.rows.some((row) => series.some((item) => readNumber(row, item.key) !== null));
  const label = `${typeNames[data.type]}${data.title === undefined ? "" : ` of ${data.title}`}`;

  return (
    <figure
      aria-labelledby={data.title === undefined ? undefined : titleId}
      aria-label={data.title === undefined ? typeNames[data.type] : undefined}
      className={cn(
        "@container w-full max-w-2xl rounded-xl border bg-card text-card-foreground shadow-xs",
        className,
      )}
    >
      <div className="flex flex-col items-start gap-3 p-4 @sm:flex-row @sm:justify-between @sm:gap-4 @sm:px-5">
        <div className="flex min-w-0 flex-col gap-1">
          {data.title === undefined ? null : (
            <p id={titleId} className="text-sm font-semibold text-balance wrap-break-word">
              {data.title}
            </p>
          )}
          {data.caption === undefined ? null : (
            <p className="text-sm text-pretty text-muted-foreground wrap-break-word">
              {data.caption}
            </p>
          )}
        </div>
        {hasValues ? <ViewToggle view={view} onChange={setView} /> : null}
      </div>

      {series.length > 1 && hasValues && view === "chart" ? (
        <ul
          aria-label="Series"
          className="flex flex-wrap gap-x-4 gap-y-1 px-4 pb-2 text-xs text-muted-foreground @sm:px-5"
        >
          {series.map((item, index) => (
            <li key={item.key} className="flex items-center gap-1.5">
              <span
                aria-hidden="true"
                className="size-2 shrink-0 rounded-full"
                style={{ background: seriesColor(index) }}
              />
              {item.label}
            </li>
          ))}
        </ul>
      ) : null}

      {!hasValues ? (
        <p className="border-t px-4 py-6 text-center text-sm text-pretty text-muted-foreground @sm:px-5">
          No data to chart yet. Ask the agent to rerun the query.
        </p>
      ) : view === "table" ? (
        <DataTable data={data} label={label} />
      ) : data.type === "line" ? (
        <LineChart
          rows={data.rows}
          labelKey={data.labelKey}
          series={series}
          format={data.format}
          label={label}
        />
      ) : data.type === "bar" ? (
        <BarChart
          rows={data.rows}
          labelKey={data.labelKey}
          series={series}
          format={data.format}
          label={label}
        />
      ) : series[0] === undefined ? null : (
        <Treemap
          rows={data.rows}
          labelKey={data.labelKey}
          series={series[0]}
          format={data.format}
          label={label}
        />
      )}
    </figure>
  );
}

function ViewToggle({ view, onChange }: { view: View; onChange: (view: View) => void }) {
  return (
    <div className="flex shrink-0 rounded-md bg-muted p-0.5">
      {(["chart", "table"] as const).map((option) => (
        <button
          key={option}
          type="button"
          aria-pressed={view === option}
          onClick={() => onChange(option)}
          className={cn(
            "rounded-[calc(var(--radius)-4px)] px-2 py-0.5 text-xs font-medium capitalize text-muted-foreground transition-colors duration-150 hover:text-foreground focus-visible:outline-2 focus-visible:outline-ring",
            view === option && "bg-background text-foreground shadow-xs",
          )}
        >
          {option}
        </button>
      ))}
    </div>
  );
}

function DataTable({ data, label }: { data: DataChartData; label: string }) {
  const series = data.type === "treemap" ? data.series.slice(0, 1) : data.series;
  const keys = rowKeys(data.rows, data.labelKey);
  return (
    <section
      aria-label={`${label}, as a table`}
      tabIndex={0}
      className="max-h-[30rem] overflow-auto border-t outline-offset-[-2px] focus-visible:outline-2 focus-visible:outline-ring"
    >
      <table className="w-full border-collapse text-sm">
        <thead className="sticky top-0 bg-card">
          <tr className="border-b">
            <th
              scope="col"
              className="px-4 py-2 text-left text-xs font-medium text-muted-foreground first-letter:uppercase @sm:px-5"
            >
              {data.labelKey}
            </th>
            {series.map((item) => (
              <th
                key={item.key}
                scope="col"
                className="px-4 py-2 text-right text-xs font-medium text-muted-foreground @sm:px-5"
              >
                {item.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.rows.map((row, index) => {
            const rowLabel = readLabel(row, data.labelKey);
            return (
              <tr key={keys[index]} className="border-b last:border-b-0">
                <th
                  scope="row"
                  className="max-w-64 px-4 py-1.5 text-left font-normal wrap-break-word @sm:px-5"
                >
                  {rowLabel}
                </th>
                {series.map((item) => (
                  <td
                    key={item.key}
                    className="px-4 py-1.5 text-right whitespace-nowrap tabular-nums @sm:px-5"
                  >
                    {formatValue(readNumber(row, item.key), data.format)}
                  </td>
                ))}
              </tr>
            );
          })}
        </tbody>
      </table>
    </section>
  );
}
