export type ApprovalOption = {
  id: string;
  label: string;
  description?: string;
  tone?: "default" | "destructive";
};

export type ApprovalCardData = {
  question: string;
  context?: string;
  options: ApprovalOption[];
  recommendation?: {
    optionId: string;
    reason?: string;
  };
};

export type ApprovalChoice = {
  optionId: string;
  label: string;
};
