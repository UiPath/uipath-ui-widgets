import * as React from "react";
import "./DecisionsAndReasons.css";
import { DecisionBody } from "./DecisionControls";
import { ChevronDownIcon, SparklesIcon } from "./icons";
import { DecisionSource, DecisionTaskData } from "./models";
import { useDecisionCapture } from "./useDecisionCapture";

export interface DecisionCaptureInlineProps {
  taskId: string;
  source?: DecisionSource;
  /** Renders the saved values and never completes. */
  readOnly?: boolean;
  /** Called with the clicked outcome name and the task data. The host calls completeTask(outcome, data). */
  onComplete?: (outcome: string, data: DecisionTaskData) => void;
  onCompleteFailed?: (error: Error) => void;
}

/** The compact-inline flavor: one line plus a disclosure that opens the same guided sections stacked, sits in a host banner. */
export function DecisionCaptureInline(
  props: DecisionCaptureInlineProps,
): React.ReactElement | null {
  const { taskId, source, readOnly, onComplete, onCompleteFailed } = props;
  const [open, setOpen] = React.useState(false);

  const dc = useDecisionCapture({
    taskId,
    source,
    readOnly,
    onComplete,
    onCompleteFailed,
  });

  if (!dc.model) {
    return null;
  }
  const proposed = dc.validProposed;
  const confidence = dc.model.proposalConfidence;

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
          {proposed ? (
            <>
              <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-[var(--brand-subtle)] px-2 py-0.5 text-xs font-semibold text-[var(--brand)]">
                <SparklesIcon /> Proposed
              </span>
              <span className="truncate font-semibold">{proposed}</span>
            </>
          ) : (
            <span className="text-[var(--foreground-secondary)]">
              No proposal
            </span>
          )}
        </span>
        {proposed && confidence !== undefined && (
          <span className="shrink-0 font-bold">{confidence}%</span>
        )}
      </button>

      {open && <DecisionBody dc={dc} layout="stacked" />}
    </div>
  );
}
