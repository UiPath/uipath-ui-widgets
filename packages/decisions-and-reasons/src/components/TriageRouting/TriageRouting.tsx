import { Fragment } from "react";
import { Card } from "@uipath/apollo-wind";
import { LabelRow } from "./LabelRow";
import { TRIAGE_OUTCOMES } from "./defaults";
import type { TriageRoutingProps } from "./types";
import { ChangesSummary } from "../shared/ChangesSummary";
import { OutcomePicker } from "../shared/OutcomePicker";
import { ReviewShell } from "../shared/ReviewShell";
import { ReviewSummary } from "../shared/ReviewSummary";
import { useDecisionCapture } from "../../hooks/useDecisionCapture";
import { recommendedId } from "../../utils/outcomes";

export function TriageRouting(props: TriageRoutingProps) {
  const {
    title,
    subtitle,
    facts = [],
    excerpt,
    proposedBy,
    labels,
    show = {},
    copy,
    aside,
    className,
    renderField,
    reasonOptions = [],
    outcomes = TRIAGE_OUTCOMES,
    readOnly,
    reviewerId = "",
    saved,
    onChange,
    onComplete,
  } = props;
  const noun = copy?.outcome ?? "Outcome";
  const model = useDecisionCapture({
    spec: {
      outcomes,
      recommended: recommendedId(outcomes),
      proposedBy,
      reasons: labels.map((label) => ({
        id: `reason-${label.id}`,
        title: label.reason,
        detail: `Proposed ${label.label.toLowerCase()}: ${label.proposed}`,
        partId: label.id,
        source: proposedBy,
        confidence: label.confidence,
      })),
    },
    seeds: labels.map((label) => ({
      id: label.id,
      label: label.label,
      kind: "classification",
      proposed: label.proposed,
      confidence: label.confidence,
    })),
    readOnly,
    reviewerId,
    saved,
    onChange,
    onComplete,
  });

  return (
    <ReviewShell model={model} aside={aside} className={className}>
      <ReviewSummary
        title={title}
        subtitle={subtitle}
        proposedBy={proposedBy}
        proposedByVerb="Labelled by"
        facts={facts}
        excerpt={excerpt}
      />
      <Card className="space-y-3 p-5">
        <h3 className="text-base font-semibold">Proposed labels</h3>
        <div className="rounded-lg border border-border-de-emp">
          {labels.map((label) => {
            const part = model.findPart(label.id);
            if (!part) return null;
            const row = (
              <LabelRow
                label={label}
                part={part}
                reasonOptions={reasonOptions}
                showConfidence={show.confidence !== false}
              />
            );
            return (
              <Fragment key={label.id}>
                {renderField ? renderField(label, row) : row}
              </Fragment>
            );
          })}
        </div>
      </Card>
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
