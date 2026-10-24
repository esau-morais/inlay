import type { DataChartData } from "./data";

const days = [
  "Oct 10",
  "Oct 11",
  "Oct 12",
  "Oct 13",
  "Oct 14",
  "Oct 15",
  "Oct 16",
  "Oct 17",
  "Oct 18",
  "Oct 19",
  "Oct 20",
  "Oct 21",
  "Oct 22",
  "Oct 23",
];
const p50 = [118, 121, 117, 124, 131, 129, 126, 122, 119, 168, 171, 133, 125, 121];
const p95 = [242, 251, 238, 263, 280, 274, 266, 259, 247, 412, 436, 301, 268, 255];

export const latency = {
  type: "line",
  title: "Checkout API latency, last 14 days",
  caption: "p95 doubled on Oct 19 and 20, when the payments provider was degraded.",
  labelKey: "day",
  series: [
    { key: "p50", label: "p50" },
    { key: "p95", label: "p95" },
  ],
  rows: days.map((day, index) => ({ day, p50: p50[index] ?? null, p95: p95[index] ?? null })),
  format: { suffix: " ms" },
} satisfies DataChartData;

export const bundle = {
  type: "bar",
  title: "JavaScript per route, before and after the split",
  caption: "Gzipped size of the first load. Settings pages dropped the most.",
  labelKey: "route",
  series: [
    { key: "before", label: "Before" },
    { key: "after", label: "After" },
  ],
  rows: [
    { route: "/", before: 182.4, after: 141.2 },
    { route: "/dashboard", before: 311.8, after: 204.6 },
    { route: "/settings/billing/invoices/[invoiceId]", before: 402.1, after: 166.3 },
    { route: "/settings/team", before: 268.9, after: 158.7 },
    { route: "/projects/[projectId]/deployments", before: 289.5, after: 231.9 },
    { route: "/login", before: 96.2, after: 88.4 },
  ],
  format: { suffix: " kB", decimals: 1 },
} satisfies DataChartData;

export const testTime = {
  type: "treemap",
  title: "CI test time by package",
  caption: "Last green run on main, 41 min in total. Three packages take half of it.",
  labelKey: "package",
  series: [{ key: "seconds", label: "Time" }],
  rows: [
    { package: "@acme/checkout", seconds: 512 },
    { package: "@acme/search-indexer", seconds: 431 },
    { package: "@acme/web", seconds: 388 },
    { package: "@acme/billing", seconds: 244 },
    { package: "@acme/notifications", seconds: 196 },
    { package: "@acme/auth", seconds: 171 },
    { package: "@acme/design-system", seconds: 143 },
    { package: "@acme/analytics-pipeline-backfill-workers", seconds: 118 },
    { package: "@acme/api-client", seconds: 92 },
    { package: "@acme/feature-flags", seconds: 71 },
    { package: "@acme/i18n", seconds: 44 },
    { package: "@acme/logger", seconds: 31 },
    { package: "@acme/config", seconds: 22 },
    { package: "@acme/eslint-config", seconds: 9 },
    { package: "@acme/tsconfig", seconds: 4 },
  ],
  format: { suffix: "s" },
} satisfies DataChartData;

function revenueRows() {
  const rows = [];
  let value = 18_400;
  for (let day = 0; day < 120; day += 1) {
    const date = new Date(Date.UTC(2026, 5, 26 + day));
    const weekday = date.getUTCDay();
    const weekend = weekday === 0 || weekday === 6 ? 0.86 : 1;
    value = value * 1.004 + ((day * 7919) % 13) * 41 - 240;
    rows.push({
      date: date.toLocaleDateString("en-US", { month: "short", day: "numeric", timeZone: "UTC" }),
      revenue: day === 61 ? null : Math.round(value * weekend),
    });
  }
  return rows;
}

export const manyPoints = {
  type: "line",
  title: "Daily revenue, last 120 days",
  caption: "One day is missing because the export job failed on Aug 26.",
  labelKey: "date",
  series: [{ key: "revenue", label: "Revenue" }],
  rows: revenueRows(),
  format: { prefix: "$" },
} satisfies DataChartData;

export const empty = {
  type: "bar",
  title: "Signups by referrer this week",
  labelKey: "referrer",
  series: [{ key: "signups", label: "Signups" }],
  rows: [],
} satisfies DataChartData;
