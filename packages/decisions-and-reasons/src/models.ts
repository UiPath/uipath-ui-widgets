/** Data model for the decisions-and-reasons widget. A DecisionModel is what the widget renders. */

export type RelevanceLevel = "high" | "medium" | "low" | "not-relevant";

export type DecisionVerdict = "approve" | "deny";

/** One row in the Evidence table. */
export interface EvidenceItem {
  id: string;
  title: string;
  description: string;
  /** Small tags shown under the description, e.g. "Parts $3,980.00", "Fieldlink", "WT-9". */
  tags: string[];
  /** Which side this evidence supports — drives the row's colored dot. */
  supports: DecisionVerdict;
  relevance: RelevanceLevel;
  decision: DecisionVerdict;
  /** Where this evidence came from, when it wasn't added manually in the widget. */
  sourceRef?: string;
}

export interface ResolutionOption {
  id: string;
  label: string;
  description: string;
}

export interface AmountInfo {
  total: number;
  refund: number;
  paidByCustomer: number;
  ceiling: number;
  breakdown?: Array<{ label: string; value: number }>;
}

export interface RationaleInfo {
  text: string;
  version: string;
  lastEditedAt: string | null;
}

/** The four parts a submission can change relative to the agent's original proposal. */
export type SubmittablePart =
  | "resolution"
  | "refund"
  | "rationale"
  | "evidence";

export interface DecisionModel {
  taskId: string;
  title: string;
  taskTitle?: string;
  taskType?: string;
  priority?: string;
  isAgentRecommended: boolean;
  /** Drives the small colored dot next to the resolution heading. */
  severity: "positive" | "negative";
  confidenceScore: number;
  evidence: EvidenceItem[];
  amount: AmountInfo;
  rationale: RationaleInfo;
  resolutionOptions: ResolutionOption[];
  /** Resolution id the agent proposed. Never pre-selected — the human must choose. */
  agentRecommendedResolutionId: string;
}

/** A derived interaction signal. Only the derived value is kept, never raw events or text. */
export type InteractionSignalKind =
  | "time_to_first_input"
  | "decision_order"
  | "changes_of_mind"
  | "alternatives_considered"
  | "edits_after_deciding"
  | "fast_acceptance"
  | "evidence_coverage"
  | "typed_then_deleted"
  | "pasted_text"
  | "time_away"
  | "recommendation_kept"
  | "unedited_model_share";

export interface InteractionSignal {
  kind: InteractionSignalKind;
  value: number | string | boolean;
  durationMs?: number;
  /** Which option or reason the signal is about, by id, when it is about one. */
  target?: string;
}

/** What the human actually decided, captured for the change-tracking bar and the host's write-back. */
export interface DecisionSubmission {
  taskId: string;
  selectedResolutionId: string;
  refund: number;
  rationaleText: string;
  evidence: Array<{
    id: string;
    title: string;
    relevance: RelevanceLevel;
    decision: DecisionVerdict;
  }>;
  /** Opaque identity string. The host supplies it — this widget has no identity of its own. */
  capturedBy: string;
  metadata?: { taskTitle?: string; taskType?: string; priority?: string };
  /** Implicit signals observed while this decision was being made. */
  signals?: InteractionSignal[];
}

/** Source of a DecisionModel for one task. The widget only ever talks to this interface. */
export interface DecisionSource {
  getDecision(taskId: string): Promise<DecisionModel>;
}

/** Decisions and reasons an agent synthesized for this task, pushed into the widget via props. */
export interface AutopilotDecisionAnalysis {
  /** Decisions the user picks from. */
  resolutionOptions?: ResolutionOption[];
  /** Must match one of resolutionOptions' ids. Shown as agent recommended, never pre-selected. */
  agentRecommendedResolutionId?: string;
  /** 0 to 100. */
  confidenceScore?: number;
  /** Reasons backing the decision, each with its own relevance and approve/deny decision. */
  evidence?: EvidenceItem[];
  /** Prefills the rationale field only while it is empty. */
  rationaleSuggestion?: string;
}
