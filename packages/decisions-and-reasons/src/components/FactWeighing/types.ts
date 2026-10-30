import type { SetBy } from "../../models/capture";
import type { ReviewPayload } from "../../models/payload";
import type { FieldRenderProps, ReviewProps } from "../../models/props";

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

export type FactRationale = { text: string };

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
