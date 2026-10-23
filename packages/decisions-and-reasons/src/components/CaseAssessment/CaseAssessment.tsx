import { Card } from "@uipath/apollo-wind";
import { FinalField } from "./FinalField";
import type { CaseAssessmentProps } from "./types";
import { ChangesSummary } from "../shared/ChangesSummary";
import { ContextHeader } from "../shared/ContextHeader";
import { NextTimeSection } from "../shared/NextTimeSection";
import { OutcomePicker } from "../shared/OutcomePicker";
import { ReasonsSection } from "../shared/ReasonsSection";
import { ReviewShell } from "../shared/ReviewShell";
import { useDecisionCapture } from "../../hooks/useDecisionCapture";
import { outcomeLabel, recommendedId } from "../../utils/outcomes";
import { signal } from "../../utils/signals";

export function CaseAssessment(props: CaseAssessmentProps) {
  const {
    title,
    subtitle,
    facts = [],
    proposedBy,
    outcomes,
    reasons,
    fields = [],
    nextTime,
    show = {},
    copy,
    aside,
    className,
    reasonOptions,
    renderField,
    readOnly,
    reviewerId = "",
    saved,
    onChange,
    onComplete,
  } = props;
  const recommended = recommendedId(outcomes);
  const model = useDecisionCapture({
    spec: {
      outcomes,
      recommended,
      proposedBy,
      reasons,
      weighted: true,
      nextTime: show.nextTime === false ? undefined : nextTime,
    },
    seeds: fields.map((field) => ({
      id: field.id,
      label: field.label,
      kind: field.kind,
      proposed: field.byOutcome[recommended] ?? "",
      byOutcome: field.byOutcome,
    })),
    readOnly,
    reviewerId,
    saved,
    logEdits: false,
    onChange,
    onComplete,
  });
  const { locked, hasChange, state, outcome, spec } = model;
  const noun = copy?.outcome ?? "Decision";
  const showNextTime =
    !!spec.nextTime?.options.length &&
    (hasChange || (locked && !!state.lesson));

  return (
    <ReviewShell model={model} aside={aside} className={className}>
      <Card className="space-y-1 p-5" {...signal.evidence("context")}>
        <ContextHeader title={title} />
        {(proposedBy || subtitle) && (
          <p className="flex gap-1 text-xs text-muted-foreground">
            {proposedBy && <span>Proposed by {proposedBy}</span>}
            {subtitle && <span>· {subtitle}</span>}
          </p>
        )}
        <div className="grid gap-x-6 gap-y-1 text-xs sm:grid-cols-3">
          {facts.map((fact) => (
            <div key={fact.label}>
              <span className="mr-1 text-muted-foreground">{fact.label}</span>
              {fact.value}
            </div>
          ))}
        </div>
      </Card>
      <ReasonsSection reasonOptions={reasonOptions} />
      <OutcomePicker noun={noun}>
        {fields.length > 0 && (
          <div className="space-y-3 border-t border-border-de-emp pt-3">
            <p className="text-xs text-muted-foreground">
              Final details
              {outcome && outcome !== recommended && (
                <>, set for {outcomeLabel(spec, outcome)}</>
              )}
              . Edit any of them.
            </p>
            <div className="grid gap-3 sm:grid-cols-2">
              {fields.map((field) => {
                const part = model.findPart(field.id);
                return (
                  part && (
                    <FinalField
                      key={field.id}
                      field={field}
                      part={part}
                      renderField={renderField}
                    />
                  )
                );
              })}
            </div>
          </div>
        )}
      </OutcomePicker>
      {showNextTime && <NextTimeSection />}
      <ChangesSummary
        noun={noun}
        copy={copy}
        showRecord={show.record}
        reviewerId={reviewerId}
      />
    </ReviewShell>
  );
}
