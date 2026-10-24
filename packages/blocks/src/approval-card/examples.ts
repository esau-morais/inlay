import type { ApprovalCardData } from "./data";

export const migration = {
  question: "Run the users table migration on production now?",
  context:
    "It adds a non-null column with a default to 2.4M rows. Staging took 41 seconds and locked writes for about 3 of them.",
  options: [
    {
      id: "run-batched",
      label: "Run it in batches of 50,000",
      description: "About 4 minutes, no write lock longer than 200 ms.",
    },
    {
      id: "run-now",
      label: "Run it in one transaction",
      description: "Fastest, but writes to users block for a few seconds.",
    },
    {
      id: "wait",
      label: "Wait for the 02:00 maintenance window",
    },
    {
      id: "cancel",
      label: "Cancel the migration",
      tone: "destructive",
    },
  ],
  recommendation: {
    optionId: "run-batched",
    reason: "Checkout writes to users on every order, and batches keep each lock short.",
  },
} satisfies ApprovalCardData;

export const longText = {
  question:
    "Force-push the rewritten history to origin/release/2026.11-hotfix-payments-reconciliation and close the 14 open pull requests that branch from it?",
  context:
    "Rewriting removes the leaked key in commit 9f3ac21 from every branch. Anyone with a local clone of release/2026.11-hotfix-payments-reconciliation has to reset to the new history, including bartholomew.fitzgerald@northwind-industries-holdings.example.com, who has unpushed work.",
  options: [
    {
      id: "push-and-close",
      label:
        "Force-push and close all 14 pull requests with a comment that links the rotation runbook",
      description:
        "The key is already rotated, so this only removes it from history. Contributors re-open their pull requests against the new base.",
    },
    {
      id: "push-keep",
      label: "Force-push but leave the pull requests open",
      description: "Each pull request will show a conflict until its author rebases.",
    },
    {
      id: "rotate-only",
      label: "Keep history as is",
      description:
        "Rely on the rotation alone. The old key stays readable in git log at /services/payments/reconciliation/config/providers/stripe.production.yaml.",
      tone: "destructive",
    },
  ],
  recommendation: {
    optionId: "push-and-close",
    reason:
      "GitHub keeps closed pull requests readable, and leaving them open invites merges of the old history.",
  },
} satisfies ApprovalCardData;

export const twoOptions = {
  question: "Delete 3 stale preview deployments?",
  options: [
    { id: "delete", label: "Delete them", tone: "destructive" },
    { id: "keep", label: "Keep them" },
  ],
} satisfies ApprovalCardData;

export const noOptions = {
  question: "Which region should the new database live in?",
  context: "I could not find a region in the infra config or the README.",
  options: [],
} satisfies ApprovalCardData;
