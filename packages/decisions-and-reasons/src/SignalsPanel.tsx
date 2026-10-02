import { ShieldCheckIcon } from "./icons";
import { InteractionSignal, InteractionSignalKind } from "./models";

interface SignalCopy {
  label: string;
  value: (signal: InteractionSignal) => string;
  description: (signal: InteractionSignal) => string;
  /** Marks a signal worth a second look with the warning accent. */
  flagged?: (signal: InteractionSignal) => boolean;
}

const DECISION_ORDER_COPY: Record<
  string,
  { value: string; description: string }
> = {
  outcome_first: {
    value: "Outcome first",
    description: "Picked a resolution before changing any evidence.",
  },
  evidence_first: {
    value: "Evidence first",
    description: "Worked through the evidence before picking a resolution.",
  },
  outcome_only: {
    value: "Outcome only",
    description: "Picked a resolution without changing any evidence.",
  },
};

const SIGNAL_COPY: Record<InteractionSignalKind, SignalCopy> = {
  time_to_first_input: {
    label: "Time to first input",
    value: (s) => formatDuration(Number(s.value)),
    description: () =>
      "Time from opening the decision to the first click or keystroke.",
  },
  decision_order: {
    label: "Decision order",
    value: (s) =>
      DECISION_ORDER_COPY[String(s.value)]?.value ?? String(s.value),
    description: (s) => DECISION_ORDER_COPY[String(s.value)]?.description ?? "",
  },
  changes_of_mind: {
    label: "Changes of mind",
    value: (s) => String(s.value),
    description: () => "Times the reviewer switched to a different resolution.",
  },
  alternatives_considered: {
    label: "Alternatives considered",
    value: (s) => String(s.value),
    description: () => "Options the reviewer paused on without choosing.",
  },
  edits_after_deciding: {
    label: "Edits after deciding",
    value: (s) => String(s.value),
    description: () => "Evidence changes made after a resolution was picked.",
  },
  evidence_coverage: {
    label: "Evidence coverage",
    value: (s) => String(s.value),
    description: () => "Evidence rows the reviewer changed.",
  },
  recommendation_kept: {
    label: "Recommendation",
    value: (s) => (s.value ? "Kept" : "Overridden"),
    description: (s) =>
      s.value
        ? "The selected resolution is the agent's recommendation."
        : "The selected resolution differs from the agent's recommendation.",
  },
  fast_acceptance: {
    label: "Fast acceptance",
    value: (s) => formatDuration(s.durationMs ?? 0),
    description: () =>
      "The recommendation was kept within 10 seconds of opening.",
    flagged: () => true,
  },
  typed_then_deleted: {
    label: "Rewriting",
    value: (s) => `${s.value} chars deleted`,
    description: () => "Rationale text written and then removed.",
    flagged: () => true,
  },
  pasted_text: {
    label: "Pasted text",
    value: (s) => `${s.value} chars`,
    description: () =>
      "Characters pasted into the rationale. The pasted text is not kept.",
    flagged: () => true,
  },
  time_away: {
    label: "Time away",
    value: (s) => formatDuration(Number(s.value)),
    description: () => "Time the tab was in the background.",
  },
  unedited_model_share: {
    label: "Unedited suggestion",
    value: (s) => `${Math.round(Number(s.value) * 100)}%`,
    description: () =>
      "Share of the rationale that is still the model's suggestion word for word.",
    flagged: (s) => Number(s.value) >= 0.9,
  },
};

export interface SignalsPanelProps {
  signals: InteractionSignal[];
}

/** Live view of the derived interaction signals that are written with the decision. */
export function SignalsPanel({ signals }: SignalsPanelProps) {
  return (
    <section className="flex flex-col gap-2.5 rounded-xl border border-[var(--border-subtle)] p-3.5">
      <div className="flex items-start justify-between gap-3">
        <div className="flex flex-col gap-0.5">
          <span className="text-sm font-semibold">Signals</span>
          <span className="text-[13px] text-[var(--foreground-secondary)]">
            Read from how the reviewer works through this decision.
          </span>
        </div>
        <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-[var(--brand-subtle)] px-2 py-0.5 text-xs font-semibold text-[var(--brand)]">
          <span className="h-1.5 w-1.5 rounded-full bg-[var(--brand)]" /> Live
        </span>
      </div>

      {signals.length === 0 && (
        <span className="text-[13px] text-[var(--foreground-muted)]">
          Signals appear once the reviewer starts working on the decision.
        </span>
      )}

      {signals.map((signal) => {
        const copy = SIGNAL_COPY[signal.kind];
        const accentClass = copy.flagged?.(signal)
          ? "border-l-[var(--warning)]"
          : "border-l-[var(--brand)]";
        return (
          <div
            key={signal.kind}
            data-signal-kind={signal.kind}
            className={`flex flex-col gap-1 rounded-lg border border-[var(--border-subtle)] border-l-[3px] p-2.5 ${accentClass}`}
          >
            <div className="flex justify-between gap-3">
              <span className="text-[13px] text-[var(--foreground-secondary)]">
                {copy.label}
              </span>
              <span className="text-[13px] font-bold tabular-nums whitespace-nowrap">
                {copy.value(signal)}
              </span>
            </div>
            <span className="text-xs text-[var(--foreground-muted)]">
              {copy.description(signal)}
            </span>
          </div>
        );
      })}

      <span className="flex items-start gap-1.5 text-xs text-[var(--foreground-muted)]">
        <ShieldCheckIcon className="mt-0.5 shrink-0" />
        Visible to the reviewer. Only these derived signals are stored with the
        decision.
      </span>
    </section>
  );
}

function formatDuration(ms: number): string {
  if (ms < 60_000) {
    return `${(ms / 1000).toFixed(1)}s`;
  }
  const minutes = Math.floor(ms / 60_000);
  const seconds = Math.round((ms % 60_000) / 1000);
  return `${minutes}m ${seconds}s`;
}
