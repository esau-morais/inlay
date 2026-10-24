import { useId, useState, type ReactElement } from "react";

import { cn } from "../lib/utils";
import { useNow } from "./clock";
import type { AgentQueueData, QueueJob } from "./data";
import { between, formatDuration } from "./format";

type AgentQueueProps = {
  data: AgentQueueData;
  className?: string | undefined;
};

type Status = QueueJob["status"];

const statusOrder: Record<Status, number> = { running: 0, failed: 1, queued: 2, done: 3 };
const statusNames: Record<Status, string> = {
  running: "Running",
  queued: "Queued",
  done: "Done",
  failed: "Failed",
};
const VISIBLE_ROWS = 5;

function finishedAt(job: QueueJob) {
  return job.status === "done" || job.status === "failed" ? Date.parse(job.finishedAt) : 0;
}

function sortJobs(jobs: readonly QueueJob[]) {
  return jobs.toSorted(
    (a, b) => statusOrder[a.status] - statusOrder[b.status] || finishedAt(b) - finishedAt(a),
  );
}

function groupByWorker(jobs: readonly QueueJob[]) {
  const groups = new Map<string, QueueJob[]>();
  for (const job of jobs) {
    const group = groups.get(job.worker);
    if (group === undefined) {
      groups.set(job.worker, [job]);
    } else {
      group.push(job);
    }
  }
  return [...groups].map(([worker, items]) => ({ worker, jobs: sortJobs(items) }));
}

function countStatuses(jobs: readonly QueueJob[]) {
  const counts: Record<Status, number> = { running: 0, queued: 0, done: 0, failed: 0 };
  for (const job of jobs) {
    counts[job.status] += 1;
  }
  return counts;
}

function plural(count: number, word: string) {
  return `${count} ${word}${count === 1 ? "" : "s"}`;
}

export function AgentQueue({ data, className }: AgentQueueProps) {
  const counts = countStatuses(data.jobs);
  const live = counts.running + counts.queued > 0;
  const now = useNow(Date.parse(data.updatedAt), live);
  const groups = groupByWorker(data.jobs);
  const total = data.jobs.length;

  return (
    <div
      className={cn(
        "@container w-full max-w-2xl overflow-hidden rounded-xl border bg-card text-card-foreground shadow-xs",
        className,
      )}
    >
      <div className="flex flex-col gap-3 p-4 @sm:px-5">
        <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
          <p className="text-sm font-semibold">Agent queue</p>
          <p className="text-xs text-muted-foreground tabular-nums">
            {total === 0
              ? "No jobs"
              : `${plural(total, "job")} across ${plural(groups.length, "worker")}`}
          </p>
        </div>
        {total === 0 ? null : (
          <>
            <div
              aria-hidden="true"
              className="flex h-1.5 w-full gap-px overflow-hidden rounded-full bg-muted"
            >
              {(["done", "failed", "running"] as const).map((status) =>
                counts[status] === 0 ? null : (
                  <span
                    key={status}
                    className={cn(
                      "h-full",
                      status === "done" && "bg-primary",
                      status === "failed" && "bg-destructive",
                      status === "running" && "bg-primary/40",
                    )}
                    style={{ width: `${(counts[status] / total) * 100}%` }}
                  />
                ),
              )}
            </div>
            <ul className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
              {(["running", "queued", "done", "failed"] as const).map((status) =>
                counts[status] === 0 ? null : (
                  <li key={status} className="flex items-center gap-1.5">
                    <StatusIcon status={status} />
                    <span className="font-medium text-foreground tabular-nums">
                      {counts[status]}
                    </span>
                    {status}
                  </li>
                ),
              )}
            </ul>
          </>
        )}
      </div>

      {total === 0 ? (
        <p className="border-t px-4 py-6 text-center text-sm text-pretty text-muted-foreground @sm:px-5">
          Nothing in the queue. Jobs show up here when the agent starts them.
        </p>
      ) : (
        groups.map((group) => (
          <WorkerGroup key={group.worker} worker={group.worker} jobs={group.jobs} now={now} />
        ))
      )}
    </div>
  );
}

