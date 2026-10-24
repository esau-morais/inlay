import { useId, useState, type CSSProperties } from "react";

import { cn } from "../lib/utils";
import type { PlanCompareData, PlanOption, PlanPick } from "./data";

type PlanCompareProps = {
  data: PlanCompareData;
  picked?: string | undefined;
  onPick?: ((pick: PlanPick) => void) | undefined;
  className?: string | undefined;
};

const layouts = {
  narrow: {
    grid: "@lg:grid-cols-[repeat(var(--plans),minmax(0,1fr))] @lg:grid-rows-[repeat(5,auto)]",
    column: "@lg:row-span-5 @lg:grid-rows-subgrid @lg:border-t-0 @lg:border-l @lg:first:border-l-0",
  },
  wide: {
    grid: "@2xl:grid-cols-[repeat(var(--plans),minmax(0,1fr))] @2xl:grid-rows-[repeat(5,auto)]",
    column:
      "@2xl:row-span-5 @2xl:grid-rows-subgrid @2xl:border-t-0 @2xl:border-l @2xl:first:border-l-0",
  },
};

export function PlanCompare({ data, picked, onPick, className }: PlanCompareProps) {
  const questionId = useId();
  const [pickedId, setPickedId] = useState<string | undefined>(undefined);
  const chosen = data.options.find((option) => option.id === (picked ?? pickedId));
  const layout = data.options.length <= 2 ? layouts.narrow : layouts.wide;
  const gridStyle: CSSProperties & { "--plans": number } = { "--plans": data.options.length };

  function pick(option: PlanOption) {
    if (chosen !== undefined) {
      return;
    }
    setPickedId(option.id);
    onPick?.({ optionId: option.id, name: option.name });
  }

  return (
    <div
      className={cn(
        "@container w-full max-w-3xl overflow-hidden rounded-xl border bg-card text-card-foreground shadow-xs",
        className,
      )}
    >
      <div className="flex flex-col gap-1.5 p-4 @sm:px-5">
        <p className="text-xs font-medium text-muted-foreground">
          {chosen === undefined ? "Pick a plan" : "Plan picked"}
        </p>
        <p id={questionId} className="text-base font-semibold text-balance wrap-break-word">
          {data.question}
        </p>
      </div>

      {data.options.length === 0 ? (
        <p className="border-t px-4 py-6 text-center text-sm text-pretty text-muted-foreground @sm:px-5">
          No plans to compare. Ask the agent for options.
        </p>
      ) : (
        <fieldset
          aria-labelledby={questionId}
          className={cn("grid min-w-0 border-t", layout.grid)}
          style={gridStyle}
        >
          {data.options.map((option) => (
            <PlanColumn
              key={option.id}
              option={option}
              columnClass={layout.column}
              recommendation={
                data.recommendation?.optionId === option.id ? data.recommendation : undefined
              }
              chosen={chosen}
              onPick={pick}
            />
          ))}
        </fieldset>
      )}

      <output
        className={cn(
          "block border-t px-4 py-2.5 text-xs text-muted-foreground @sm:px-5",
          chosen === undefined && "sr-only",
        )}
      >
        {chosen === undefined ? null : (
          <>
            Sent <span className="font-medium text-foreground">{chosen.name}</span> to the agent.
          </>
        )}
      </output>
    </div>
  );
}

type PlanColumnProps = {
  option: PlanOption;
  columnClass: string;
  recommendation: PlanCompareData["recommendation"];
  chosen: PlanOption | undefined;
  onPick: (option: PlanOption) => void;
};

function PlanColumn({ option, columnClass, recommendation, chosen, onPick }: PlanColumnProps) {
  const isChosen = chosen?.id === option.id;
  const decided = chosen !== undefined;

  return (
    <div
      className={cn(
        "grid content-start gap-4 border-t p-4 transition-opacity duration-200 ease-out first:border-t-0 motion-reduce:transition-none @sm:px-5",
        columnClass,
        decided && !isChosen && "opacity-55",
        isChosen && "bg-accent/60",
      )}
    >
      <div className="flex min-w-0 flex-col gap-1.5">
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
          <p className="min-w-0 text-sm font-semibold text-balance wrap-break-word">
            {option.name}
          </p>
          {recommendation === undefined ? null : (
            <span className="shrink-0 rounded-full bg-primary px-2 py-0.5 text-xs font-medium whitespace-nowrap text-primary-foreground">
              Recommended
            </span>
          )}
        </div>
        {option.summary === undefined ? null : (
          <p className="text-sm text-pretty text-muted-foreground wrap-break-word">
            {option.summary}
          </p>
        )}
        {recommendation?.reason === undefined ? null : (
          <p className="text-xs text-pretty text-muted-foreground wrap-break-word">
            <span className="font-medium text-foreground">Why: </span>
            {recommendation.reason}
          </p>
        )}
      </div>

      <div className="flex flex-col gap-0.5">
        <p className="text-xs text-muted-foreground">Cost</p>
        <p className="text-sm font-medium tabular-nums wrap-break-word">{option.cost}</p>
      </div>

      <PointList title="Pros" items={option.pros} marker="+" />
      <PointList title="Cons" items={option.cons} marker="−" />

      <div className="self-end">
        <button
          type="button"
          aria-disabled={decided ? true : undefined}
          onClick={() => onPick(option)}
          className={cn(
            "inline-flex h-8 items-center gap-1.5 rounded-md border px-3 text-sm font-medium whitespace-nowrap transition-[background-color,color,scale] duration-150 ease-out focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring motion-reduce:transition-none",
            !decided && "active:scale-[0.97]",
            !decided && recommendation !== undefined
              ? "border-primary bg-primary text-primary-foreground hover:bg-primary/90"
              : "bg-background hover:bg-accent",
            isChosen && "border-primary bg-primary text-primary-foreground hover:bg-primary",
            decided && "cursor-default",
            decided && !isChosen && "hover:bg-background",
          )}
        >
          {isChosen ? (
            <>
              <svg viewBox="0 0 16 16" fill="none" aria-hidden="true" className="size-3.5">
                <path
                  d="M3.5 8.5 6.5 11.5 12.5 5"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              Picked
            </>
          ) : (
            "Pick this plan"
          )}
          <span className="sr-only">: {option.name}</span>
        </button>
      </div>
    </div>
  );
}

function PointList({
  title,
  items,
  marker,
}: {
  title: string;
  items: readonly string[];
  marker: "+" | "−";
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <p className="text-xs text-muted-foreground">{title}</p>
      {items.length === 0 ? (
        <p className="text-sm text-muted-foreground">None listed</p>
      ) : (
        <ul className="flex flex-col gap-1.5">
          {items.map((item) => (
            <li key={item} className="flex gap-2 text-sm text-pretty">
              <span
                aria-hidden="true"
                className={cn(
                  "w-2.5 shrink-0 text-center font-mono",
                  marker === "+" ? "text-foreground" : "text-muted-foreground",
                )}
              >
                {marker}
              </span>
              <span className="min-w-0 wrap-break-word">{item}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
