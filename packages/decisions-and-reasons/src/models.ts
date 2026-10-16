/** Data model for the decisions-and-reasons widget. A DecisionModel is what the widget renders. */

export type RelevanceLevel = "high" | "medium" | "low" | "not-relevant";

/** One reason behind the agent's proposal. The widget returns it in this shape, changing only relevance and verdict. */
export interface EvidenceItem {
  id: string;
  title: string;
  description?: string;
  /** Small tags shown under the description, e.g. "Parts $3,980.00", "Fieldlink", "WT-9". */
  tags?: string[];
  /** An outcome name this reason supports. */
  supports: string;
  relevance: RelevanceLevel;
  /** An outcome name the reviewer assigns to this reason. */
  verdict: string;
}

/** One resolution the reviewer can choose. Its name is what completeTask receives. */
export interface OutcomeOption {
  name: string;
  description?: string;
}

export type FieldValue = string | number;

/** A domain value the agent proposes and the reviewer may change. */
export interface UseCaseField {
  /** The task data key, returned unchanged in the completion data. */
  key: string;
  label: string;
  type: "text" | "number" | "select";
  /** The agent's proposed value. */
  value: FieldValue;
  /** Choices, for type "select". */
  options?: string[];
}

export interface DecisionModel {
  taskId: string;
  title: string;
  /** Outcome name the agent recommends. Never pre-selected, the human must choose. */
  agentRecommendedOutcome?: string;
  /** 0 to 100. */
  confidenceScore: number;
  outcomes: OutcomeOption[];
  fields: UseCaseField[];
  evidence: EvidenceItem[];
  /** Prefills the rationale field while it is empty. */
  rationaleSuggestion?: string;
  /** One concrete example shown in the empty instruction field. */
  instructionPlaceholder?: string;
}

/** Task data handed to completeTask: every proposed value, the rationale and the instruction. */
export type DecisionTaskData = Record<string, unknown>;

/** Source of a DecisionModel for one task. The widget only ever talks to this interface. */
export interface DecisionSource {
  getDecision(taskId: string): Promise<DecisionModel>;
}

/** Decisions and reasons an agent synthesized for this task, pushed into the widget via props. */
export interface AutopilotDecisionAnalysis {
  outcomes?: OutcomeOption[];
  /** Must match one of outcomes' names. Badged as recommended, never pre-selected. */
  agentRecommendedOutcome?: string;
  /** 0 to 100. */
  confidenceScore?: number;
  /** Reasons backing the decision, each with its own relevance and verdict. */
  evidence?: EvidenceItem[];
  /** Prefills the rationale field only while it is empty. */
  rationaleSuggestion?: string;
}
