import { useId, useState } from "react";
import type { FC } from "react";
import {
  Alert,
  AlertDescription,
  Button,
  Card,
  Label,
  Textarea,
  Toggle,
} from "@uipath/apollo-wind";
import type { ReviewModel } from "../../hooks/useDecisionCapture";
import { CHIP_CLASS } from "../../models/constants";
import type { FactRationale, FactWeighingPayload } from "../../models/decision";
import { missingItems, toggleTag } from "../../utils/factWeighing";

export const RationaleCard: FC<{
  model: ReviewModel;
  options: readonly string[];
  rationale: FactRationale;
  payload: () => FactWeighingPayload;
  onRationale: (next: FactRationale) => void;
}> = ({ model, options, rationale, payload, onRationale }) => {
  const id = useId();
  const [open, setOpen] = useState(false);
  const { outcome, locked, busy, error, submit, spec } = model;
  const missing = missingItems(outcome, rationale);
  const chosen = spec.outcomes.find((o) => o.id === outcome);

  return (
    <Card className="space-y-3 p-5">
      <div>
        <h3 className="text-base font-semibold">Rationale</h3>
        <p className="text-xs text-muted-foreground">
          Why this decision? Pick one or more.
        </p>
      </div>
      <div className="flex flex-wrap gap-1.5">
        {options.map((option) => (
          <Toggle
            key={option}
            data-signal-rationale=""
            variant="outline"
            size="xs"
            className={CHIP_CLASS}
            disabled={locked}
            pressed={rationale.tags.includes(option)}
            onPressedChange={() =>
              onRationale({
                ...rationale,
                tags: toggleTag(rationale.tags, option),
              })
            }
          >
            {option}
          </Toggle>
        ))}
      </div>
      <div className="space-y-1">
        <Label
          htmlFor={id}
          className="text-xs font-medium text-muted-foreground"
        >
          Your reason, in your own words
        </Label>
        <Textarea
          id={id}
          rows={3}
          data-signal-rationale=""
          disabled={locked}
          value={rationale.text}
          onChange={(e) => onRationale({ ...rationale, text: e.target.value })}
        />
      </div>
      {locked ? (
        <p className="border-t border-border-de-emp pt-3 text-xs font-semibold">
          Completed{chosen && <> as {chosen.label}</>}
        </p>
      ) : (
        <div className="space-y-3 border-t border-border-de-emp pt-3">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="min-w-0 flex-1 text-xs text-muted-foreground">
              {missing.length > 0 && <>Still needed: {missing.join(", ")}</>}
            </p>
            <Button disabled={missing.length > 0 || busy} onClick={submit}>
              Submit
            </Button>
          </div>
        </div>
      )}
      <Button
        variant="link"
        className="h-auto p-0 text-xs"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
      >
        {open ? "Hide what gets saved" : "Show what gets saved"}
      </Button>
      {open && (
        <pre className="max-h-96 overflow-auto rounded-md bg-muted/50 p-2 text-xs">
          {JSON.stringify(payload(), null, 2)}
        </pre>
      )}
    </Card>
  );
};
