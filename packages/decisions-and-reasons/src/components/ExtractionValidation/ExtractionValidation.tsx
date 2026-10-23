import { Fragment, useId } from "react";
import type { FC } from "react";
import { Badge, Button, Card, Input, Label, cn } from "@uipath/apollo-wind";
import { LineItems } from "./LineItems";
import { ChangesSummary } from "../shared/ChangesSummary";
import { OutcomePicker } from "../shared/OutcomePicker";
import { ReasonChips } from "../shared/ReasonChips";
import { useDecisionCapture } from "../../hooks/useDecisionCapture";
import type { ReviewModel } from "../../hooks/useDecisionCapture";
import {
  DOCUMENT_OUTCOMES,
  DOCUMENT_REASONS,
  LOW_CONFIDENCE,
} from "../../models/constants";
import type {
  ExtractionValidationProps,
  ReviewPart,
  ReviewSeed,
  ValueField,
} from "../../models/decision";
import { partChanged, recommendedId } from "../../utils/changes";

const headerId = (f: ValueField) => `header.${f.id}`;

const HeaderCell: FC<{
  model: ReviewModel;
  part: ReviewPart;
  reasonOptions: readonly string[];
  showConfidence: boolean;
}> = ({ model, part, reasonOptions, showConfidence }) => {
  const id = useId();
  const changed = partChanged(part);
  const low = (part.confidence ?? 100) < LOW_CONFIDENCE;

  return (
    <div
      className={cn(
        "space-y-1 rounded-lg border border-transparent p-2",
        low && !part.looked && !changed && "bg-warning-background",
      )}
    >
      <div className="flex items-center justify-between gap-2">
        <Label
          htmlFor={id}
          className="text-xs font-medium text-muted-foreground"
        >
          {part.label}
        </Label>
        {showConfidence && part.confidence !== undefined && (
          <Badge
            variant="outline"
            className={cn(
              "tabular-nums",
              low && "border-warning-icon bg-warning-background",
            )}
          >
            {part.confidence}%
          </Badge>
        )}
      </div>
      <Input
        id={id}
        data-signal-field={part.id}
        disabled={model.locked}
        value={part.value}
        onFocus={() => model.lookAt(part.id)}
        onChange={(e) => model.edit(part.id, e.target.value)}
        onBlur={() => model.settle(part.id)}
      />
      {changed ? (
        <>
          <p className="text-xs text-muted-foreground">
            Proposed: {part.proposed || "—"}
          </p>
          <ReasonChips
            question={`${part.label}: why?`}
            options={reasonOptions}
            pick={{ why: part.why, note: part.note }}
            disabled={model.locked}
            onToggle={(why) => model.toggleWhy(part.id, why)}
            onNote={(note) => model.editNote(part.id, note)}
          />
        </>
      ) : (
        !model.locked && (
          <Button
            variant="link"
            aria-pressed={part.looked}
            aria-label={`Confirm ${part.label}`}
            className="h-auto p-0 text-xs"
            onClick={() => model.lookAt(part.id)}
          >
            {part.looked ? "✓ Confirmed" : "Confirm"}
          </Button>
        )
      )}
    </div>
  );
};

export function ExtractionValidation(props: ExtractionValidationProps) {
  const {
    title,
    subtitle,
    facts = [],
    proposedBy,
    fields,
    lineItems = [],
    show = {},
    copy,
    aside,
    className,
    renderField,
    reasonOptions = DOCUMENT_REASONS,
    outcomes = DOCUMENT_OUTCOMES,
    readOnly,
    reviewerId = "",
    saved,
    onChange,
    onComplete,
  } = props;
  const showConfidence = show.confidence !== false;
  const lineId = (itemId: string, f: ValueField) => `line.${itemId}.${f.id}`;
  const seeds: ReviewSeed[] = [
    ...fields.map((f) => ({
      id: headerId(f),
      label: f.label,
      kind: "header",
      proposed: f.value,
      confidence: f.confidence,
    })),
    ...lineItems.flatMap((item, i) =>
      item.fields.map((f) => ({
        id: lineId(item.id, f),
        label: `Line ${i + 1} · ${f.label}`,
        kind: "lineItem",
        proposed: f.value,
        confidence: f.confidence,
      })),
    ),
  ];
  const low = seeds.filter((s) => (s.confidence ?? 100) < LOW_CONFIDENCE);

  const model = useDecisionCapture({
    spec: {
      outcomes,
      recommended: recommendedId(outcomes),
      proposedBy,
      reasons: low.map((s) => ({
        id: `low-${s.id}`,
        title: `Low confidence on ${s.label}`,
        detail: `Extracted with ${s.confidence}% confidence.`,
        partId: s.id,
        source: proposedBy,
        confidence: s.confidence,
      })),
    },
    seeds,
    readOnly,
    reviewerId,
    saved,
    onChange,
    onComplete,
  });
  const partOf = (id: string) => model.parts.find((p) => p.id === id);

  return (
    <div
      ref={(el) => model.setRoot(el)}
      className={cn(
        "uipath-decisions-and-reasons min-w-0 text-sm",
        aside && "grid items-start gap-4 lg:grid-cols-2",
        className,
      )}
    >
      <div className="min-w-0 space-y-4">
        <Card className="space-y-1 p-5" data-signal-evidence="context">
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-semibold">{title}</span>
            <Badge variant="secondary">
              {model.done ? "Completed" : "Pending"}
            </Badge>
          </div>
          {(proposedBy || subtitle) && (
            <p className="text-xs text-muted-foreground">
              {proposedBy && <>Extracted by {proposedBy}</>}
              {subtitle && <> · {subtitle}</>}
            </p>
          )}
          <p className="text-xs">
            {facts.map((f) => (
              <span key={f.label} className="mr-4">
                <span className="mr-1 text-muted-foreground">{f.label}</span>
                {f.value}
              </span>
            ))}
            {showConfidence && (
              <>
                <span className="mr-1 text-muted-foreground">
                  Below {LOW_CONFIDENCE}% confidence
                </span>
                {low.length}
              </>
            )}
          </p>
        </Card>
        <Card className="space-y-3 p-5">
          <h3 className="text-base font-semibold">Header</h3>
          <p className="text-xs text-muted-foreground">
            Confirm each value or correct it.
            {showConfidence && " Highlighted values have low confidence."}
          </p>
          <div className="grid gap-2 sm:grid-cols-2">
            {fields.map((f) => {
              const part = partOf(headerId(f));
              if (!part) return null;
              const node = (
                <HeaderCell
                  model={model}
                  part={part}
                  reasonOptions={reasonOptions}
                  showConfidence={showConfidence}
                />
              );
              return (
                <Fragment key={f.id}>
                  {renderField ? renderField(f, node) : node}
                </Fragment>
              );
            })}
          </div>
        </Card>
        {lineItems.length > 0 && (
          <LineItems
            model={model}
            lineItems={lineItems}
            partFor={(item, f) => partOf(lineId(item.id, f))}
            reasonOptions={reasonOptions}
            showConfidence={showConfidence}
          />
        )}
        <OutcomePicker model={model} noun={copy?.outcome ?? "Outcome"} />
        <ChangesSummary
          model={model}
          noun={copy?.outcome ?? "Outcome"}
          copy={copy}
          showRecord={show.record}
          reviewerId={reviewerId}
        />
      </div>
      {aside}
    </div>
  );
}
