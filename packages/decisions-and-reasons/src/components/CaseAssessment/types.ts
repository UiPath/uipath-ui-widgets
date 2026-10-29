import type {
  NextTime,
  ReviewOutcome,
  ReviewReason,
  Weight,
} from "../../models/capture";
import type { FieldRenderProps, ReviewProps } from "../../models/props";

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
