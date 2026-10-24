import { Fragment, useId } from "react";
import type { FC } from "react";
import { Badge, Card, Label, Textarea, cn } from "@uipath/apollo-wind";
import { ChangesSummary } from "../shared/ChangesSummary";
import { OutcomePicker } from "../shared/OutcomePicker";
import { ReasonChips } from "../shared/ReasonChips";
import { useDecisionCapture } from "../../hooks/useDecisionCapture";
import type { ReviewModel } from "../../hooks/useDecisionCapture";
import { DRAFT_EDIT_REASONS, DRAFT_OUTCOMES } from "../../models/constants";
import type {
  DraftEditingProps,
  ReviewPart,
  ReviewShow,
} from "../../models/decision";
import { fieldHow, partChanged, recommendedId } from "../../utils/changes";

const SIZE_LABEL = {
  Kept: "Kept",
  "Lightly edited": "Lightly edited",
  Rewritten: "Rewritten",
  Rejected: "Cleared",
  Added: "Kept",
  Untouched: "Kept",
} as const;

const DraftArea: FC<{
  model: ReviewModel;
  part: ReviewPart;
  show: ReviewShow;
  reasonOptions: readonly string[];
}> = ({ model, part, show, reasonOptions }) => {
  const id = useId();
  const changed = partChanged(part);
  const size = SIZE_LABEL[fieldHow(part.proposed, part.value, true)];

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <Label
          htmlFor={id}
          className="text-xs font-medium text-muted-foreground"
        >
          {part.label}
        </Label>
        <Badge variant={changed ? "outline" : "secondary"}>{size}</Badge>
      </div>
      <Textarea
        id={id}
        rows={8}
        data-signal-field={part.id}
        disabled={model.locked}
        value={part.value}
        onFocus={() => model.lookAt(part.id)}
        onChange={(e) => model.edit(part.id, e.target.value)}
        onBlur={() => model.settle(part.id)}
      />
      {changed && show.comparison !== false && (
        <div className="space-y-1 rounded-md bg-muted/50 p-2">
          <p className="text-xs font-medium text-muted-foreground">
            Original draft
          </p>
          <p className="whitespace-pre-wrap text-xs">{part.proposed}</p>
        </div>
      )}
      {changed && (
        <ReasonChips
          question={`${part.label}: why the edit?`}
          options={reasonOptions}
          pick={{ why: part.why, note: part.note }}
          disabled={model.locked}
          onToggle={(why) => model.toggleWhy(part.id, why)}
          onNote={(note) => model.editNote(part.id, note)}
        />
      )}
    </div>
  );
};

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
  const model = useDecisionCapture({
    spec: {
      outcomes,
      recommended: recommendedId(outcomes),
      proposedBy,
      reasons: [],
    },
    seeds: fields.map((f) => ({
      id: f.id,
      label: f.label,
      kind: "long",
      proposed: f.value,
      confidence: f.confidence,
    })),
    readOnly,
    reviewerId,
    saved,
    onChange,
    onComplete,
  });
  const noun = copy?.outcome ?? "Outcome";

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
          {proposedBy && (
            <p className="text-xs text-muted-foreground">
              Drafted by {proposedBy}
            </p>
          )}
          {subtitle && <p className="text-sm font-semibold">{subtitle}</p>}
          {facts.length > 0 && (
            <p className="text-xs text-muted-foreground">
              {facts.map((f) => f.value).join(" · ")}
            </p>
          )}
          {excerpt && (
            <p className="rounded-md bg-muted/50 p-2 text-xs">{excerpt}</p>
          )}
        </Card>
        <Card className="space-y-4 p-5">
          <h3 className="text-base font-semibold">Draft</h3>
          <p className="text-xs text-muted-foreground">
            Edit the text if it needs changing. The original is kept.
          </p>
          {fields.map((f) => {
            const part = model.parts.find((p) => p.id === f.id);
            if (!part) return null;
            const node = (
              <DraftArea
                model={model}
                part={part}
                show={show}
                reasonOptions={reasonOptions}
              />
            );
            return (
              <Fragment key={f.id}>
                {renderField ? renderField(f, node) : node}
              </Fragment>
            );
          })}
        </Card>
        <OutcomePicker model={model} noun={noun} />
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
