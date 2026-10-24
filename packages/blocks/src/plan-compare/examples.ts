import type { PlanCompareData } from "./data";

export const search = {
  question: "How should we add search to the help center?",
  options: [
    {
      id: "postgres",
      name: "Postgres full-text search",
      summary: "A tsvector column on articles with a GIN index.",
      pros: ["No new service to run", "Results respect row-level security for free"],
      cons: ["No typo tolerance", "Ranking needs hand tuning"],
      cost: "$0 a month, about 2 days",
    },
    {
      id: "meilisearch",
      name: "Meilisearch, self-hosted",
      summary: "One container next to the API, synced from a queue.",
      pros: ["Typo tolerance and good ranking out of the box", "Open source, no per-search fees"],
      cons: ["One more service to deploy and back up", "Permissions must be copied into the index"],
      cost: "About $40 a month, about 4 days",
    },
    {
      id: "algolia",
      name: "Algolia",
      summary: "Hosted index with their React widgets.",
      pros: ["Fastest to ship", "Analytics included"],
      cons: ["Price grows with every search", "Article text leaves our infrastructure"],
      cost: "About $1,100 a month at current traffic, 1 day",
    },
  ],
  recommendation: {
    optionId: "postgres",
    reason:
      "The help center has 1,900 articles. Postgres handles that easily and adds nothing to run.",
  },
} satisfies PlanCompareData;

export const twoPlans = {
  question: "The checkout test fails 1 run in 20. What should I do?",
  options: [
    {
      id: "fix",
      name: "Fix the race",
      pros: ["Fixes the cause: the cart loads after the click"],
      cons: ["Touches the cart store, which has no other tests"],
      cost: "About 3 hours",
    },
    {
      id: "quarantine",
      name: "Quarantine the test",
      pros: ["CI is green again in 5 minutes"],
      cons: ["Checkout loses its only end-to-end test until someone comes back to it"],
      cost: "5 minutes now, the fix later",
    },
  ],
  recommendation: { optionId: "fix" },
} satisfies PlanCompareData;

export const fourPlans = {
  question: "Where should user uploads go?",
  options: [
    {
      id: "s3",
      name: "Amazon S3",
      pros: ["We already use AWS for backups", "Mature lifecycle rules"],
      cons: ["Egress fees on every download"],
      cost: "$23/TB + egress",
    },
    {
      id: "r2",
      name: "Cloudflare R2",
      pros: ["No egress fees", "S3-compatible API"],
      cons: ["New vendor to manage"],
      cost: "$15/TB",
    },
    {
      id: "uploadthing",
      name: "UploadThing",
      pros: ["Drop-in React components"],
      cons: ["Locked to their API", "Smaller company"],
      cost: "$25/mo for 250 GB",
    },
    {
      id: "postgres",
      name: "Postgres bytea",
      pros: ["Nothing new"],
      cons: ["Backups balloon", "Slow for files over a few MB"],
      cost: "Database storage",
    },
  ],
  recommendation: {
    optionId: "r2",
    reason: "Most uploads are images we serve back to users, so egress is the main cost.",
  },
} satisfies PlanCompareData;

export const longText = {
  question:
    "How do we move 14 million rows of audit history from the primary database to cold storage without breaking compliance exports that legal runs every quarter?",
  options: [
    {
      id: "partition",
      name: "Partition audit_events by month and detach partitions older than 13 months to a separate read-only database",
      summary:
        "Exports query a view that unions the live table and the archive database through postgres_fdw.",
      pros: [
        "Exports keep working without changes, because the view has the same columns as today",
        "Detaching a partition is instant and needs no long-running delete",
        "Archive database can run on cheaper storage",
        "Rollback is reattaching the partition",
      ],
      cons: [
        "postgres_fdw adds a moving part that the on-call rotation has never debugged",
        "Primary keys need to include created_at, which changes 6 foreign keys",
      ],
      cost: "About 2 weeks, plus roughly $90 a month for the archive instance",
    },
    {
      id: "export",
      name: "Nightly Parquet export to S3",
      pros: ["Cheapest storage", "Legal can query it with Athena"],
      cons: [],
      cost: "4 days, under $5 a month",
    },
  ],
  recommendation: {
    optionId: "partition",
    reason:
      "Legal's export scripts query the database directly. Changing where the data lives is cheaper than changing every script they own.",
  },
} satisfies PlanCompareData;

export const noOptions = {
  question: "Which plan should we take for the iOS release?",
  options: [],
} satisfies PlanCompareData;
