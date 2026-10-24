type JobBase = {
  id: string;
  title: string;
  worker: string;
  detail?: string;
};

export type QueuedJob = JobBase & {
  status: "queued";
  queuedAt: string;
};

export type RunningJob = JobBase & {
  status: "running";
  startedAt: string;
};

export type DoneJob = JobBase & {
  status: "done";
  startedAt: string;
  finishedAt: string;
};

export type FailedJob = JobBase & {
  status: "failed";
  startedAt: string;
  finishedAt: string;
  error: string;
};

export type QueueJob = QueuedJob | RunningJob | DoneJob | FailedJob;

export type AgentQueueData = {
  updatedAt: string;
  jobs: QueueJob[];
};
