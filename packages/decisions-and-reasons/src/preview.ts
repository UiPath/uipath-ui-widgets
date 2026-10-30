export { CaseAssessment } from "./components/CaseAssessment/CaseAssessment";
export { SourceComparison } from "./components/SourceComparison/SourceComparison";
export { ExtractionValidation } from "./components/ExtractionValidation/ExtractionValidation";
export { TriageRouting } from "./components/TriageRouting/TriageRouting";
export { DraftEditing } from "./components/DraftEditing/DraftEditing";
export { FactWeighing } from "./components/FactWeighing/FactWeighing";

export { ReviewShell } from "./components/shared/ReviewShell";
export { ReviewSummary } from "./components/shared/ReviewSummary";
export { ContextHeader } from "./components/shared/ContextHeader";
export { CompletionBadge } from "./components/shared/CompletionBadge";
export { ConfidenceBadge } from "./components/shared/ConfidenceBadge";
export { OutcomePicker } from "./components/shared/OutcomePicker";
export { ReasonChips } from "./components/shared/ReasonChips";
export { PartReasons } from "./components/shared/PartReasons";
export { ConfirmButton } from "./components/shared/ConfirmButton";
export { ProposalInput } from "./components/shared/ProposalInput";
export { ReasonsSection } from "./components/shared/ReasonsSection";
export { ReasonTags } from "./components/shared/ReasonTags";
export { TaskTags } from "./components/shared/TaskTags";
export { NextTimeSection } from "./components/shared/NextTimeSection";
export { ChangesSummary } from "./components/shared/ChangesSummary";
export { RecordDrawer } from "./components/shared/RecordDrawer";
export { DocumentReasonRow } from "./components/shared/DocumentReasonRow";
export type { DocumentReasonRowProps } from "./components/shared/DocumentReasonRow";

export { useDecisionCapture } from "./hooks/useDecisionCapture";
export type {
  ReviewCaptureOptions,
  ReviewModel,
} from "./hooks/useDecisionCapture";
export { CaptureProvider, useCapture } from "./hooks/useCapture";
export { useProposalControl } from "./hooks/useProposalControl";

export {
  withReasonCapture,
  REASON_CAPTURE_WHYS,
} from "./utils/withReasonCapture";
export type {
  ReasonCaptureField,
  ReasonCaptureOptions,
  ReasonCaptureResult,
  ReasonCaptureSchema,
} from "./utils/withReasonCapture";
export { DOCUMENT_REASONS } from "./models/constants";

export type {
  CaptureLogEntry,
  NextTime,
  ReviewOutcome,
  ReviewSaved,
} from "./models/capture";
export type {
  CaptureRecordRow,
  PayloadField,
  PayloadReason,
  ReviewPayload,
} from "./models/payload";
export type {
  ReviewCopy,
  ReviewFact,
  ReviewProps,
  ReviewShow,
  ValueField,
} from "./models/props";
export type {
  CaseAssessmentProps,
  CaseField,
  CaseReason,
} from "./components/CaseAssessment/types";
export type {
  ComparisonCitation,
  ComparisonField,
  ComparisonVerdict,
  SourceComparisonProps,
} from "./components/SourceComparison/types";
export type {
  DocumentLineItem,
  ExtractionValidationProps,
} from "./components/ExtractionValidation/types";
export type {
  TriageLabel,
  TriageRoutingProps,
} from "./components/TriageRouting/types";
export type { DraftEditingProps } from "./components/DraftEditing/types";
export type {
  FactItem,
  FactRationale,
  FactRecommendation,
  FactWeight,
  FactWeighingPayload,
  FactWeighingProps,
} from "./components/FactWeighing/types";

export { FIXTURE_CASE } from "./fixtures/caseAssessment";
export {
  FIXTURE_COMPARISON,
  FIXTURE_COMPARISON_QC,
} from "./fixtures/sourceComparison";
export { FIXTURE_EXTRACTION } from "./fixtures/extractionValidation";
export { FIXTURE_TRIAGE } from "./fixtures/triageRouting";
export { FIXTURE_DRAFT } from "./fixtures/draftEditing";
export { FIXTURE_FACTS } from "./fixtures/factWeighing";
