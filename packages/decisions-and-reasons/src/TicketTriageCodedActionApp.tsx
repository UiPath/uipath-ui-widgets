import type { FC } from "react";
import { Badge, Button, Card, cn } from "@uipath/apollo-wind";
import { useUseCaseCapture } from "./reviewModel";
import type { UseCaseCaptureModel } from "./reviewModel";
import {
  ConfidenceBadge,
  OutcomeCard,
  ReasonChips,
  UseCaseRoot,
} from "./UseCaseParts";
import { TRIAGE_SEND_BACK_REASONS } from "./types";
import type { PartSeed, UseCasePart, UseCaseProps, UseCaseSpec } from "./types";

export type TriageDimension = {
  id: string;
  label: string;
  options: string[];
  proposed: string;
  confidence?: number;
  reason: string;
  changeReasons: string[];
};

export type TicketTriageData = {
  ticketId: string;
  subject: string;
  requester: string;
  channel: string;
  excerpt: string;
  proposedBy?: string;
  recommendedOutcome: "Confirm" | "SendBack";
  dimensions: TriageDimension[];
};

const seedsOf = (data: TicketTriageData): PartSeed[] =>
  data.dimensions.map((d) => ({
    id: d.id,
    label: d.label,
    kind: "classification",
    proposed: d.proposed,
    confidence: d.confidence,
  }));

const specOf = (data: TicketTriageData): UseCaseSpec => ({
  recommended: data.recommendedOutcome,
  proposedBy: data.proposedBy,
  outcomes: [
    {
      id: "Confirm",
      label: "Confirm",
      description: "Apply the classification and route the ticket.",
    },
    {
      id: "SendBack",
      label: "Send back",
      description: "Return the ticket for more information.",
      reasons: TRIAGE_SEND_BACK_REASONS,
    },
  ],
  reasons: data.dimensions.map((d) => ({
    id: `reason-${d.id}`,
    title: d.reason,
    detail: `Proposed ${d.label.toLowerCase()}: ${d.proposed}`,
    partId: d.id,
    source: data.proposedBy,
    confidence: d.confidence,
  })),
});

const DimensionRow: FC<{
  model: UseCaseCaptureModel;
  dimension: TriageDimension;
  part: UseCasePart;
}> = ({ model, dimension, part }) => {
  const changed = part.value !== part.proposed;

  return (
    <div className="space-y-2 border-b border-border-de-emp p-3 last:border-b-0">
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-sm font-semibold">{dimension.label}</span>
        <ConfidenceBadge value={dimension.confidence} />
      </div>
      <p
        className="text-xs text-muted-foreground"
        data-signal-evidence={dimension.id}
      >
        Proposed {part.proposed}: {dimension.reason}
      </p>
      <div className="flex flex-wrap gap-1.5">
        {dimension.options.map((option) => (
          <Button
            key={option}
            data-signal-field={dimension.id}
            variant="outline"
            size="xs"
            disabled={model.locked}
            aria-pressed={part.value === option}
            onClick={() => model.pick(dimension.id, option)}
            className={cn(
              "gap-1.5",
              part.value === option
                ? "border-primary bg-primary/5 ring-2 ring-primary/25"
                : "hover:border-primary/40",
            )}
          >
            {option}
            {option === part.proposed && (
              <span className="text-muted-foreground">Proposed</span>
            )}
          </Button>
        ))}
      </div>
      {changed ? (
        <ReasonChips
          question={`Why ${part.value}?`}
          options={dimension.changeReasons}
          pick={{ why: part.why, note: part.note }}
          disabled={model.locked}
          onToggle={(why) => model.toggleWhy(dimension.id, why)}
          onNote={(note) => model.editNote(dimension.id, note)}
        />
      ) : (
        !model.locked && (
          <Button
            variant="link"
            aria-pressed={part.looked}
            aria-label={`Confirm ${dimension.label}`}
            className="h-auto p-0 text-xs"
            onClick={() => model.lookAt(dimension.id)}
          >
            {part.looked ? "✓ Confirmed" : "Looks right"}
          </Button>
        )
      )}
    </div>
  );
};

export function TicketTriageCodedActionApp(
  props: UseCaseProps<TicketTriageData>,
) {
  const { data, readOnly, reviewerId, saved, onChange, onComplete } = props;
  const model = useUseCaseCapture({
    spec: specOf(data),
    seeds: seedsOf(data),
    readOnly,
    reviewerId,
    saved,
    onChange,
    onComplete,
  });
  const byId = new Map(model.parts.map((p) => [p.id, p]));

  return (
    <UseCaseRoot model={model}>
      <Card className="space-y-1 p-5" data-signal-evidence="context">
        <div className="flex items-center justify-between gap-2">
          <span className="text-xs font-semibold">Ticket {data.ticketId}</span>
          <Badge variant="secondary">
            {model.done ? "Completed" : "Pending"}
          </Badge>
        </div>
        {data.proposedBy && (
          <p className="text-xs text-muted-foreground">
            Triaged by {data.proposedBy}
          </p>
        )}
        <p className="text-sm font-semibold">{data.subject}</p>
        <p className="text-xs text-muted-foreground">
          {data.requester} · {data.channel}
        </p>
        <p className="rounded-md bg-muted/50 p-2 text-xs">{data.excerpt}</p>
      </Card>
      <Card className="space-y-3 p-5">
        <h3 className="text-base font-semibold">Proposed triage</h3>
        <div className="rounded-lg border border-border-de-emp">
          {data.dimensions.map((d) => {
            const part = byId.get(d.id);
            return (
              part && (
                <DimensionRow
                  key={d.id}
                  model={model}
                  dimension={d}
                  part={part}
                />
              )
            );
          })}
        </div>
      </Card>
      <OutcomeCard model={model} />
    </UseCaseRoot>
  );
}
