import { useId, useState } from "react";

import { cn } from "../lib/utils";
import type { DiffFile, DiffHunk, DiffReviewData, DiffSeverity } from "./data";

type DiffReviewProps = {
  data: DiffReviewData;
  className?: string | undefined;
};

const severities: readonly { severity: DiffSeverity; label: string }[] = [
  { severity: "high", label: "Needs a close look" },
  { severity: "medium", label: "Worth a look" },
  { severity: "low", label: "Routine" },
];

const statusLetters: Record<DiffFile["status"], string> = {
  added: "A",
  modified: "M",
  deleted: "D",
  renamed: "R",
};

const numberFormat = new Intl.NumberFormat("en-US");
const VISIBLE_FILES = 6;

function countLines(hunks: readonly DiffHunk[]) {
  let additions = 0;
  let deletions = 0;
  for (const hunk of hunks) {
    for (const line of hunk.lines) {
      if (line.startsWith("+")) additions += 1;
      else if (line.startsWith("-")) deletions += 1;
    }
  }
  return { additions, deletions };
}

function plural(count: number, word: string) {
  return `${numberFormat.format(count)} ${word}${count === 1 ? "" : "s"}`;
}

export function DiffReview({ data, className }: DiffReviewProps) {
  const totals = countLines(data.files.flatMap((file) => file.hunks));

  return (
    <div
      className={cn(
        "@container w-full max-w-2xl overflow-hidden rounded-xl border bg-card text-card-foreground shadow-xs",
        className,
      )}
    >
      <div className="flex flex-col gap-1.5 p-4 @sm:px-5">
        <p className="text-xs font-medium text-muted-foreground">Review</p>
        <p className="text-base font-semibold text-balance wrap-break-word">{data.title}</p>
        {data.summary === undefined ? null : (
          <p className="text-sm text-pretty text-muted-foreground wrap-break-word">
            {data.summary}
          </p>
        )}
        {data.files.length === 0 ? null : (
          <p className="mt-1 flex flex-wrap gap-x-3 text-xs text-muted-foreground tabular-nums">
            <span>{plural(data.files.length, "file")}</span>
            <Counts {...totals} />
          </p>
        )}
      </div>

      {data.files.length === 0 ? (
        <p className="border-t px-4 py-6 text-center text-sm text-pretty text-muted-foreground @sm:px-5">
          No changed files to review.
        </p>
      ) : (
        severities.map(({ severity, label }) => {
          const files = data.files.filter((file) => file.severity === severity);
          return files.length === 0 ? null : (
            <SeverityGroup key={severity} severity={severity} label={label} files={files} />
          );
        })
      )}
    </div>
  );
}

function Counts({ additions, deletions }: { additions: number; deletions: number }) {
  return (
    <span className="flex shrink-0 gap-1.5 font-mono text-xs tabular-nums">
      <span className={additions === 0 ? "text-muted-foreground" : "text-primary"}>
        +{numberFormat.format(additions)}
        <span className="sr-only"> added</span>
      </span>
      <span className={deletions === 0 ? "text-muted-foreground" : "text-destructive"}>
        −{numberFormat.format(deletions)}
        <span className="sr-only"> removed</span>
      </span>
    </span>
  );
}

function SeverityGroup({
  severity,
  label,
  files,
}: {
  severity: DiffSeverity;
  label: string;
  files: readonly DiffFile[];
}) {
  const headingId = useId();
  const listId = useId();
  const [expanded, setExpanded] = useState(false);
  const collapsible = files.length > VISIBLE_FILES + 2;
  const visible = collapsible && !expanded ? files.slice(0, VISIBLE_FILES) : files;
  return (
    <div className="border-t">
      <div className="flex items-center justify-between gap-4 bg-muted/50 px-4 py-2 @sm:px-5">
        <p id={headingId} className="flex items-center gap-2 text-xs font-medium">
          <SeverityBars severity={severity} />
          {label}
        </p>
        <p className="text-xs text-muted-foreground tabular-nums">{plural(files.length, "file")}</p>
      </div>
      <ul id={listId} aria-labelledby={headingId}>
        {visible.map((file) => (
          <li key={file.path} className="border-t first:border-t-0">
            <FileDiff file={file} />
          </li>
        ))}
      </ul>
      {collapsible ? (
        <div className="border-t px-4 py-2 @sm:px-5">
          <button
            type="button"
            aria-expanded={expanded}
            aria-controls={listId}
            onClick={() => setExpanded((value) => !value)}
            className="-mx-1.5 rounded-md px-1.5 py-1 text-xs font-medium text-muted-foreground transition-colors duration-150 hover:text-foreground focus-visible:outline-2 focus-visible:outline-ring"
          >
            {expanded ? "Show fewer" : `Show ${files.length - VISIBLE_FILES} more files`}
          </button>
        </div>
      ) : null}
    </div>
  );
}

function SeverityBars({ severity }: { severity: DiffSeverity }) {
  const filled = severity === "high" ? 3 : severity === "medium" ? 2 : 1;
  return (
    <svg viewBox="0 0 12 12" aria-hidden="true" className="size-3 shrink-0">
      {[0, 1, 2].map((bar) => (
        <rect
          key={bar}
          x={bar * 4.5}
          y={8 - bar * 3}
          width="3"
          height={4 + bar * 3}
          rx="1"
          className={
            bar < filled
              ? severity === "high"
                ? "fill-destructive"
                : "fill-foreground"
              : "fill-muted-foreground/30"
          }
        />
      ))}
    </svg>
  );
}

