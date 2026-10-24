import type { DiffFile, DiffReviewData } from "./data";

export const rateLimit = {
  title: "Add rate limiting to the export API",
  summary:
    "Exports are limited to 10 per minute per workspace, counted in Redis. Two spots need your eyes: the key format and what happens when Redis is down.",
  files: [
    {
      path: "apps/api/src/middleware/rate-limit.ts",
      status: "added",
      severity: "high",
      note: "If Redis is unreachable the middleware lets the request through. I chose that over failing closed so an outage does not block every export.",
      hunks: [
        {
          oldStart: 0,
          newStart: 1,
          lines: [
            '+import type { Context, Next } from "hono";',
            '+import { redis } from "../redis";',
            "+",
            "+const WINDOW_SECONDS = 60;",
            "+",
            "+export function rateLimit(limit: number) {",
            "+  return async (c: Context, next: Next) => {",
            '+    const key = `rl:${c.get("workspaceId")}:${Math.floor(Date.now() / 60_000)}`;',
            "+    const count = await redis.incr(key).catch(() => null);",
            "+    if (count === null) return next();",
            "+    if (count === 1) await redis.expire(key, WINDOW_SECONDS);",
            '+    if (count > limit) return c.json({ error: "rate_limited" }, 429);',
            "+    return next();",
            "+  };",
            "+}",
          ],
          note: "The key uses the workspace id, not the user id, so one busy user can use up the limit for their whole team.",
        },
      ],
    },
    {
      path: "apps/api/src/routes/export.ts",
      status: "modified",
      severity: "high",
      hunks: [
        {
          oldStart: 12,
          newStart: 12,
          lines: [
            ' import { requireWorkspace } from "../middleware/auth";',
            '+import { rateLimit } from "../middleware/rate-limit";',
            " ",
            " export const exportRoute = new Hono()",
            '-  .post("/", requireWorkspace, async (c) => {',
            '+  .post("/", requireWorkspace, rateLimit(10), async (c) => {',
            "     const body = exportSchema.parse(await c.req.json());",
          ],
        },
      ],
    },
    {
      path: "packages/config/src/limits.ts",
      status: "modified",
      severity: "medium",
      note: "The limit is a constant for now. It moves to plan settings when billing ships tiers.",
      hunks: [
        {
          oldStart: 4,
          newStart: 4,
          lines: [" export const MAX_UPLOAD_MB = 250;", "+export const EXPORTS_PER_MINUTE = 10;"],
        },
      ],
    },
    {
      path: "apps/api/src/middleware/rate-limit.test.ts",
      status: "added",
      severity: "low",
      hunks: [
        {
          oldStart: 0,
          newStart: 1,
          lines: [
            '+import { describe, expect, it } from "vitest";',
            "+",
            '+describe("rateLimit", () => {',
            '+  it("returns 429 after the limit", async () => {',
            "+    const app = testApp(rateLimit(2));",
            '+    await app.request("/");',
            '+    await app.request("/");',
            '+    expect((await app.request("/")).status).toBe(429);',
            "+  });",
            "+});",
          ],
        },
      ],
    },
    {
      path: "docs/api/exports.md",
      previousPath: "docs/api/export.md",
      status: "renamed",
      severity: "low",
      hunks: [
        {
          oldStart: 18,
          newStart: 18,
          lines: [
            " ## Limits",
            " ",
            "-There is no rate limit.",
            "+Each workspace can start 10 exports per minute. Extra requests get a 429.",
          ],
        },
      ],
    },
    {
      path: "apps/api/src/legacy/export-v1.ts",
      status: "deleted",
      severity: "low",
      note: "Nothing imports this since the v2 route shipped in August.",
      hunks: [],
    },
  ],
} satisfies DiffReviewData;

export const longText = {
  title:
    "Rewrite the payments reconciliation job so it streams Stripe payouts instead of loading the whole quarter into memory",
  summary:
    "The job ran out of memory on the EU cluster for merchants with more than 400,000 payouts. It now pages through the Stripe API 100 records at a time.",
  files: [
    {
      path: "services/payments/reconciliation/src/jobs/backfill/stripe/eu-merchants/reconcile-payouts-against-ledger-entries.ts",
      status: "modified",
      severity: "high",
      note: "Each page is written in its own transaction, so a crash halfway leaves the earlier pages reconciled. Rerunning the job skips them.",
      hunks: [
        {
          oldStart: 9840,
          newStart: 9840,
          lines: [
            "-  const payouts = await stripe.payouts.list({ limit: 100000, created: { gte: quarterStart, lte: quarterEnd } }).autoPagingToArray({ limit: 100000 });",
            "+  for await (const page of paginate(stripe.payouts.list, { limit: 100, created: { gte: quarterStart, lte: quarterEnd } })) {",
            "+    await db.transaction((tx) => reconcilePage(tx, page, { merchantAccountId, toleranceInCents: 1 }));",
            "+  }",
          ],
        },
      ],
    },
    {
      path: "services/payments/reconciliation/src/jobs/backfill/stripe/eu-merchants/reconcile-payouts-against-ledger-entries.test.ts",
      previousPath:
        "services/payments/reconciliation/src/jobs/backfill/stripe/eu-merchants/reconcile.test.ts",
      status: "renamed",
      severity: "low",
      hunks: [],
    },
    {
      path: "README.md",
      status: "modified",
      severity: "medium",
      hunks: [
        {
          oldStart: 1,
          newStart: 1,
          lines: ["-# Reconciliation", "+# Payments reconciliation"],
        },
      ],
    },
  ],
} satisfies DiffReviewData;

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

export const many = {
  title: "Upgrade TypeScript to 7.0 across the monorepo",
  summary: "Most changes are mechanical. Two packages relied on behavior the new compiler removed.",
  files: [
    {
      path: "packages/checkout/src/totals.ts",
      status: "modified",
      severity: "high",
      note: "The old code relied on an implicit any from Object.entries. The explicit type found a real bug: tax was summed as a string.",
      hunks: [
        {
          oldStart: 31,
          newStart: 31,
          lines: [
            "-  const tax = Object.entries(lines).reduce((sum, [, line]) => sum + line.tax, 0);",
            "+  const tax = Object.values(lines).reduce((sum, line) => sum + Number(line.tax), 0);",
          ],
        },
      ],
    },
    {
      path: "packages/search/src/indexer/batch.ts",
      status: "modified",
      severity: "medium",
      hunks: [
        {
          oldStart: 88,
          newStart: 88,
          lines: ["-  // @ts-expect-error old lib types", "   await queue.addBulk(jobs);"],
        },
      ],
    },
    ...packages.flatMap((name): DiffFile[] => [
      {
        path: `packages/${name}/tsconfig.json`,
        status: "modified",
        severity: "low",
        hunks: [
          {
            oldStart: 3,
            newStart: 3,
            lines: ['-    "moduleResolution": "node",', '+    "moduleResolution": "bundler",'],
          },
        ],
      },
      {
        path: `packages/${name}/package.json`,
        status: "modified",
        severity: "low",
        hunks: [
          {
            oldStart: 22,
            newStart: 22,
            lines: ['-    "typescript": "^5.9.3"', '+    "typescript": "^7.0.2"'],
          },
        ],
      },
    ]),
  ],
} satisfies DiffReviewData;

export const empty = {
  title: "Review the changes on fix/login-redirect",
  summary: "The branch has no commits ahead of main.",
  files: [],
} satisfies DiffReviewData;
