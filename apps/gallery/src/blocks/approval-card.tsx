import { ApprovalCard } from "@inlay/blocks/approval-card/approval-card.tsx";
import type { ApprovalCardData } from "@inlay/blocks/approval-card/data.ts";
import typeSource from "@inlay/blocks/approval-card/data.ts?raw";
import {
  longText,
  migration,
  noOptions,
  twoOptions,
} from "@inlay/blocks/approval-card/examples.ts";

import type { DemoEvent, DemoSample, GalleryBlock } from "./types";

function sample(
  fields: Omit<DemoSample, "render" | "data"> & { data: ApprovalCardData },
): DemoSample {
  return {
    ...fields,
    render: (onEvent: (event: DemoEvent) => void) => (
      <ApprovalCard
        data={fields.data}
        onDecide={(choice) =>
          onEvent({ callback: "onDecide", payload: choice, reply: choice.label })
        }
      />
    ),
  };
}

export const approvalCard: GalleryBlock = {
  name: "approval-card",
  title: "Approval card",
  summary: "A decision the agent needs, with options and a recommended one.",
  description:
    "The agent stops and asks. The card shows the question, the options and the one the agent recommends, and your pick goes back to the agent as the next message.",
  takes: "Question, options, recommendation",
  seenIn: "octomux’s permission inbox, Claude Code Agent View",
  callback: "onDecide",
  typeSource,
  samples: () => [
    sample({
      id: "typical",
      label: "Typical",
      prompt: "Add a timezone column to users and backfill it from the billing address.",
      lead: "The migration is ready. Staging locked writes for 3 seconds, so I need your call before I run it on production.",
      data: migration,
    }),
    sample({
      id: "long",
      label: "Long text",
      prompt: "The Stripe key leaked in a commit. Clean it up.",
      lead: "The key is rotated. Removing it from history means rewriting a shared branch.",
      data: longText,
    }),
    sample({
      id: "two",
      label: "Two options",
      prompt: "Clean up old preview deployments.",
      lead: "Three previews have had no traffic for 30 days.",
      data: twoOptions,
    }),
    sample({
      id: "empty",
      label: "No options",
      prompt: "Set up the database for the new service.",
      lead: "I’m stuck on one thing.",
      data: noOptions,
    }),
  ],
};