function FileDiff({ file }: { file: DiffFile }) {
  const counts = countLines(file.hunks);
  return (
    <details open={file.severity === "high"} className="group/file">
      <summary className="flex cursor-pointer list-none items-center gap-2.5 px-4 py-2.5 transition-colors duration-150 outline-none hover:bg-muted/40 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ring @sm:px-5 [&::-webkit-details-marker]:hidden">
        <svg
          viewBox="0 0 16 16"
          fill="none"
          aria-hidden="true"
          className="size-3.5 shrink-0 text-muted-foreground transition-transform duration-150 ease-out group-open/file:rotate-90 motion-reduce:transition-none"
        >
          <path
            d="m6 4 4 4-4 4"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        <span
          aria-hidden="true"
          className={cn(
            "flex size-5 shrink-0 items-center justify-center rounded border font-mono text-[11px] font-medium",
            file.status === "added" && "border-primary/40 text-primary",
            file.status === "deleted" && "border-destructive/40 text-destructive",
            (file.status === "modified" || file.status === "renamed") && "text-muted-foreground",
          )}
        >
          {statusLetters[file.status]}
        </span>
        <span className="sr-only">{file.status}: </span>
        <FilePath path={file.path} />
        <Counts {...counts} />
      </summary>
      <div className="flex flex-col gap-3 px-4 pb-4 @sm:px-5">
        {file.status === "renamed" ? (
          <p className="text-xs text-muted-foreground wrap-anywhere">
            Renamed from <span className="font-mono">{file.previousPath}</span>
          </p>
        ) : null}
        {file.note === undefined ? null : (
          <p className="rounded-md bg-muted px-3 py-2 text-sm text-pretty wrap-break-word">
            {file.note}
          </p>
        )}
        {file.hunks.length === 0 ? (
          <p className="text-xs text-muted-foreground">No line changes to show.</p>
        ) : (
          file.hunks.map((hunk) => (
            <Hunk key={`${hunk.oldStart}:${hunk.newStart}`} hunk={hunk} path={file.path} />
          ))
        )}
      </div>
    </details>
  );
}

function FilePath({ path }: { path: string }) {
  const slash = path.lastIndexOf("/");
  const directory = path.slice(0, slash + 1);
  const name = path.slice(slash + 1);
  return (
    <span className="flex min-w-0 flex-1 font-mono text-[13px]" title={path}>
      {directory === "" ? null : (
        <span className="truncate text-muted-foreground">{directory}</span>
      )}
      <span className="max-w-full shrink-0 truncate">{name}</span>
    </span>
  );
}

type NumberedLine = {
  kind: "add" | "remove" | "context";
  text: string;
  oldNumber: number | null;
  newNumber: number | null;
};

function numberLines(hunk: DiffHunk) {
  let oldNumber = hunk.oldStart;
  let newNumber = hunk.newStart;
  return hunk.lines.map((line): NumberedLine => {
    const text = line.slice(1);
    if (line.startsWith("+")) {
      return { kind: "add", text, oldNumber: null, newNumber: newNumber++ };
    }
    if (line.startsWith("-")) {
      return { kind: "remove", text, oldNumber: oldNumber++, newNumber: null };
    }
    return { kind: "context", text, oldNumber: oldNumber++, newNumber: newNumber++ };
  });
}

function Hunk({ hunk, path }: { hunk: DiffHunk; path: string }) {
  const lines = numberLines(hunk);
  const oldCount = lines.filter((line) => line.kind !== "add").length;
  const newCount = lines.filter((line) => line.kind !== "remove").length;
  const header = `@@ -${hunk.oldStart},${oldCount} +${hunk.newStart},${newCount} @@`;
  const gutter = `${String(Math.max(hunk.oldStart + oldCount, hunk.newStart + newCount)).length + 2}ch`;

  return (
    <div className="overflow-hidden rounded-md border">
      <p className="border-b bg-muted/50 px-3 py-1 font-mono text-xs text-muted-foreground">
        {header}
      </p>
      <section
        aria-label={`${path}, lines from ${hunk.newStart}`}
        tabIndex={0}
        className="overflow-x-auto outline-none focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ring"
      >
        <div className="inline-block min-w-full py-1 font-mono text-xs leading-5">
          {lines.map((line) => (
            <div
              key={`${line.oldNumber ?? ""}:${line.newNumber ?? ""}`}
              className={cn(
                "flex",
                line.kind === "add" && "bg-primary/10",
                line.kind === "remove" && "bg-destructive/10",
              )}
            >
              <span
                aria-hidden="true"
                className="shrink-0 pr-2 text-right text-muted-foreground/70 select-none tabular-nums"
                style={{ width: gutter }}
              >
                {line.oldNumber}
              </span>
              <span
                aria-hidden="true"
                className="shrink-0 pr-2 text-right text-muted-foreground/70 select-none tabular-nums"
                style={{ width: gutter }}
              >
                {line.newNumber}
              </span>
              <span
                className={cn(
                  "w-5 shrink-0 text-center select-none",
                  line.kind === "add" && "text-primary",
                  line.kind === "remove" && "text-destructive",
                )}
              >
                <span aria-hidden="true">
                  {line.kind === "add" ? "+" : line.kind === "remove" ? "−" : " "}
                </span>
                {line.kind === "context" ? null : (
                  <span className="sr-only">{line.kind === "add" ? "Added: " : "Removed: "}</span>
                )}
              </span>
              <span className="pr-4 whitespace-pre">{line.text}</span>
            </div>
          ))}
        </div>
      </section>
      {hunk.note === undefined ? null : (
        <p className="border-t px-3 py-2 text-sm text-pretty wrap-break-word">
          <span className="font-medium">Note: </span>
          <span className="text-muted-foreground">{hunk.note}</span>
        </p>
      )}
    </div>
  );
}
