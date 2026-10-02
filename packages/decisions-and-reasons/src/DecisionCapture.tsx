import * as React from "react";
import "./DecisionsAndReasons.css";
import { DecisionBody } from "./DecisionControls";
import { DecisionSource, DecisionTaskData } from "./models";
import { useDecisionCapture } from "./useDecisionCapture";

export interface DecisionCaptureProps {
  taskId: string;
  source?: DecisionSource;
  /** Renders the saved values and never completes. */
  readOnly?: boolean;
  /** Called with the clicked outcome name and the task data. The host calls completeTask(outcome, data). */
  onComplete?: (outcome: string, data: DecisionTaskData) => void;
  onCompleteFailed?: (error: Error) => void;
}

/** The full flavor: decision cards, reasons, rationale and lesson beside a "What changed" rail with the one action button. */
export function DecisionCapture(
  props: DecisionCaptureProps,
): React.ReactElement | null {
  const { taskId, source, readOnly, onComplete, onCompleteFailed } = props;

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

  return (
    <div className="uipath-decisions-and-reasons max-w-full text-sm leading-normal text-[var(--foreground)]">
      <DecisionBody dc={dc} layout="split" />
    </div>
  );
}
