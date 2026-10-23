import { useId } from "react";
import type { FC } from "react";
import { Badge, Card, Input, Label, Textarea, cn } from "@uipath/apollo-wind";
import { NextTimeSection } from "./NextTimeSection";
import { ReasonsSection } from "./ReasonsSection";
import { ChangesSummary } from "../shared/ChangesSummary";
import { OutcomePicker } from "../shared/OutcomePicker";
import { useDecisionCapture } from "../../hooks/useDecisionCapture";
import type { ReviewModel } from "../../hooks/useDecisionCapture";
import type {
  CaseField,
  CaseAssessmentProps,
  ReviewPart,
} from "../../models/decision";
import { outcomeLabel, partChanged, recommendedId } from "../../utils/changes";

const FinalField: FC<{
  model: ReviewModel;
  field: CaseField;
  part: ReviewPart;
  renderField: CaseAssessmentProps["renderField"];
}> = ({ model, field, part, renderField }) => {
  const id = useId();
  const long = field.kind === "long";
  const control = {
    id,
    "data-signal-field": field.id,
    disabled: model.locked,
    value: part.value,
    onFocus: () => model.lookAt(field.id),
    onChange: (e: { target: { value: string } }) =>
      model.edit(field.id, e.target.value),
    onBlur: () => model.settle(field.id),
  };
  const node = (
    <div className={cn("space-y-1", long && "sm:col-span-2")}>
      <Label htmlFor={id} className="text-xs font-medium text-muted-foreground">
        {field.label}
      </Label>
      {long ? (
        <Textarea rows={3} {...control} />
      ) : (
        <div className="flex items-center gap-1.5">
          {field.kind === "money" && (
            <span className="text-xs text-muted-foreground">$</span>
          )}
          <Input {...control} />
        </div>
      )}
      {partChanged(part) && (
        <p className="text-xs text-muted-foreground">
          Proposed: {part.proposed || "—"}
        </p>
      )}
    </div>
  );
  return <>{renderField ? renderField(field, node) : node}</>;
};

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
    seeds: fields.map((f) => ({
      id: f.id,
      label: f.label,
      kind: f.kind,
      proposed: f.byOutcome[recommended] ?? "",
      byOutcome: f.byOutcome,
    })),
    readOnly,
    reviewerId,
    saved,
    logEdits: false,
    onChange,
    onComplete,
  });
  const { done, locked, hasChange, state, outcome, spec } = model;
  const noun = copy?.outcome ?? "Decision";

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
            <Badge variant="secondary">{done ? "Completed" : "Pending"}</Badge>
          </div>
          {(proposedBy || subtitle) && (
            <p className="flex gap-1 text-xs text-muted-foreground">
              {proposedBy && <span>Proposed by {proposedBy}</span>}
              {subtitle && <span>· {subtitle}</span>}
            </p>
          )}
          <div className="grid gap-x-6 gap-y-1 text-xs sm:grid-cols-3">
            {facts.map((f) => (
              <div key={f.label}>
                <span className="mr-1 text-muted-foreground">{f.label}</span>
                {f.value}
              </div>
            ))}
          </div>
        </Card>
        <ReasonsSection model={model} reasonOptions={reasonOptions} />
        <OutcomePicker model={model} noun={noun}>
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
                {fields.map((f) => {
                  const part = model.parts.find((p) => p.id === f.id);
                  return (
                    part && (
                      <FinalField
                        key={f.id}
                        model={model}
                        field={f}
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
        {spec.nextTime?.options.length &&
        (hasChange || (locked && state.lesson)) ? (
          <NextTimeSection model={model} />
        ) : null}
        <ChangesSummary
          model={model}
          noun={noun}
          copy={copy}
          showRecord={show.record}
          reviewerId={reviewerId}
        />
      </div>
      {aside}
    </div>
  );
}
