export type PlanOption = {
  id: string;
  name: string;
  summary?: string;
  pros: string[];
  cons: string[];
  cost: string;
};

export type PlanCompareData = {
  question: string;
  options: PlanOption[];
  recommendation?: {
    optionId: string;
    reason?: string;
  };
};

export type PlanPick = {
  optionId: string;
  name: string;
};
