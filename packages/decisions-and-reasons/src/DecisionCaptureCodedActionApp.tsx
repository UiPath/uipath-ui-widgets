import { useId } from "react";
import type { FC } from "react";
import {
  Badge,
  Button,
  Card,
  cn,
  Input,
  Label,
  Textarea,
  ToggleGroup,
  ToggleGroupItem,
} from "@uipath/apollo-wind";
import { ChangesCard } from "./ChangesCard";
import { Chip } from "./DocumentReasonRow";
import { ReasonsCard } from "./ReasonsCard";
import {
  decisionLabel,
  fieldLookKey,
  fieldProposed,
  fieldValue,
  useDecisionCaptureCodedActionApp,
} from "./reviewModel";
import type { DecisionCaptureCodedActionAppModel } from "./reviewModel";
import { DECISIONS, SCOPES } from "./types";
import type {
  ClaimData,
  DecisionCaptureCodedActionAppProps,
  FinalDetailField,
} from "./types";

const FieldRow: FC<{
  model: DecisionCaptureCodedActionAppModel;
  field: FinalDetailField;
}> = ({ model, field }) => {
  const { agent, state, locked, lookAt, editField, commitField } = model;
  const id = useId();
  const v = fieldValue(field, state, agent);
  const proposed = fieldProposed(field, agent);
  const long = field.kind === "long";
  const control = {
    id,
    "data-signal-field": field.id,
    disabled: locked,
    value: v,
    onFocus: () => lookAt(fieldLookKey(field.id)),
    onChange: (e: { target: { value: string } }) =>
      editField(field.id, e.target.value),
    onBlur: () => commitField(field.id),
  };

  return (
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
      {state.fieldVals[field.id] !== undefined && v !== proposed && (
        <p className="text-xs text-muted-foreground">
          Proposed: {proposed || "—"}
        </p>
      )}
    </div>
  );
};

export const DecisionCard: FC<{
  model: DecisionCaptureCodedActionAppModel;
}> = ({ model }) => {
  const { agent, fields, state, locked, choose } = model;
  const { decision } = state;

  return (
    <Card className="space-y-3 p-5">
      <h3 className="flex flex-wrap items-center gap-2 text-base font-semibold">
        Decision <span className="font-normal text-muted-foreground">·</span>
        <span className={cn(!decision && "font-medium text-muted-foreground")}>
          {decision ? decisionLabel(decision) : "No decision selected"}
        </span>
        {decision === agent && <Badge variant="secondary">Recommended</Badge>}
      </h3>
      <div className="grid gap-2 sm:grid-cols-3">
        {DECISIONS.map((d) => (
          <Button
            key={d.id}
            data-signal-outcome={d.id}
            data-signal-recommended={d.id === agent ? "" : undefined}
            variant="outline"
            disabled={locked}
            aria-pressed={decision === d.id}
            onClick={() => choose(d.id)}
            className={cn(
              "h-auto flex-col items-start justify-start gap-1 whitespace-normal p-3 text-left",
              decision === d.id
                ? "border-primary ring-2 ring-primary/25"
                : "hover:border-primary/40",
            )}
          >
            <span className="flex flex-wrap items-center gap-2 text-sm font-semibold">
              {d.t}
              {d.id === agent && <Badge variant="secondary">Recommended</Badge>}
            </span>
            <span className="block text-xs font-normal text-muted-foreground">
              {d.d}
            </span>
          </Button>
        ))}
      </div>
      {fields.length > 0 && (
        <div className="space-y-3 border-t border-border-de-emp pt-3">
          <p className="text-xs text-muted-foreground">
            Final details
            {decision && decision !== agent && (
              <>, set for {decisionLabel(decision)}</>
            )}
            . Edit any of them.
          </p>
          <div className="grid gap-3 sm:grid-cols-2">
            {fields.map((f) => (
              <FieldRow key={f.id} model={model} field={f} />
            ))}
          </div>
        </div>
      )}
    </Card>
  );
};

