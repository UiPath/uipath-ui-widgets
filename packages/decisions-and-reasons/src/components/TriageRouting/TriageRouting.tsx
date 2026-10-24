import { Fragment } from "react";
import { Badge, Button, Card, cn } from "@uipath/apollo-wind";
import { ChangesSummary } from "../shared/ChangesSummary";
import { OutcomePicker } from "../shared/OutcomePicker";
import { ReasonChips } from "../shared/ReasonChips";
import { useDecisionCapture } from "../../hooks/useDecisionCapture";
import { TRIAGE_OUTCOMES, LOW_CONFIDENCE } from "../../models/constants";
import type { TriageRoutingProps } from "../../models/decision";
import { partChanged, recommendedId } from "../../utils/changes";

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
    reasonOptions,
    outcomes = TRIAGE_OUTCOMES,
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
      reasons: labels.map((l) => ({
        id: `reason-${l.id}`,
        title: l.reason,
        detail: `Proposed ${l.label.toLowerCase()}: ${l.proposed}`,
        partId: l.id,
        source: proposedBy,
        confidence: l.confidence,
      })),
    },
    seeds: labels.map((l) => ({
      id: l.id,
      label: l.label,
      kind: "classification",
      proposed: l.proposed,
      confidence: l.confidence,
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
              Labelled by {proposedBy}
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
        <Card className="space-y-3 p-5">
          <h3 className="text-base font-semibold">Proposed labels</h3>
          <div className="rounded-lg border border-border-de-emp">
            {labels.map((l) => {
              const part = model.parts.find((p) => p.id === l.id);
              if (!part) return null;
              const row = (
                <div className="space-y-2 border-b border-border-de-emp p-3 last:border-b-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-sm font-semibold">{l.label}</span>
                    {show.confidence !== false &&
                      l.confidence !== undefined && (
                        <Badge
                          variant="outline"
                          className={cn(
                            "tabular-nums",
                            l.confidence < LOW_CONFIDENCE &&
                              "border-warning-icon bg-warning-background",
                          )}
                        >
                          {l.confidence}%
                        </Badge>
                      )}
                  </div>
                  <p
                    className="text-xs text-muted-foreground"
                    data-signal-evidence={l.id}
                  >
                    Proposed {l.proposed}: {l.reason}
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {l.options.map((option) => (
                      <Button
                        key={option}
                        data-signal-field={l.id}
                        variant="outline"
                        size="xs"
                        disabled={model.locked}
                        aria-pressed={part.value === option}
                        onClick={() => model.pick(l.id, option)}
                        className={cn(
                          "gap-1.5",
                          part.value === option
                            ? "border-primary bg-primary/5 ring-2 ring-primary/25"
                            : "hover:border-primary/40",
                        )}
                      >
                        {option}
                        {option === l.proposed && (
                          <span className="text-muted-foreground">
                            Proposed
                          </span>
                        )}
                      </Button>
                    ))}
                  </div>
                  {partChanged(part) ? (
                    <ReasonChips
                      question={`Why ${part.value}?`}
                      options={l.changeReasons ?? reasonOptions ?? []}
                      pick={{ why: part.why, note: part.note }}
                      disabled={model.locked}
                      onToggle={(why) => model.toggleWhy(l.id, why)}
                      onNote={(note) => model.editNote(l.id, note)}
                    />
                  ) : (
                    !model.locked && (
                      <Button
                        variant="link"
                        aria-pressed={part.looked}
                        aria-label={`Confirm ${l.label}`}
                        className="h-auto p-0 text-xs"
                        onClick={() => model.lookAt(l.id)}
                      >
                        {part.looked ? "✓ Confirmed" : "Looks right"}
                      </Button>
                    )
                  )}
                </div>
              );
              return (
                <Fragment key={l.id}>
                  {renderField ? renderField(l, row) : row}
                </Fragment>
              );
            })}
          </div>
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
