import { useId, useState } from "react";

import { cn } from "../lib/utils";
import type { ApprovalCardData, ApprovalChoice, ApprovalOption } from "./data";

type ApprovalCardProps = {
  data: ApprovalCardData;
  decision?: string | undefined;
  onDecide?: ((choice: ApprovalChoice) => void) | undefined;
  className?: string | undefined;
};

export function ApprovalCard({ data, decision, onDecide, className }: ApprovalCardProps) {
  const questionId = useId();
  const [chosenId, setChosenId] = useState<string | undefined>(undefined);
  const decided = data.options.find((option) => option.id === (decision ?? chosenId));
  const recommendation = data.recommendation;

  function decide(option: ApprovalOption) {
    if (decided !== undefined) {
      return;
    }
    setChosenId(option.id);
    onDecide?.({ optionId: option.id, label: option.label });
  }

  return (
    <div
      className={cn(
        "@container w-full max-w-xl rounded-xl border bg-card text-card-foreground shadow-xs",
        className,
      )}
    >
      <div className="flex flex-col gap-1.5 p-4 @sm:p-5">
        <p className="text-xs font-medium text-muted-foreground">
          {decided === undefined ? "Needs your decision" : "Decided"}
        </p>
        <p id={questionId} className="text-base font-semibold text-balance wrap-break-word">
          {data.question}
        </p>
        {data.context === undefined ? null : (
          <p className="text-sm text-pretty text-muted-foreground wrap-break-word">
            {data.context}
          </p>
        )}
      </div>

      {data.options.length === 0 ? (
        <p className="border-t px-4 py-3 text-sm text-muted-foreground @sm:px-5">
          No options to choose from. Reply in the chat instead.
        </p>
      ) : (
        <fieldset
          aria-labelledby={questionId}
          className="flex min-w-0 flex-col gap-2 px-3 pb-3 @sm:px-4 @sm:pb-4"
        >
          {data.options.map((option) => {
            const isRecommended = recommendation?.optionId === option.id;
            const isChosen = decided?.id === option.id;
            return (
              <button
                key={option.id}
                type="button"
                aria-disabled={decided === undefined ? undefined : true}
                onClick={() => decide(option)}
                className={cn(
                  "flex w-full items-start gap-3 rounded-lg border bg-background px-3 py-2.5 text-left outline-offset-2 transition-[background-color,border-color,opacity,scale] duration-150 ease-out focus-visible:outline-2 focus-visible:outline-ring motion-reduce:transition-none",
                  decided === undefined && "hover:bg-accent active:scale-[0.99]",
                  isRecommended && decided === undefined && "border-primary/50",
                  isChosen && "border-primary bg-accent",
                  decided !== undefined && !isChosen && "opacity-50",
                  decided !== undefined && "cursor-default",
                )}
              >
                <span
                  aria-hidden="true"
                  className={cn(
                    "mt-0.5 flex size-4 shrink-0 items-center justify-center rounded-full border",
                    isChosen && "border-primary bg-primary text-primary-foreground",
                  )}
                >
                  {isChosen ? (
                    <svg viewBox="0 0 16 16" fill="none" className="size-3">
                      <path
                        d="M4 8.5 6.5 11 12 5"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  ) : null}
                </span>
                <span className="flex min-w-0 flex-1 flex-col gap-1">
                  <span className="flex flex-wrap items-center gap-x-2 gap-y-1">
                    <span
                      className={cn(
                        "min-w-0 text-sm font-medium wrap-break-word",
                        option.tone === "destructive" && "text-destructive",
                      )}
                    >
                      {option.label}
                    </span>
                    {isRecommended ? (
                      <span className="shrink-0 rounded-full bg-primary px-2 py-0.5 text-xs font-medium text-primary-foreground">
                        Recommended
                      </span>
                    ) : null}
                  </span>
                  {option.description === undefined ? null : (
                    <span className="text-sm text-pretty text-muted-foreground wrap-break-word">
                      {option.description}
                    </span>
                  )}
                  {isRecommended && recommendation?.reason !== undefined ? (
                    <span className="text-xs text-pretty text-muted-foreground wrap-break-word">
                      <span className="font-medium text-foreground">Why: </span>
                      {recommendation.reason}
                    </span>
                  ) : null}
                </span>
              </button>
            );
          })}
        </fieldset>
      )}

      <output
        className={cn(
          "block border-t px-4 py-2.5 text-xs text-muted-foreground @sm:px-5",
          decided === undefined && "sr-only",
        )}
      >
        {decided === undefined ? null : (
          <>
            Sent <span className="font-medium text-foreground">{decided.label}</span> to the agent.
          </>
        )}
      </output>
    </div>
  );
}
