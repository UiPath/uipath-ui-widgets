import { Fragment } from "react";
import { Card } from "@uipath/apollo-wind";
import { DraftArea } from "./DraftArea";
import { DRAFT_EDIT_REASONS, DRAFT_OUTCOMES } from "./defaults";
import type { DraftEditingProps } from "./types";
import { ChangesSummary } from "../shared/ChangesSummary";
import { OutcomePicker } from "../shared/OutcomePicker";
import { ReviewShell } from "../shared/ReviewShell";
import { ReviewSummary } from "../shared/ReviewSummary";
import { useDecisionCapture } from "../../hooks/useDecisionCapture";
import { recommendedId } from "../../utils/outcomes";

export function DraftEditing(props: DraftEditingProps) {
  const {
    title,
    subtitle,
    facts = [],
    excerpt,
    proposedBy,
    fields,
    show = {},
    copy,
    aside,
    className,
    renderField,
    reasonOptions = DRAFT_EDIT_REASONS,
    outcomes = DRAFT_OUTCOMES,
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
      reasons: [],
    },
    seeds: fields.map((field) => ({
      id: field.id,
      label: field.label,
      kind: "long",
      proposed: field.value,
      confidence: field.confidence,
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
        proposedByVerb="Drafted by"
        facts={facts}
        excerpt={excerpt}
      />
      <Card className="space-y-4 p-5">
        <h3 className="text-base font-semibold">Draft</h3>
        <p className="text-xs text-muted-foreground">
          Edit the text if it needs changing. The original is kept.
        </p>
        {fields.map((field) => {
          const part = model.findPart(field.id);
          if (!part) return null;
          const node = (
            <DraftArea part={part} show={show} reasonOptions={reasonOptions} />
          );
          return (
            <Fragment key={field.id}>
              {renderField ? renderField(field, node) : node}
            </Fragment>
          );
        })}
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
