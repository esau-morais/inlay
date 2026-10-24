import type { DiffReviewData } from "@inlay/blocks/diff-review/data.ts";
import typeSource from "@inlay/blocks/diff-review/data.ts?raw";
import { DiffReview } from "@inlay/blocks/diff-review/diff-review.tsx";
import { empty, longText, many, rateLimit } from "@inlay/blocks/diff-review/examples.ts";

import type { DemoSample, GalleryBlock } from "./types";

function sample(
  fields: Omit<DemoSample, "render" | "data"> & { data: DiffReviewData },
): DemoSample {
  return { ...fields, render: () => <DiffReview data={fields.data} /> };
}

export const diffReview: GalleryBlock = {
  name: "diff-review",
  title: "Diff review",
  summary: "Changed files grouped by importance, with notes.",
  description:
    "The agent sorts its own changes by how much they need you. Risky files open first with the agent’s notes, and routine ones wait folded at the bottom.",
  takes: "Files, hunks, severity, notes",
  seenIn: "Theo’s HTML PR reviews",
  callback: null,
  typeSource,
  samples: () => [
    sample({
      id: "typical",
      label: "Typical",
      prompt: "Rate limit the export endpoint, 10 per minute.",
      lead: "Done. Here is what changed, sorted by how much it needs a review.",
      data: rateLimit,
    }),
    sample({
      id: "many",
      label: "34 files",
      prompt: "Upgrade TypeScript everywhere.",
      lead: "34 files changed. Only two need a real look.",
      data: many,
    }),
    sample({
      id: "long",
      label: "Long paths",
      prompt: "The reconciliation job keeps running out of memory. Fix it.",
      lead: "It streams now. The main change is in one file.",
      data: longText,
    }),
    sample({
      id: "empty",
      label: "No changes",
      prompt: "Review fix/login-redirect for me.",
      lead: "There is nothing to review yet.",
      data: empty,
    }),
  ],
};
