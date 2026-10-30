import { Fragment } from "react";
import { Card } from "@uipath/apollo-wind";
import { HeaderCell } from "./HeaderCell";
import { LineItems } from "./LineItems";
import { DOCUMENT_OUTCOMES } from "./defaults";
import { headerId, lowConfidenceReason, seedsOf } from "./extraction";
import type { ExtractionValidationProps } from "./types";
import { ChangesSummary } from "../shared/ChangesSummary";
import { ContextHeader } from "../shared/ContextHeader";
import { OutcomePicker } from "../shared/OutcomePicker";
import { ReviewShell } from "../shared/ReviewShell";
import { useDecisionCapture } from "../../hooks/useDecisionCapture";
import { DOCUMENT_REASONS, LOW_CONFIDENCE } from "../../models/constants";
import { isLowConfidence } from "../../utils/confidence";
import { recommendedId } from "../../utils/outcomes";
import { signal } from "../../utils/signals";

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
  const noun = copy?.outcome ?? "Outcome";
  const seeds = seedsOf(fields, lineItems);
  const lowSeeds = seeds.filter((seed) => isLowConfidence(seed.confidence));

  const model = useDecisionCapture({
    spec: {
      outcomes,
      recommended: recommendedId(outcomes),
      proposedBy,
      reasons: lowSeeds.map((seed) => lowConfidenceReason(seed, proposedBy)),
    },
    seeds,
    readOnly,
    reviewerId,
    saved,
    onChange,
    onComplete,
  });

  return (
    <ReviewShell model={model} aside={aside} className={className}>
      <Card className="space-y-1 p-5" {...signal.evidence("context")}>
        <ContextHeader title={title} />
        {(proposedBy || subtitle) && (
          <p className="text-xs text-muted-foreground">
            {proposedBy && <>Extracted by {proposedBy}</>}
            {subtitle && <> · {subtitle}</>}
          </p>
        )}
        <p className="text-xs">
          {facts.map((fact) => (
            <span key={fact.label} className="mr-4">
              <span className="mr-1 text-muted-foreground">{fact.label}</span>
              {fact.value}
            </span>
          ))}
          {showConfidence && (
            <>
              <span className="mr-1 text-muted-foreground">
                Below {LOW_CONFIDENCE}% confidence
              </span>
              {lowSeeds.length}
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
          {fields.map((field) => {
            const part = model.findPart(headerId(field));
            if (!part) return null;
            const node = (
              <HeaderCell
                part={part}
                reasonOptions={reasonOptions}
                showConfidence={showConfidence}
              />
            );
            return (
              <Fragment key={field.id}>
                {renderField ? renderField(field, node) : node}
              </Fragment>
            );
          })}
        </div>
      </Card>
      {lineItems.length > 0 && (
        <LineItems
          lineItems={lineItems}
          reasonOptions={reasonOptions}
          showConfidence={showConfidence}
        />
      )}
      <OutcomePicker noun={noun} />
      <ChangesSummary
        noun={noun}
        copy={copy}
        showRecord={show.record}
        reviewerId={reviewerId}
      />
    </ReviewShell>
  );
}
