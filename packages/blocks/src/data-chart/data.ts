export type ChartSeries = {
  key: string;
  label: string;
};

export type ChartRow = Record<string, string | number | null>;

export type DataChartData = {
  type: "line" | "bar" | "treemap";
  title?: string;
  caption?: string;
  labelKey: string;
  series: ChartSeries[];
  rows: ChartRow[];
  format?: {
    prefix?: string;
    suffix?: string;
    decimals?: number;
  };
};
