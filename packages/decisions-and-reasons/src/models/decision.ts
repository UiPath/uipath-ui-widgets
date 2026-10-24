import type { ReactNode } from "react";

export type Weight = "High" | "Medium" | "Low" | "Not relevant";

export type ScopeId = "this" | "like" | "always";

export type HowMuch =
  | "Kept"
  | "Lightly edited"
  | "Rewritten"
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
};

export type ChangeRow = {
  kind: "decision" | "reason" | "field" | "nextTime";
  id: string;
  label: string | null;
  from: string | null;
  to: string;
  how: HowMuch;
  note?: string;
};

export type CaptureLogEntry = {
  step: number;
  what: string;
  atSecond: number;
  lookedAt: string[];
};

export type CaptureRecordRow = {
  part: string;
  proposed: string;
  submitted: string;
  howMuch: string;
  source: string;
  lookedAt: boolean;
  scope: string;
};

export type PayloadReason = {
  id: string;
  title: string;
  detail: string;
  supports: string;
  proposedWeight: string;
  weight: string;
  source?: string;
  sourceConfidence?: number;
  added?: boolean;
  notRelevantWhy?: string;
  notRelevantNote?: string;
};

export type PayloadField = {
  id: string;
  label: string;
  kind: string;
  byDecision: Record<string, string>;
  value: string;
  setBy: SetBy;
};

export type ReviewPayload = {
  decision: string | null;
  reasons: PayloadReason[];
  rationaleText: string;
  decidingReasons: string[];
  fields: PayloadField[];
  nextTimeId: string;
  nextTimeText: string;
  nextTimeScope: string;
  nextTimeConditions: string[];
  changes: string[];
  record: CaptureRecordRow[];
  reviewerId: string;
  timeOnTaskSeconds: number;
  changeLog: CaptureLogEntry[];
};

export type ReviewFact = { label: string; value: string };

export type ReviewShow = {
  confidence?: boolean;
  citation?: boolean;
  qcLane?: boolean;
  nextTime?: boolean;
  comparison?: boolean;
  record?: boolean;
};

export type ReviewCopy = {
  outcome?: string;
  complete?: string;
  extracted?: string;
  record?: string;
};

export interface ReviewProps {
  title: string;
  subtitle?: string;
  facts?: ReviewFact[];
  excerpt?: string;
  proposedBy?: string;
  outcomes?: ReviewOutcome[];
  reasonOptions?: readonly string[];
  show?: ReviewShow;
  copy?: ReviewCopy;
  aside?: ReactNode;
  className?: string;
  readOnly?: boolean;
  reviewerId?: string;
  saved?: ReviewSaved;
  onChange?: (payload: ReviewPayload) => void;
  onComplete: (outcome: string, payload: ReviewPayload) => Promise<void> | void;
}

export interface FieldRenderProps<Field> {
  renderField?: (field: Field, defaultNode: ReactNode) => ReactNode;
}

export type CaseField = {
  id: string;
  label: string;
  kind: string;
  byOutcome: Record<string, string>;
};

export type CaseReason = ReviewReason & {
  supports: string;
  weight: Weight;
};

export interface CaseAssessmentProps
  extends ReviewProps, FieldRenderProps<CaseField> {
  outcomes: ReviewOutcome[];
  reasons: CaseReason[];
  fields?: CaseField[];
  nextTime?: NextTime;
}

export type ComparisonVerdict =
  | "Correct"
  | "Extraction wrong"
  | "System value wrong";

export type ComparisonCitation = {
  document: string;
  page: number;
  before: string;
  highlight: string;
  after: string;
};

export type ComparisonField = {
  id: string;
  group: string;
  label: string;
  extractedValue: string;
  recordValue: string;
  confidence?: number;
  evidence?: string;
  citation?: ComparisonCitation;
  reviewer?: {
    verdict: ComparisonVerdict;
    extractedValue?: string;
    recordValue?: string;
  };
};

export type FieldStatus = "validated" | "flagged" | "pending";

export interface SourceComparisonProps
  extends ReviewProps, FieldRenderProps<ComparisonField> {
  fields: ComparisonField[];
  onOpenCitation?: (citation: ComparisonCitation) => void;
}

export type ValueField = {
  id: string;
  label: string;
  value: string;
  confidence?: number;
};

export type DocumentLineItem = { id: string; fields: ValueField[] };

export interface ExtractionValidationProps
  extends ReviewProps, FieldRenderProps<ValueField> {
  fields: ValueField[];
  lineItems?: DocumentLineItem[];
}

export type TriageLabel = {
  id: string;
  label: string;
  options: string[];
  proposed: string;
  confidence?: number;
  reason: string;
  changeReasons?: string[];
};

export interface TriageRoutingProps
  extends ReviewProps, FieldRenderProps<TriageLabel> {
  labels: TriageLabel[];
}

export interface DraftEditingProps
  extends ReviewProps, FieldRenderProps<ValueField> {
  fields: ValueField[];
}

export type FactSide = "fraud" | "neutral" | "legitimate";

export type FactPosition = {
  id: string;
  label: string;
  side: FactSide;
};

export type FactItem = {
  id: string;
  group: string;
  label: string;
  subtitle?: string;
  value: string;
  agentRead?: string;
};

export type FactRecommendation = {
  outcome: string;
  risk?: number;
  confidence?: string;
  reason: string;
  evidence: string[];
};

export type FactRationale = { tags: string[]; text: string };

export type FactWeight = {
  id: string;
  label: string;
  group: string;
  agentRead: string;
  weight: string;
  setBy: SetBy;
};

export type FactWeighingPayload = ReviewPayload & {
  facts: FactWeight[];
  rationale: FactRationale;
};

export interface FactWeighingProps
  extends
    Omit<ReviewProps, "onChange" | "onComplete" | "facts" | "excerpt">,
    FieldRenderProps<FactItem> {
  items: FactItem[];
  recommendation: FactRecommendation;
  ruleStatus?: string;
  onChange?: (payload: FactWeighingPayload) => void;
  onComplete: (
    outcome: string,
    payload: FactWeighingPayload,
  ) => Promise<void> | void;
}
