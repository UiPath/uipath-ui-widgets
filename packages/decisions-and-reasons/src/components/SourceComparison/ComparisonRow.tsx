import { useId, useState } from "react";
import type { FC } from "react";
import {
  Badge,
  Button,
  Input,
  Label,
  ToggleGroup,
  ToggleGroupItem,
  cn,
} from "@uipath/apollo-wind";
import { ReasonChips } from "../shared/ReasonChips";
import type { ReviewModel } from "../../hooks/useDecisionCapture";
import { LOW_CONFIDENCE, COMPARISON_VERDICTS } from "../../models/constants";
import type {
  FieldStatus,
  ReviewCopy,
  ReviewPart,
  ReviewShow,
  ComparisonCitation,
  ComparisonField,
} from "../../models/decision";

export type ComparisonIds = {
  verdict: string;
  contract: string;
  system: string;
};

const STATUS_TEXT: Record<FieldStatus, [string, string]> = {
  pending: ["Not reviewed", "Not audited"],
  validated: ["Validated", "Agreed"],
  flagged: ["Flagged", "Disputed"],
};

const ValuePanel: FC<{ label: string; value: string }> = ({ label, value }) => (
  <div className="min-w-0 flex-1 rounded-lg border border-border-de-emp bg-background px-3 py-2">
    <p className="mb-1 text-xs font-medium text-muted-foreground">{label}</p>
    <p className="break-words text-xs">{value || "—"}</p>
  </div>
);

const Citation: FC<{
  citation: ComparisonCitation;
  onOpen?: (c: ComparisonCitation) => void;
}> = ({ citation, onOpen }) => {
  const [open, setOpen] = useState(false);
  return (
    <div className="space-y-1">
      <Button
        variant="link"
        aria-expanded={open}
        className="h-auto p-0 text-xs"
        onClick={() => {
          setOpen(!open);
          if (!open) onOpen?.(citation);
        }}
      >
        {citation.document} · page {citation.page}
      </Button>
      {open && (
        <p
          data-signal-evidence="citation"
          className="rounded-md bg-muted/50 p-2 text-xs leading-relaxed text-muted-foreground"
        >
          {citation.before}
          <mark className="rounded bg-warning-background px-0.5 text-foreground">
            {citation.highlight}
          </mark>
          {citation.after}
        </p>
      )}
    </div>
  );
};

const CorrectedValue: FC<{
  model: ReviewModel;
  part: ReviewPart;
  label: string;
}> = ({ model, part, label }) => {
  const id = useId();
  return (
    <div className="space-y-1">
      <Label htmlFor={id} className="text-xs font-medium text-muted-foreground">
        {label}
      </Label>
      <Input
        id={id}
        data-signal-field={part.id}
        disabled={model.locked}
        value={part.value}
        onFocus={() => model.lookAt(part.id)}
        onChange={(e) => model.edit(part.id, e.target.value)}
        onBlur={() => model.settle(part.id)}
      />
    </div>
  );
};

export const ComparisonRow: FC<{
  model: ReviewModel;
  field: ComparisonField;
  ids: ComparisonIds;
  status: FieldStatus;
  qc: boolean;
  show: ReviewShow;
  copy: Required<Pick<ReviewCopy, "extracted" | "record">>;
  reasonOptions: readonly string[];
  onOpenCitation?: (c: ComparisonCitation) => void;
}> = ({
  model,
  field,
  ids,
  status,
  qc,
  show,
  copy,
  reasonOptions,
  onOpenCitation,
}) => {
  const part = (id: string) => model.parts.find((p) => p.id === id)!;
  const verdict = part(ids.verdict);
  const reviewed = !!model.looked[ids.verdict];
  const reviewer = qc ? field.reviewer : undefined;
  const isMatch =
    field.extractedValue.trim().toLowerCase() ===
    field.recordValue.trim().toLowerCase();
  const disputed = qc && reviewed && status === "flagged";
  const needsNote = reviewed && (qc ? disputed : verdict.value !== "Correct");
  const corrected =
    verdict.value === "Extraction wrong"
      ? { part: part(ids.contract), label: copy.extracted }
      : verdict.value === "System value wrong"
        ? { part: part(ids.system), label: copy.record }
        : null;

  const choose = (v: string) =>
    model.pickMany(
      { [ids.verdict]: v, [ids.contract]: null, [ids.system]: null },
      ids.verdict,
      `Field: ${field.label}, verdict ${verdict.value} → ${v}`,
    );

  return (
    <div
      data-testid="field-card"
      className="space-y-3 rounded-lg bg-muted/40 p-4"
    >
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-sm font-semibold">{field.label}</span>
        {show.comparison !== false && (
          <Badge variant={isMatch ? "secondary" : "outline"}>
            {isMatch ? "Match" : "Mismatch"}
          </Badge>
        )}
        {show.confidence !== false && field.confidence !== undefined && (
          <Badge
            variant="outline"
            className={cn(
              "tabular-nums",
              field.confidence < LOW_CONFIDENCE &&
                "border-warning-icon bg-warning-background",
            )}
          >
            {field.confidence}%
          </Badge>
        )}
        {reviewer && (
          <Badge variant="outline">Reviewer: {reviewer.verdict}</Badge>
        )}
        <span className="ml-auto text-xs text-muted-foreground">
          {STATUS_TEXT[status][qc ? 1 : 0]}
        </span>
      </div>
      {show.comparison !== false && (
        <div className="flex items-stretch gap-2">
          <ValuePanel label={copy.extracted} value={field.extractedValue} />
          <span
            aria-hidden="true"
            className="self-center text-xs font-semibold text-muted-foreground"
          >
            {isMatch ? "=" : "≠"}
          </span>
          <ValuePanel label={copy.record} value={field.recordValue} />
        </div>
      )}
      {field.evidence && (
        <p
          data-signal-evidence={field.id}
          className="text-xs leading-relaxed text-muted-foreground"
        >
          Proposed: {field.evidence}
        </p>
      )}
      {show.citation !== false && field.citation && (
        <Citation citation={field.citation} onOpen={onOpenCitation} />
      )}
      <div className="flex flex-wrap items-center gap-2">
        {reviewer && (
          <Button
            variant="outline"
            size="xs"
            data-signal-field={ids.verdict}
            disabled={model.locked}
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
          disabled={model.locked}
          value={reviewed ? verdict.value : ""}
          onValueChange={(v) => v && choose(v)}
          aria-label={`Verdict for ${field.label}`}
        >
          {COMPARISON_VERDICTS.map((v) => (
            <ToggleGroupItem key={v} value={v} data-signal-field={ids.verdict}>
              {v}
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
      </div>
      {reviewed && corrected && (
        <CorrectedValue
          model={model}
          part={corrected.part}
          label={`Corrected ${corrected.label.toLowerCase()}`}
        />
      )}
      {needsNote && (
        <ReasonChips
          question={`${field.label}: ${qc ? "why dispute" : "note"}?`}
          options={reasonOptions}
          pick={{ why: verdict.why, note: verdict.note }}
          disabled={model.locked}
          onToggle={(why) => model.toggleWhy(ids.verdict, why)}
          onNote={(note) => model.editNote(ids.verdict, note)}
        />
      )}
    </div>
  );
};
