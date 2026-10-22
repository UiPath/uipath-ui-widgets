import type { FC, ReactNode } from "react";
import {
  Alert,
  AlertDescription,
  Badge,
  Button,
  Card,
  cn,
  Input,
} from "@uipath/apollo-wind";
import { Chip } from "./DocumentReasonRow";
import { outcomeLabel, partHow, whyText } from "./reviewModel";
import type { UseCaseCaptureModel } from "./reviewModel";
import type { WhyPick } from "./types";

const RATIONALE = { "data-signal-rationale": "" };
const ADD_FACTOR = { "data-signal-add-factor": "" };

export const LOW_CONFIDENCE = 80;

export const UseCaseRoot: FC<{
  model: UseCaseCaptureModel;
  children: ReactNode;
}> = ({ model, children }) => (
  <div
    ref={(el) => model.setRoot(el)}
    className="uipath-decisions-and-reasons min-w-0 space-y-4 text-sm"
  >
    {children}
  </div>
);

export const ConfidenceBadge: FC<{ value?: number }> = ({ value }) =>
  value === undefined ? null : (
    <Badge
      variant="outline"
      className={cn(
        "tabular-nums",
        value < LOW_CONFIDENCE && "border-warning-icon bg-warning-background",
      )}
    >
      {value}%
    </Badge>
  );

export const ReasonChips: FC<{
  question: string;
  options: readonly string[];
  pick: WhyPick;
  disabled?: boolean;
  onToggle: (why: string) => void;
  onNote: (note: string) => void;
  placeholder?: string;
}> = ({
  question,
  options,
  pick,
  disabled,
  onToggle,
  onNote,
  placeholder = "A few words",
}) => (
  <div className="space-y-1.5 rounded-md bg-muted/50 p-2">
    <div className="text-xs text-muted-foreground">
      {question} <span>Optional.</span>
    </div>
    <div className="flex flex-wrap gap-1.5">
      {options.map((option) => (
        <Chip
          key={option}
          disabled={disabled}
          pressed={pick.why === option}
          signal={option === "Other" ? ADD_FACTOR : RATIONALE}
          onToggle={() => onToggle(option)}
        >
          {option}
        </Chip>
      ))}
    </div>
    {pick.why === "Other" && (
      <Input
        {...RATIONALE}
        placeholder={placeholder}
        disabled={disabled}
        value={pick.note}
        onChange={(e) => onNote(e.target.value)}
      />
    )}
  </div>
);

const Struck: FC<{ children: ReactNode }> = ({ children }) => (
  <span className="max-w-64 truncate text-muted-foreground line-through">
    {children || "—"}
  </span>
);

export const OutcomeCard: FC<{
  model: UseCaseCaptureModel;
  completeNote?: ReactNode;
}> = ({ model, completeNote }) => {
  const {
    spec,
    outcome,
    outcomeWhy,
    locked,
    busy,
    error,
    blocker,
    changed,
    choose,
    toggleOutcomeWhy,
    editOutcomeNote,
    submit,
  } = model;
  const chosen = spec.outcomes.find((o) => o.id === outcome);
  const offRecommendation = outcome && outcome !== spec.recommended;

  return (
    <Card className="space-y-3 p-5">
      <h3 className="flex flex-wrap items-center gap-2 text-base font-semibold">
        Outcome <span className="font-normal text-muted-foreground">·</span>
        <span className={cn(!chosen && "font-medium text-muted-foreground")}>
          {chosen ? chosen.label : "No outcome selected"}
        </span>
        {outcome === spec.recommended && (
          <Badge variant="secondary">Recommended</Badge>
        )}
      </h3>
      <div
        className={cn(
          "grid gap-2",
          spec.outcomes.length === 2 ? "sm:grid-cols-2" : "sm:grid-cols-3",
        )}
      >
        {spec.outcomes.map((o) => (
          <Button
            key={o.id}
            data-signal-outcome={o.id}
            data-signal-recommended={o.id === spec.recommended ? "" : undefined}
            variant="outline"
            disabled={locked}
            aria-pressed={outcome === o.id}
            onClick={() => choose(o.id)}
            className={cn(
              "h-auto flex-col items-start justify-start gap-1 whitespace-normal p-3 text-left",
              outcome === o.id
                ? "border-primary ring-2 ring-primary/25"
                : "hover:border-primary/40",
            )}
          >
            <span className="flex flex-wrap items-center gap-2 text-sm font-semibold">
              {o.label}
              {o.id === spec.recommended && (
                <Badge variant="secondary">Recommended</Badge>
              )}
            </span>
            <span className="block text-xs font-normal text-muted-foreground">
              {o.description}
            </span>
          </Button>
        ))}
      </div>
      {chosen?.reasons && (
        <ReasonChips
          question={`Why ${chosen.label.toLowerCase()}?`}
          options={chosen.reasons}
          pick={outcomeWhy}
          disabled={locked}
          onToggle={toggleOutcomeWhy}
          onNote={editOutcomeNote}
        />
      )}
      <div className="overflow-hidden rounded-lg border border-border-de-emp">
        <div className="border-b border-border-de-emp px-3 py-2 text-sm font-semibold">
          What changed
        </div>
        {changed.length === 0 && !offRecommendation ? (
          <p className="px-3 py-2.5 text-xs text-muted-foreground">
            Nothing changed from what was proposed.
          </p>
        ) : (
          <ul>
            {offRecommendation && (
              <li className="flex flex-wrap items-center gap-1.5 border-b border-border-de-emp px-3 py-2 text-xs last:border-b-0">
                <span className="w-16 text-muted-foreground">Outcome</span>
                <Struck>{outcomeLabel(spec, spec.recommended)}</Struck>
                <span>→</span>
                <span>{outcomeLabel(spec, outcome)}</span>
              </li>
            )}
            {changed.map((p) => (
              <li
                key={p.id}
                className="flex flex-wrap items-center gap-1.5 border-b border-border-de-emp px-3 py-2 text-xs last:border-b-0"
              >
                <span className="w-16 text-muted-foreground">Field</span>
                <span className="font-semibold">{p.label} ·</span>
                <Struck>{p.proposed}</Struck>
                <span>→</span>
                <span className="max-w-64 truncate">{p.value || "—"}</span>
                <span className="ml-auto text-muted-foreground">
                  {partHow(p)}
                  {p.why && <> · {whyText({ why: p.why, note: p.note })}</>}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
      {!locked && (
        <div className="space-y-3 border-t border-border-de-emp pt-3">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          <div className="flex flex-wrap items-center justify-end gap-3">
            <p className="min-w-0 flex-1 text-xs font-semibold">
              {!outcome ? "No outcome selected." : blocker}
            </p>
            {completeNote}
            <Button disabled={!outcome || !!blocker || busy} onClick={submit}>
              Complete{chosen && <> as {chosen.label}</>}
            </Button>
          </div>
        </div>
      )}
      {locked && (
        <p className="border-t border-border-de-emp pt-3 text-xs font-semibold">
          Completed{chosen && <> as {chosen.label}</>}
        </p>
      )}
    </Card>
  );
};
