import { DataChart } from "@inlay/blocks/data-chart/data-chart.tsx";
import type { DataChartData } from "@inlay/blocks/data-chart/data.ts";
import typeSource from "@inlay/blocks/data-chart/data.ts?raw";
import { bundle, empty, latency, manyPoints, testTime } from "@inlay/blocks/data-chart/examples.ts";

import type { DemoSample, GalleryBlock } from "./types";

function sample(fields: Omit<DemoSample, "render" | "data"> & { data: DataChartData }): DemoSample {
  return { ...fields, render: () => <DataChart data={fields.data} /> };
}

export const dataChart: GalleryBlock = {
  name: "data-chart",
  title: "Data chart",
  summary: "A line, bar or treemap chart from rows.",
  description:
    "The agent sends rows and picks the chart type. The block draws it with the host’s chart colors and keeps a table view one click away.",
  takes: "Rows plus a chart type",
  seenIn: "T3 Code’s visualization demo",
  callback: null,
  typeSource,
  samples: () => [
    sample({
      id: "line",
      label: "Line",
      prompt: "Did checkout get slower this week?",
      lead: "Only on two days. Both line up with the payments provider’s incident.",
      data: latency,
    }),
    sample({
      id: "bar",
      label: "Bar",
      prompt: "How much did the code split save per route?",
      lead: "Every route got smaller. Billing invoices lost 59%.",
      data: bundle,
    }),
    sample({
      id: "treemap",
      label: "Treemap",
      prompt: "Where does CI spend its time?",
      lead: "Checkout, the search indexer and the web app take half of the test run.",
      data: testTime,
    }),
    sample({
      id: "many",
      label: "120 points",
      prompt: "Show me daily revenue since late June.",
      lead: "Revenue grew about 60% over the period. Weekends dip every week.",
      data: manyPoints,
    }),
    sample({
      id: "empty",
      label: "No rows",
      prompt: "Which referrers brought signups this week?",
      lead: "The analytics query came back empty.",
      data: empty,
    }),
  ],
};
