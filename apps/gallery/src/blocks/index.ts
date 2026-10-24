import { agentQueue } from "./agent-queue";
import { approvalCard } from "./approval-card";
import { dataChart } from "./data-chart";
import { diffReview } from "./diff-review";
import { planCompare } from "./plan-compare";
import type { GalleryBlock } from "./types";

export const galleryBlocks: readonly GalleryBlock[] = [
  approvalCard,
  agentQueue,
  diffReview,
  planCompare,
  dataChart,
];

export function findBlock(name: string) {
  const index = galleryBlocks.findIndex((block) => block.name === name);
  const block = galleryBlocks[index];
  if (block === undefined) {
    return undefined;
  }
  return { block, previous: galleryBlocks[index - 1], next: galleryBlocks[index + 1] };
}
