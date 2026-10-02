import * as React from "react";
import { Progress } from "@uipath/apollo-wind";
import "./DecisionsAndReasons.css";
import {
  EvidenceRow,
  FieldControl,
  OutcomeButtons,
  RationaleAndInstruction,
} from "./DecisionControls";
import { ScaleIcon, SparklesIcon } from "./icons";
import {
  AutopilotDecisionAnalysis,
  DecisionSource,
  DecisionTaskData,
} from "./models";
import { useDecisionCapture } from "./useDecisionCapture";

export interface DecisionCaptureProps {
  taskId: string;
  source?: DecisionSource;
  /** An agent's live analysis of this task's evidence, when available. */
  apAnalysis?: AutopilotDecisionAnalysis;
  /** Drops the widget's own card frame, for a host that already draws one. */
  embedded?: boolean;
  /** Called with the clicked outcome name and the task data. The host calls completeTask(outcome, data). */
  onComplete?: (outcome: string, data: DecisionTaskData) => void;
  onCompleteFailed?: (error: Error) => void;
}

/** The full-card flavor: use-case values, reasons, rationale, instruction and one button per outcome. */
export function DecisionCapture(
  props: DecisionCaptureProps,
): React.ReactElement | null {
  const {
    taskId,
    source,
    apAnalysis,
    embedded = false,
    onComplete,
    onCompleteFailed,
  } = props;

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
    <div
      className={`uipath-decisions-and-reasons flex max-w-full flex-col gap-4 text-sm leading-snug ${
        embedded
          ? ""
          : "rounded-xl border border-[var(--ap-wind-border)] bg-[var(--surface)]"
      } text-[var(--foreground)]`}
      style={embedded ? undefined : { padding: 16 }}
    >
      <header className="flex flex-col gap-2.5">
        <div className="flex items-center gap-1.5 text-[var(--foreground-secondary)]">
          <ScaleIcon />
          <span className="text-sm font-semibold text-[var(--foreground)]">
            Decision
          </span>
        </div>
        <div className="flex items-start justify-between gap-4">
          <div className="flex min-w-0 flex-col gap-1.5">
            <span className="text-xl font-semibold">{model.title}</span>
            {recommended && (
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1 rounded-full bg-[var(--brand-subtle)] px-2 py-0.5 text-xs font-semibold text-[var(--brand)]">
                  <SparklesIcon /> Agent recommended
                </span>
                <span className="text-[13px] font-semibold">{recommended}</span>
              </div>
            )}
          </div>
          {recommended && (
            <div className="flex shrink-0 flex-col items-end gap-1">
              <span className="text-[22px] leading-none font-bold">
                {model.confidenceScore}%
              </span>
              <span className="text-xs text-[var(--foreground-muted)]">
                Confidence score
              </span>
              <Progress value={model.confidenceScore} className="h-1.5 w-32" />
            </div>
          )}
        </div>
      </header>

      {model.fields.length > 0 && (
        <section className="flex flex-wrap gap-4 rounded-xl border border-[var(--border-subtle)] p-3.5">
          {model.fields.map((field) => (
            <FieldControl
              key={field.key}
              field={field}
              value={dc.values[field.key] ?? field.value}
              proposed={dc.proposedValue(field.key)}
              onChange={(value) => dc.setValue(field.key, value)}
            />
          ))}
        </section>
      )}

      {dc.evidence.length > 0 && (
        <section className="overflow-hidden rounded-xl border border-[var(--border-subtle)]">
          <div className="border-b border-[var(--border-subtle)] px-4 py-2.5">
            <span className="text-sm font-semibold">Reasons</span>
          </div>
          {dc.evidence.map((item) => (
            <EvidenceRow key={item.id} item={item} dc={dc} />
          ))}
        </section>
      )}

      <section className="rounded-xl border border-[var(--border-subtle)] p-3.5">
        <RationaleAndInstruction dc={dc} />
      </section>

      <footer className="border-t border-[var(--border-subtle)] pt-3">
        <OutcomeButtons dc={dc} />
      </footer>
    </div>
  );
}
