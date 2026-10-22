export type Weight = "High" | "Medium" | "Low" | "Not relevant";

export type ScopeId = "this" | "like" | "always";

export type HowMuch =
  | "Kept"
  | "Lightly edited"
  | "Rewritten"
  | "Rejected"
  | "Added"
  | "Untouched";

export type RowKind = "decision" | "reason" | "field" | "nextTime";

export type EventKind =
  | "decision"
  | "weight"
  | "why"
  | "reasonAdded"
  | "reasonRemoved"
  | "nextTime"
  | "scope";

export type ClaimReason = {
  id: string;
  title: string;
  detail: string;
  supports: string;
  proposedWeight: string;
  source?: string;
  sourceConfidence?: number;
  weight?: string;
  notRelevantWhy?: string;
  notRelevantNote?: string;
  added?: boolean;
};

export type FinalDetailField = {
  id: string;
  label: string;
  kind: string;
  byDecision: Record<string, string>;
  value?: string;
  setBy?: SetBy;
};

export type ClaimData = {
  claimId: string;
  customer: string;
  claimAmount: number;
  planCeiling: number;
  planName?: string;
  proposedBy?: string;
  involvement?: string;
  recommendedDecision: string;
  reasons: ClaimReason[];
  fields?: FinalDetailField[];
  nextTimeOptions: { id: string; text: string; basis: string }[];
  conditionOptions: { id: string; label: string }[];
  decision?: string;
  rationaleText?: string;
  nextTimeId?: string;
  nextTimeScope?: string;
  nextTimeConditions?: string[];
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

export type CaptureLogEntry = {
  step: number;
  what: string;
  atSecond: number;
  lookedAt: string[];
};

export type DecisionCaptureCodedActionAppPayload = {
  decision: string | null;
  reasons: ClaimReason[];
  rationaleText: string;
  decidingReasons: string[];
  fields: FinalDetailField[];
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

export interface DecisionCaptureCodedActionAppProps {
  data: ClaimData;
  readOnly?: boolean;
  showRecord?: boolean;
  reviewerId?: string;
  onChange?: (p: DecisionCaptureCodedActionAppPayload) => void;
  onComplete: (
    decision: string,
    p: DecisionCaptureCodedActionAppPayload,
  ) => Promise<void> | void;
}

export type ReasonState = ClaimReason & {
  w: Weight;
  why: string | null;
  note: string;
};

export type ReviewState = {
  decision: string | null;
  rs: ReasonState[];
  fieldVals: Record<string, string>;
  lesson: string | null;
  scope: ScopeId;
  conds: Record<string, boolean>;
};

export type ReviewEvent = {
  at: number;
  kind: EventKind;
  targetId: string;
  label: string | null;
  from: string | null;
  to: string | null;
  looked: string[];
};

export type ReviewContext = {
  data: ClaimData;
  looked: Record<string, boolean>;
  log: ReviewEvent[];
  reviewerId: string;
  startedAt: number;
};

export type ReasonOutcome = { weight: Weight; reason: string | null };

export type ScopeSelection = { scope: ScopeId; conditions: string[] };

export type RecordSource =
  | { kind: "proposer"; name: string; confidence?: number }
  | { kind: "reviewer" }
  | { kind: "followsDecision" };

type ChangeBase = {
  id: string;
  label: string | null;
  howMuch: HowMuch;
  scope: ScopeId;
};

export type ChangeRow = ChangeBase &
  (
    | { kind: "decision"; from: string; to: string }
    | { kind: "reason"; from: string | null; to: ReasonOutcome }
    | { kind: "field"; from: string; to: string }
    | { kind: "nextTime"; from: null; to: ScopeSelection }
  );

type RecordBase = {
  id: string;
  label: string | null;
  howMuch: HowMuch;
  source: RecordSource | null;
  lookedAt: boolean;
  scope: ScopeId | null;
};

export type RecordEntry = RecordBase &
  (
    | { kind: "decision"; proposed: string; submitted: string | null }
    | { kind: "reason"; proposed: string | null; submitted: ReasonOutcome }
    | { kind: "field"; proposed: string; submitted: string }
    | { kind: "nextTime"; proposed: number; submitted: string | null }
  );

export const WEIGHTS: Weight[] = ["High", "Medium", "Low", "Not relevant"];
export const WHY = ["Wrong", "Outdated", "Other"];

export const DECISIONS = [
  { id: "Approve", t: "Approve in full", d: "Pay the full claim." },
  {
    id: "ApprovePartial",
    t: "Approve partial",
    d: "Pay up to the ceiling and tell the customer which part was covered.",
  },
  {
    id: "Deny",
    t: "Deny",
    d: "Close the claim and explain which part was covered.",
  },
];

export const SCOPES = [
  {
    id: "this",
    value: "this-claim",
    label: "Just this claim",
    counts: "Just this claim",
  },
  {
    id: "like",
    value: "similar-claims",
    label: "Claims like this",
    counts: "Counts for claims like this",
  },
  {
    id: "always",
    value: "all-claims",
    label: "Always",
    counts: "Counts for all claims",
  },
] as const;
export const KIND_PARTS = {
  decision: "Decision",
  reason: "Reason",
  field: "Field",
  nextTime: "Next time",
} as const;

export const DOCUMENT_REASONS = [
  "Extraction misread",
  "Not in the document",
  "Rule doesn't fit",
  "Other",
] as const;

export const CONTRACT_VERDICTS = [
  "Correct",
  "Extraction wrong",
  "System value wrong",
] as const;

export const CONTRACT_NOTE_REASONS = [
  "Misread number",
  "Superseded by an amendment",
  "Wrong clause cited",
  "System record out of date",
  "Other",
] as const;

export const DOCUMENT_REJECT_REASONS = [
  "Not a supported document",
  "Duplicate submission",
  "Illegible scan",
  "Supplier not recognised",
  "Other",
] as const;

export const TRIAGE_SEND_BACK_REASONS = [
  "Missing details",
  "Needs a reply from the requester",
  "Belongs to another process",
  "Other",
] as const;

export type ContractVerdict = (typeof CONTRACT_VERDICTS)[number];

export type SetBy = "model" | "reviewer";

export type WhyPick = { why: string | null; note: string };

export type UseCaseOutcome = {
  id: string;
  label: string;
  description: string;
  reasons?: readonly string[];
  requiresReason?: boolean;
};

export type PartSeed = {
  id: string;
  label: string;
  kind: string;
  proposed: string;
  confidence?: number;
  source?: string;
};

export type UseCasePart = PartSeed & {
  value: string;
  looked: boolean;
  why: string | null;
  note: string;
};

export type UseCaseReason = {
  id: string;
  title: string;
  detail: string;
  partId?: string;
  source?: string;
  confidence?: number;
};

export type UseCaseSpec = {
  outcomes: UseCaseOutcome[];
  recommended: string;
  proposedBy?: string;
  reasons: UseCaseReason[];
};

export type UseCaseSaved = {
  outcome?: string;
  outcomeWhy?: string;
  values?: Record<string, string>;
  whys?: Record<string, WhyPick>;
};

export type UseCasePayload = {
  decision: string | null;
  reasons: ClaimReason[];
  rationaleText: string;
  decidingReasons: string[];
  fields: FinalDetailField[];
  changes: string[];
  record: CaptureRecordRow[];
  reviewerId: string;
  timeOnTaskSeconds: number;
  changeLog: CaptureLogEntry[];
};

export interface UseCaseProps<Data> {
  data: Data;
  readOnly?: boolean;
  reviewerId?: string;
  saved?: UseCaseSaved;
  onChange?: (payload: UseCasePayload) => void;
  onComplete: (
    outcome: string,
    payload: UseCasePayload,
  ) => Promise<void> | void;
}