export const NextTimeCard: FC<{
  model: DecisionCaptureCodedActionAppModel;
  data: ClaimData;
}> = ({ model, data }) => {
  const { state, locked, pickLesson, chooseScope, toggleCondition } = model;
  const { lesson, scope, conds } = state;

  return (
    <Card className="space-y-3 p-5">
      <h3 className="flex items-center text-base font-semibold">Next time</h3>
      <div className="grid gap-2 sm:grid-cols-2">
        {data.nextTimeOptions.map((l) => (
          <Button
            key={l.id}
            variant="outline"
            disabled={locked}
            aria-pressed={lesson === l.id}
            onClick={() => pickLesson(l.id)}
            className={cn(
              "h-auto flex-col items-start justify-start gap-1 whitespace-normal p-3 text-left",
              lesson === l.id
                ? "border-2 border-primary bg-primary/5"
                : "border-dashed hover:border-primary",
            )}
          >
            <span className="text-sm font-semibold">{l.text}</span>
            <span className="text-xs font-normal text-muted-foreground">
              {l.basis}
            </span>
          </Button>
        ))}
      </div>
      {lesson && (
        <>
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs text-muted-foreground">Applies to</span>
            <ToggleGroup
              type="single"
              variant="outline"
              size="xs"
              disabled={locked}
              value={scope}
              onValueChange={(id) => {
                const next = SCOPES.find((x) => x.id === id);
                if (next) chooseScope(next.id);
              }}
            >
              {SCOPES.map((x) => (
                <ToggleGroupItem key={x.id} value={x.id}>
                  {x.label}
                </ToggleGroupItem>
              ))}
            </ToggleGroup>
          </div>
          {scope === "like" && (
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs text-muted-foreground">Claims that</span>
              {data.conditionOptions.map((k) => (
                <Chip
                  key={k.id}
                  disabled={locked}
                  pressed={!!conds[k.id]}
                  onToggle={() => toggleCondition(k.id)}
                >
                  {conds[k.id] ? "✓" : "+"} {k.label}
                </Chip>
              ))}
            </div>
          )}
        </>
      )}
    </Card>
  );
};

const USD = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  minimumFractionDigits: 0,
  maximumFractionDigits: 3,
});

export function DecisionCaptureCodedActionApp(
  props: DecisionCaptureCodedActionAppProps,
) {
  const { data, showRecord = false, reviewerId = "" } = props;
  const model = useDecisionCaptureCodedActionApp(props);
  const { done, locked, hasChange, state, setRoot } = model;

  return (
    <div
      ref={(el) => setRoot(el)}
      className="uipath-decisions-and-reasons min-w-0 space-y-4 text-sm"
    >
      <Card className="space-y-1 p-5" data-signal-evidence="context">
        <div className="flex items-center justify-between gap-2">
          <span className="text-xs font-semibold">
            Warranty claim {data.claimId}
          </span>
          <Badge variant="secondary">{done ? "Completed" : "Pending"}</Badge>
        </div>
        {data.proposedBy && (
          <p className="flex gap-1 text-xs text-muted-foreground">
            <span>Proposed by {data.proposedBy}</span>
            {data.involvement && <span>· {data.involvement}</span>}
          </p>
        )}
        <div className="grid gap-x-6 gap-y-1 text-xs sm:grid-cols-3">
          <div>
            <span className="mr-1 text-muted-foreground">Customer</span>
            {data.customer}
          </div>
          <div>
            <span className="mr-1 text-muted-foreground">Claim</span>
            {USD.format(data.claimAmount)}
          </div>
          <div>
            <span className="mr-1 text-muted-foreground">Plan ceiling</span>
            {USD.format(data.planCeiling)}
          </div>
        </div>
      </Card>
      <ReasonsCard model={model} />
      <DecisionCard model={model} />
      {(hasChange || (locked && state.lesson)) &&
        data.nextTimeOptions.length > 0 && (
          <NextTimeCard model={model} data={data} />
        )}
      <ChangesCard
        model={model}
        showRecord={showRecord}
        reviewerId={reviewerId}
      />
    </div>
  );
}
