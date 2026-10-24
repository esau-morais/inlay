import type { ReactNode } from "react";

export const blockNames = [
  "approval-card",
  "agent-queue",
  "diff-review",
  "plan-compare",
  "data-chart",
] as const;

export type BlockName = (typeof blockNames)[number];

export type DemoEvent = {
  callback: string;
  payload: unknown;
  reply: string;
};

export type DemoSample = {
  id: string;
  label: string;
  prompt: string;
  lead: string;
  data: unknown;
  render: (onEvent: (event: DemoEvent) => void) => ReactNode;
};

export type GalleryBlock = {
  name: BlockName;
  title: string;
  summary: string;
  description: string;
  takes: string;
  seenIn: string;
  callback: string | null;
  typeSource: string;
  samples: (now: number) => [DemoSample, ...DemoSample[]];
};
