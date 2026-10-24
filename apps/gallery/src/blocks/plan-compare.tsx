import type { PlanCompareData } from "@inlay/blocks/plan-compare/data.ts";
import typeSource from "@inlay/blocks/plan-compare/data.ts?raw";
import {
  fourPlans,
  longText,
  noOptions,
  search,
  twoPlans,
} from "@inlay/blocks/plan-compare/examples.ts";
import { PlanCompare } from "@inlay/blocks/plan-compare/plan-compare.tsx";

import type { DemoEvent, DemoSample, GalleryBlock } from "./types";

function sample(
  fields: Omit<DemoSample, "render" | "data"> & { data: PlanCompareData },
): DemoSample {
  return {
    ...fields,
    render: (onEvent: (event: DemoEvent) => void) => (
      <PlanCompare
        data={fields.data}
        onPick={(pick) =>
          onEvent({ callback: "onPick", payload: pick, reply: `Go with ${pick.name}.` })
        }
      />
    ),
  };
}

export const planCompare: GalleryBlock = {
  name: "plan-compare",
  title: "Plan compare",
  summary: "Two to four options side by side, to pick one.",
  description:
    "Instead of four paragraphs of trade-offs, the agent lays its options out in columns with pros, cons and cost on the same rows. Picking one tells the agent which way to go.",
  takes: "Options with pros, cons and cost",
  seenIn: "Theo’s “several options in one HTML grid”",
  callback: "onPick",
  typeSource,
  samples: () => [
    sample({
      id: "typical",
      label: "Three plans",
      prompt: "Add search to the help center.",
      lead: "There are three reasonable ways to do this. They differ mostly in cost.",
      data: search,
    }),
    sample({
      id: "two",
      label: "Two plans",
      prompt: "The checkout e2e test is flaky again.",
      lead: "I found the cause. Fixing it takes a few hours, so here are both paths.",
      data: twoPlans,
    }),
    sample({
      id: "four",
      label: "Four plans",
      prompt: "We need file uploads for avatars and attachments.",
      lead: "Four options, from what we already pay for to something new.",
      data: fourPlans,
    }),
    sample({
      id: "long",
      label: "Long text",
      prompt: "The audit table is 60% of the database. Can we archive it?",
      lead: "Yes, but legal’s quarterly export reads it, so the plan has to keep that working.",
      data: longText,
    }),
    sample({
      id: "empty",
      label: "No plans",
      prompt: "Plan the iOS release.",
      lead: "I need the release date before I can suggest plans.",
      data: noOptions,
    }),
  ],
};
