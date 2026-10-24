import type { AgentQueueData, QueueJob } from "./data";

const SECOND = 1000;
const MINUTE = 60 * SECOND;

function at(now: number, offset: number) {
  return new Date(now - offset).toISOString();
}

export function release(now: number): AgentQueueData {
  return {
    updatedAt: at(now, 0),
    jobs: [
      {
        id: "api-1",
        worker: "Claude · api",
        status: "running",
        title: "Move order handlers to the new logger",
        detail: "services/orders, 14 of 22 files",
        startedAt: at(now, 4 * MINUTE + 12 * SECOND),
      },
      {
        id: "api-2",
        worker: "Claude · api",
        status: "queued",
        title: "Move billing handlers to the new logger",
        queuedAt: at(now, 9 * MINUTE),
      },
      {
        id: "api-3",
        worker: "Claude · api",
        status: "done",
        title: "Add a request id to every log line",
        startedAt: at(now, 19 * MINUTE),
        finishedAt: at(now, 4 * MINUTE + 20 * SECOND),
      },
      {
        id: "web-1",
        worker: "Claude · web",
        status: "running",
        title: "Replace console.log calls in the dashboard",
        detail: "apps/web/src/dashboard",
        startedAt: at(now, 48 * SECOND),
      },
      {
        id: "web-2",
        worker: "Claude · web",
        status: "failed",
        title: "Update the logger mock in Storybook",
        startedAt: at(now, 7 * MINUTE),
        finishedAt: at(now, 6 * MINUTE + 29 * SECOND),
        error: "TypeError: logger.child is not a function (.storybook/preview.tsx:12)",
      },
      {
        id: "web-3",
        worker: "Claude · web",
        status: "done",
        title: "Add the logger package to apps/web",
        startedAt: at(now, 12 * MINUTE),
        finishedAt: at(now, 10 * MINUTE + 54 * SECOND),
      },
      {
        id: "tests-1",
        worker: "Codex · tests",
        status: "queued",
        title: "Run the integration suite against staging",
        queuedAt: at(now, 2 * MINUTE + 5 * SECOND),
      },
      {
        id: "tests-2",
        worker: "Codex · tests",
        status: "queued",
        title: "Snapshot the new log format",
        queuedAt: at(now, 2 * MINUTE + 5 * SECOND),
      },
    ],
  };
}

const packages = [
  "auth",
  "billing",
  "checkout",
  "search",
  "notifications",
  "analytics",
  "web",
  "admin",
  "api-client",
  "design-system",
  "feature-flags",
  "i18n",
  "logger",
  "config",
  "cli",
  "docs",
];

export function many(now: number): AgentQueueData {
  const workers = ["Worker 1", "Worker 2", "Worker 3", "Worker 4"];
  const jobs = packages.map((name, index): QueueJob => {
    const worker = workers[index % workers.length] ?? "Worker 1";
    const base = { worker, title: `Upgrade TypeScript in @acme/${name}` };
    const round = Math.floor(index / workers.length);
    if (round === 3) {
      return {
        ...base,
        id: name,
        status: "running",
        startedAt: at(now, (index + 1) * 37 * SECOND),
      };
    }
    return {
      ...base,
      id: name,
      status: "done",
      startedAt: at(now, (60 - round * 14) * MINUTE + index * SECOND),
      finishedAt: at(now, (48 - round * 14) * MINUTE + index * 3 * SECOND),
    };
  });
  for (let index = 0; index < 22; index += 1) {
    jobs.push({
      id: `lint-${index}`,
      worker: workers[index % workers.length] ?? "Worker 1",
      status: "queued",
      title: `Fix new type errors in @acme/${packages[index % packages.length] ?? "web"} (batch ${Math.floor(index / packages.length) + 1})`,
      queuedAt: at(now, (30 - index) * SECOND),
    });
  }
  return { updatedAt: at(now, 0), jobs };
}

export function longText(now: number): AgentQueueData {
  return {
    updatedAt: at(now, 0),
    jobs: [
      {
        id: "long-1",
        worker: "claude-opus-5-5 · release/2026.11-hotfix-payments-reconciliation · eu-west-1",
        status: "running",
        title:
          "Reconcile every Stripe payout from the last 90 days against the ledger and open a ticket for each mismatch larger than one cent, grouped by merchant account",
        detail:
          "/services/payments/reconciliation/jobs/backfill-stripe-payouts-2026-q3-eu-merchants.ts",
        startedAt: at(now, 2 * 60 * MINUTE + 14 * MINUTE),
      },
      {
        id: "long-2",
        worker: "claude-opus-5-5 · release/2026.11-hotfix-payments-reconciliation · eu-west-1",
        status: "failed",
        title: "Notify bartholomew.fitzgerald@northwind-industries-holdings.example.com",
        startedAt: at(now, 3 * MINUTE),
        finishedAt: at(now, 2 * MINUTE + 58 * SECOND),
        error:
          "SMTPRecipientRejected: 550 5.1.1 <bartholomew.fitzgerald@northwind-industries-holdings.example.com>: Recipient address rejected: User unknown in virtual mailbox table",
      },
      {
        id: "long-3",
        worker: "Jo",
        status: "queued",
        title: "Q",
        queuedAt: at(now, 26 * 60 * MINUTE),
      },
    ],
  };
}

export function finished(now: number): AgentQueueData {
  return {
    updatedAt: at(now, 3 * MINUTE),
    jobs: [
      {
        id: "f-1",
        worker: "Claude · docs",
        status: "done",
        title: "Regenerate the API reference",
        startedAt: at(now, 9 * MINUTE),
        finishedAt: at(now, 6 * MINUTE + 12 * SECOND),
      },
      {
        id: "f-2",
        worker: "Claude · docs",
        status: "done",
        title: "Fix 23 broken links",
        startedAt: at(now, 6 * MINUTE),
        finishedAt: at(now, 3 * MINUTE + 1 * SECOND),
      },
      {
        id: "f-3",
        worker: "Claude · docs",
        status: "failed",
        title: "Deploy the docs preview",
        startedAt: at(now, 3 * MINUTE),
        finishedAt: at(now, 3 * MINUTE - 41 * SECOND),
        error: "Build exceeded the 45 MB output limit",
      },
    ],
  };
}

export function empty(now: number): AgentQueueData {
  return { updatedAt: at(now, 0), jobs: [] };
}