function WorkerGroup({
  worker,
  jobs,
  now,
}: {
  worker: string;
  jobs: readonly QueueJob[];
  now: number;
}) {
  const [expanded, setExpanded] = useState(false);
  const listId = useId();
  const headingId = useId();
  const collapsible = jobs.length > VISIBLE_ROWS + 1;
  const visible = collapsible && !expanded ? jobs.slice(0, VISIBLE_ROWS) : jobs;
  const counts = countStatuses(jobs);
  const hiddenCounts = countStatuses(jobs.slice(VISIBLE_ROWS));
  const hiddenSummary = (["running", "failed", "queued", "done"] as const)
    .filter((status) => hiddenCounts[status] > 0)
    .map((status) => `${hiddenCounts[status]} ${status}`)
    .join(", ");

  return (
    <div className="border-t">
      <div className="flex items-baseline justify-between gap-4 bg-muted/50 px-4 py-2 @sm:px-5">
        <p id={headingId} className="min-w-0 truncate text-xs font-medium" title={worker}>
          {worker}
        </p>
        <p className="shrink-0 text-xs text-muted-foreground tabular-nums">
          {counts.running > 0 ? `${counts.running} running` : plural(jobs.length, "job")}
        </p>
      </div>
      <ul id={listId} aria-labelledby={headingId} className="flex flex-col px-4 @sm:px-5">
        {visible.map((job) => (
          <JobRow key={job.id} job={job} now={now} />
        ))}
      </ul>
      {collapsible ? (
        <div className="px-4 pb-2.5 @sm:px-5">
          <button
            type="button"
            aria-expanded={expanded}
            aria-controls={listId}
            onClick={() => setExpanded((value) => !value)}
            className="-mx-1.5 rounded-md px-1.5 py-1 text-xs font-medium text-muted-foreground transition-colors duration-150 hover:text-foreground focus-visible:outline-2 focus-visible:outline-ring"
          >
            {expanded ? "Show fewer" : `Show ${jobs.length - VISIBLE_ROWS} more (${hiddenSummary})`}
          </button>
        </div>
      ) : null}
    </div>
  );
}

function timing(job: QueueJob, now: number) {
  if (job.status === "running") {
    return { label: "running for", value: formatDuration(between(job.startedAt, now)) };
  }
  if (job.status === "queued") {
    return { label: "waiting", value: `waiting ${formatDuration(between(job.queuedAt, now))}` };
  }
  const took = formatDuration(between(job.startedAt, job.finishedAt));
  return job.status === "done"
    ? { label: "took", value: took }
    : { label: "failed after", value: `after ${took}` };
}

function JobRow({ job, now }: { job: QueueJob; now: number }) {
  const time = timing(job, now);
  return (
    <li className="flex items-start gap-3 border-b py-2.5 last:border-b-0">
      <span className="mt-0.5 flex shrink-0">
        <StatusIcon status={job.status} />
      </span>
      <span className="flex min-w-0 flex-1 flex-col gap-0.5">
        <span
          className={cn(
            "text-sm text-pretty wrap-anywhere",
            job.status === "done" && "text-muted-foreground",
          )}
        >
          <span className="sr-only">{statusNames[job.status]}: </span>
          {job.title}
        </span>
        {job.detail === undefined ? null : (
          <span className="truncate text-xs text-muted-foreground" title={job.detail}>
            {job.detail}
          </span>
        )}
        {job.status === "failed" ? (
          <span
            title={job.error}
            className="line-clamp-3 font-mono text-xs text-destructive wrap-anywhere"
          >
            {job.error}
          </span>
        ) : null}
      </span>
      <span
        className={cn(
          "mt-0.5 shrink-0 text-xs whitespace-nowrap tabular-nums",
          job.status === "running" ? "text-foreground" : "text-muted-foreground",
        )}
      >
        {job.status === "running" || job.status === "done" ? (
          <span className="sr-only">{time.label} </span>
        ) : null}
        {time.value}
      </span>
    </li>
  );
}

const statusIcons: Record<Status, ReactElement> = {
  running: (
    <svg
      viewBox="0 0 16 16"
      fill="none"
      aria-hidden="true"
      className="size-4 animate-spin text-primary motion-reduce:animate-none"
    >
      <circle cx="8" cy="8" r="6" stroke="currentColor" strokeOpacity="0.25" strokeWidth="2" />
      <path d="M14 8a6 6 0 0 0-6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  ),
  queued: (
    <svg
      viewBox="0 0 16 16"
      fill="none"
      aria-hidden="true"
      className="size-4 text-muted-foreground"
    >
      <circle
        cx="8"
        cy="8"
        r="5.5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeDasharray="2.5 2.5"
      />
    </svg>
  ),
  done: (
    <svg viewBox="0 0 16 16" fill="none" aria-hidden="true" className="size-4 text-primary">
      <circle cx="8" cy="8" r="7" fill="currentColor" />
      <path
        d="m5 8.25 2 2 4-4.5"
        className="stroke-primary-foreground"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  ),
  failed: (
    <svg viewBox="0 0 16 16" fill="none" aria-hidden="true" className="size-4 text-destructive">
      <circle cx="8" cy="8" r="6.25" stroke="currentColor" strokeWidth="1.5" />
      <path d="m6 6 4 4m0-4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  ),
};

function StatusIcon({ status }: { status: Status }) {
  return statusIcons[status];
}
