import type { FieldRenderProps, ReviewProps } from "../../models/props";

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
