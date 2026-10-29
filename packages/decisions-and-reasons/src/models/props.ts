import type { ReactNode } from "react";
import type { ReviewOutcome, ReviewSaved } from "./capture";
import type { ReviewPayload } from "./payload";

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

export type ValueField = {
  id: string;
  label: string;
  value: string;
  confidence?: number;
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
