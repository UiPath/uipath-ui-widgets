export const WEIGHTS = ["High", "Medium", "Low", "Not relevant"] as const;
export type Weight = (typeof WEIGHTS)[number];

export const NOT_RELEVANT_WHYS = ["Wrong", "Outdated", "Other"] as const;
export type NotRelevantWhy = (typeof NOT_RELEVANT_WHYS)[number];

export const INSTRUCTION_SCOPES = [
  "this-task",
  "similar-tasks",
  "all-tasks",
] as const;
export type InstructionScope = (typeof INSTRUCTION_SCOPES)[number];

/** One reason behind the proposal. Returned in the shape it arrived; only weight, notRelevantWhy and notRelevantNote can differ. */
export interface EvidenceItem {
  id: string;
  title: string;
  description?: string;
  /** An outcome name this reason argues for. */
  supports?: string;
  weight?: Weight;
  notRelevantWhy?: NotRelevantWhy;
  notRelevantNote?: string;
  [extra: string]: unknown;
}

/** One resolution the reviewer can choose. Its name is what completeTask receives. */
export interface OutcomeOption {
  name: string;
  description?: string;
}

export interface DecisionModel {
  taskId: string;
  outcomes: OutcomeOption[];
  /** Outcome name the process proposes. Never pre-selected. */
  proposedOutcome?: string;
  /** 0 to 100. */
  proposalConfidence?: number;
  evidence?: EvidenceItem[];
  rationaleOptions?: string[];
  instructionOptions?: string[];
  /** Saved values, shown when the task is already completed. */
  rationale?: string[];
  instructionText?: string;
  instructionScope?: InstructionScope;
  /** The outcome the task was completed with. */
  completedOutcome?: string;
}

/** Task data handed to completeTask. */
export type DecisionTaskData = Record<string, unknown>;

/** Source of a DecisionModel for one task. The widget only ever talks to this interface. */
export interface DecisionSource {
  getDecision(taskId: string): Promise<DecisionModel>;
}
