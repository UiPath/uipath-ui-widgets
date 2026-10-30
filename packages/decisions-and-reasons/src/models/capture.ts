export type Weight = "High" | "Medium" | "Low" | "Not relevant";

export type ScopeId = "this" | "like" | "always";

export type Resolution =
  | "Kept"
  | "Changed"
  | "Rejected"
  | "Added"
  | "Untouched";

export type SetBy = "model" | "reviewer";

export type WhyPick = { why: string | null; note: string };

export type ReviewOutcome = {
  id: string;
  label: string;
  description: string;
  recommended?: boolean;
  requiresReason?: boolean;
  requiresCoverage?: boolean;
  blendsReasons?: boolean;
  reasons?: readonly string[];
};

export type ReviewReason = {
  id: string;
  title: string;
  detail: string;
  supports?: string;
  weight?: Weight;
  partId?: string;
  source?: string;
  confidence?: number;
};

export type ReviewSeed = {
  id: string;
  label: string;
  kind: string;
  proposed: string;
  confidence?: number;
  source?: string;
  byOutcome?: Record<string, string>;
};

export type ReviewPart = ReviewSeed & {
  value: string;
  follows?: string;
  looked: boolean;
  why: string | null;
  note: string;
};

export type ReasonView = ReviewReason & {
  supports: string;
  weight: Weight;
  proposedWeight: Weight;
  added: boolean;
  why: string | null;
  note: string;
};

export type NextTimeOption = { id: string; text: string; basis: string };

export type NextTimeCondition = { id: string; label: string };

export type NextTime = {
  options: NextTimeOption[];
  conditions: NextTimeCondition[];
};

export type ReviewSpec = {
  outcomes: ReviewOutcome[];
  recommended: string;
  proposedBy?: string;
  reasons: ReviewReason[];
  weighted?: boolean;
  nextTime?: NextTime;
};

export type ReviewState = {
  values: Record<string, string>;
  whys: Record<string, WhyPick>;
  looked: Record<string, boolean>;
  outcome: string | null;
  outcomeWhy: WhyPick;
  weights: Record<string, Weight>;
  reasonWhys: Record<string, WhyPick>;
  added: ReviewReason[];
  lesson: string | null;
  scope: ScopeId;
  conds: Record<string, boolean>;
  tags: string[];
};

export type ReviewSaved = {
  outcome?: string;
  outcomeWhy?: string;
  values?: Record<string, string>;
  whys?: Record<string, WhyPick>;
  weights?: Record<string, Weight>;
  reasonWhys?: Record<string, WhyPick>;
  lesson?: string;
  scope?: ScopeId;
  conditions?: string[];
  tags?: string[];
};

export type ChangeRow = {
  kind: "decision" | "reason" | "field" | "nextTime";
  id: string;
  label: string | null;
  from: string | null;
  to: string;
  how: Resolution;
  note?: string;
};

export type CaptureLogEntry = {
  step: number;
  what: string;
  atSecond: number;
  lookedAt: string[];
};
