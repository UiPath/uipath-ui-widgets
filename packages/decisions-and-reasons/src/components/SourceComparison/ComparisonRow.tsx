import type { FC } from "react";
import {
  Badge,
  Button,
  ToggleGroup,
  ToggleGroupItem,
} from "@uipath/apollo-wind";
import { useCapture } from "../../hooks/useCapture";
import type { ReviewShow } from "../../models/props";
import { signal } from "../../utils/signals";
import { ConfidenceBadge } from "../shared/ConfidenceBadge";
import { PartReasons } from "../shared/PartReasons";
import { CitationLink } from "./CitationLink";
import { CorrectedValue } from "./CorrectedValue";
import { ValuePanel } from "./ValuePanel";
import { correctionPartId, extractionMatchesRecord } from "./comparison";
import type { ComparisonIds, ComparisonLabels } from "./comparison";
import { COMPARISON_VERDICTS } from "./defaults";
import type { ComparisonCitation, ComparisonField, FieldStatus } from "./types";

const STATUS_TEXT: Record<FieldStatus, [string, string]> = {
  pending: ["Not reviewed", "Not audited"],
  validated: ["Validated", "Agreed"],
  flagged: ["Flagged", "Disputed"],
};

export const ComparisonRow: FC<{
  field: ComparisonField;
  ids: ComparisonIds;
  status: FieldStatus;
  qc: boolean;
  show: ReviewShow;
  labels: ComparisonLabels;
  reasonOptions: readonly string[];
  onOpenCitation?: (citation: ComparisonCitation) => void;
}> = ({
  field,
  ids,
  status,
  qc,
  show,
  labels,
  reasonOptions,
  onOpenCitation,
}) => {
  const { locked, looked, getPart, pickMany } = useCapture();
  const verdict = getPart(ids.verdict);
  const reviewed = !!looked[ids.verdict];
  const reviewer = qc ? field.reviewer : undefined;
  const isMatch = extractionMatchesRecord(field);
  const disputed = qc && reviewed && status === "flagged";
  const needsNote = reviewed && (qc ? disputed : verdict.value !== "Correct");
  const correctionId = correctionPartId(verdict.value, ids);
  const correctedLabel =
    correctionId === ids.contract ? labels.extracted : labels.record;
  const showComparison = show.comparison !== false;

  const choose = (nextVerdict: string) =>
    pickMany(
      { [ids.verdict]: nextVerdict, [ids.contract]: null, [ids.system]: null },
      ids.verdict,
      `Field: ${field.label}, verdict ${verdict.value} → ${nextVerdict}`,
    );

  return (
    <div
      data-testid="field-card"
      className="space-y-3 rounded-lg bg-muted/40 p-4"
    >
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-sm font-semibold">{field.label}</span>
        {showComparison && (
          <Badge variant={isMatch ? "secondary" : "outline"}>
            {isMatch ? "Match" : "Mismatch"}
          </Badge>
        )}
        {show.confidence !== false && field.confidence !== undefined && (
          <ConfidenceBadge confidence={field.confidence} />
        )}
        {reviewer && (
          <Badge variant="outline">Reviewer: {reviewer.verdict}</Badge>
        )}
        <span className="ml-auto text-xs text-muted-foreground">
          {STATUS_TEXT[status][qc ? 1 : 0]}
        </span>
      </div>
      {showComparison && (
        <div className="flex items-stretch gap-2">
          <ValuePanel label={labels.extracted} value={field.extractedValue} />
          <span
            aria-hidden="true"
            className="self-center text-xs font-semibold text-muted-foreground"
          >
            {isMatch ? "=" : "≠"}
          </span>
          <ValuePanel label={labels.record} value={field.recordValue} />
        </div>
      )}
      {field.evidence && (
        <p
          {...signal.evidence(field.id)}
          className="text-xs leading-relaxed text-muted-foreground"
        >
          Proposed: {field.evidence}
        </p>
      )}
      {show.citation !== false && field.citation && (
        <CitationLink citation={field.citation} onOpen={onOpenCitation} />
      )}
      <div className="flex flex-wrap items-center gap-2">
        {reviewer && (
          <Button
            variant="outline"
            size="xs"
            {...signal.field(ids.verdict)}
            disabled={locked}
            aria-pressed={reviewed && !disputed}
            onClick={() => choose(reviewer.verdict)}
          >
            Concur with reviewer
          </Button>
        )}
        <ToggleGroup
          type="single"
          variant="outline"
          size="xs"
          disabled={locked}
          value={reviewed ? verdict.value : ""}
          onValueChange={(value) => value && choose(value)}
          aria-label={`Verdict for ${field.label}`}
        >
          {COMPARISON_VERDICTS.map((option) => (
            <ToggleGroupItem
              key={option}
              value={option}
              {...signal.field(ids.verdict)}
            >
              {option}
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
      </div>
      {reviewed && correctionId && (
        <CorrectedValue
          part={getPart(correctionId)}
          label={`Corrected ${correctedLabel.toLowerCase()}`}
        />
      )}
      {needsNote && (
        <PartReasons
          part={verdict}
          question={`${field.label}: ${qc ? "why dispute" : "note"}?`}
          options={reasonOptions}
        />
      )}
    </div>
  );
};
