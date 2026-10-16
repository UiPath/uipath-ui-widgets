import * as React from "react";
import { Progress } from "@uipath/apollo-wind";
import "./DecisionsAndReasons.css";
import {
  EvidenceRow,
  FieldControl,
  OutcomeButtons,
  RationaleAndInstruction,
} from "./DecisionControls";
import { ChevronDownIcon, SparklesIcon } from "./icons";
import {
  AutopilotDecisionAnalysis,
  DecisionSource,
  DecisionTaskData,
} from "./models";
import { useDecisionCapture } from "./useDecisionCapture";

export interface DecisionCaptureInlineProps {
  taskId: string;
  source?: DecisionSource;
  /** An agent's live analysis of this task's evidence, when available. */
  apAnalysis?: AutopilotDecisionAnalysis;
  /** Called with the clicked outcome name and the task data. The host calls completeTask(outcome, data). */
  onComplete?: (outcome: string, data: DecisionTaskData) => void;
  onCompleteFailed?: (error: Error) => void;
}

/** The compact-inline flavor: one line plus a disclosure, no floating card — sits in a host banner. */
export function DecisionCaptureInline(
  props: DecisionCaptureInlineProps,
): React.ReactElement | null {
  const { taskId, source, apAnalysis, onComplete, onCompleteFailed } = props;
  const [open, setOpen] = React.useState(false);

  const dc = useDecisionCapture({
    taskId,
    source,
    apAnalysis,
    onComplete,
    onCompleteFailed,
  });

  if (!dc.model) {
    return null;
  }
  const { model } = dc;
  const recommended = dc.recommendedOutcome;

  return (
    <div className="uipath-decisions-and-reasons-inline flex flex-col gap-3 text-sm leading-snug text-[var(--foreground)]">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="flex w-full items-center justify-between gap-3 rounded-lg border border-[var(--border-subtle)] px-3 py-2 text-left"
      >
        <span className="flex min-w-0 items-center gap-2">
          <ChevronDownIcon
            className={
              open ? "rotate-180 transition-transform" : "transition-transform"
            }
          />
          {recommended ? (
            <>
              <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-[var(--brand-subtle)] px-2 py-0.5 text-xs font-semibold text-[var(--brand)]">
                <SparklesIcon /> Agent recommended
              </span>
              <span className="truncate font-semibold">{recommended}</span>
            </>
          ) : (
            <span className="text-[var(--foreground-secondary)]">
              No recommendation
            </span>
          )}
        </span>
        {recommended && (
          <span className="flex shrink-0 items-center gap-2">
            <span className="font-bold">{model.confidenceScore}%</span>
            <Progress value={model.confidenceScore} className="h-1.5 w-16" />
          </span>
        )}
      </button>

      {open && (
        <div className="flex flex-col gap-3 rounded-lg border border-[var(--border-subtle)] p-3">
          {model.fields.length > 0 && (
            <div className="flex flex-wrap gap-3">
              {model.fields.map((field) => (
                <FieldControl
                  key={field.key}
                  field={field}
                  value={dc.values[field.key] ?? field.value}
                  proposed={dc.proposedValue(field.key)}
                  onChange={(value) => dc.setValue(field.key, value)}
                />
              ))}
            </div>
          )}

          {dc.evidence.length > 0 && (
            <div className="flex flex-col">
              <span className="text-xs font-semibold text-[var(--foreground-muted)]">
                Reasons
              </span>
              {dc.evidence.map((item) => (
                <EvidenceRow key={item.id} item={item} dc={dc} />
              ))}
            </div>
          )}

          <RationaleAndInstruction dc={dc} compact />

          <OutcomeButtons dc={dc} size="sm" />
        </div>
      )}
    </div>
  );
}
