export type DiffSeverity = "high" | "medium" | "low";

export type DiffHunk = {
  oldStart: number;
  newStart: number;
  lines: string[];
  note?: string;
};

type DiffFileBase = {
  path: string;
  severity: DiffSeverity;
  note?: string;
  hunks: DiffHunk[];
};

export type DiffFile = DiffFileBase &
  ({ status: "added" | "modified" | "deleted" } | { status: "renamed"; previousPath: string });

export type DiffReviewData = {
  title: string;
  summary?: string;
  files: DiffFile[];
};
