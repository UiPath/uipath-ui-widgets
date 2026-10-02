import { InteractionSignal } from "./models";

/** Hover on a non-chosen option longer than this counts as considering it. */
export const ALTERNATIVE_HOVER_MS = 700;
/** Keeping the recommendation and submitting faster than this is flagged as fast acceptance. */
export const FAST_ACCEPTANCE_MS = 10_000;
/** Deleting at least this many rationale chars before submitting counts as typed then deleted. */
export const TYPED_THEN_DELETED_CHARS = 20;

export interface InteractionSummaryInput {
  selectedResolutionId: string;
  recommendedResolutionId?: string;
  rationaleText: string;
  rationaleSuggestion?: string;
  evidenceIds: string[];
}

/** Observes how a reviewer works through one decision and reduces it to derived signals only. */
export class InteractionSignalTracker {
  private _startedAt = 0;
  private _firstInputAt: number | undefined;
  private _firstResolutionAt: number | undefined;
  private _firstEvidenceChangeAt: number | undefined;
  private _resolutionSelections = 0;
  private _editsAfterDeciding = 0;
  private readonly _evidenceTouched = new Set<string>();
  private readonly _hoverStartedAt = new Map<string, number>();
  private readonly _consideredOptions = new Set<string>();
  private _maxRationaleLength = 0;
  private _pastedChars = 0;
  private _hiddenSince: number | undefined;
  private _hiddenMs = 0;

  constructor(private readonly _now: () => number = () => Date.now()) {}

  start(): void {
    this._startedAt = this._now();
  }

  resolutionSelected(): void {
    this._input();
    this._resolutionSelections++;
    this._firstResolutionAt ??= this._now();
  }

  resolutionHoverStart(optionId: string): void {
    this._hoverStartedAt.set(optionId, this._now());
  }

  resolutionHoverEnd(optionId: string): void {
    const started = this._hoverStartedAt.get(optionId);
    this._hoverStartedAt.delete(optionId);
    if (
      started !== undefined &&
      this._now() - started >= ALTERNATIVE_HOVER_MS
    ) {
      this._consideredOptions.add(optionId);
    }
  }

  evidenceChanged(evidenceId: string): void {
    this._input();
    this._evidenceTouched.add(evidenceId);
    this._firstEvidenceChangeAt ??= this._now();
    if (this._firstResolutionAt !== undefined) {
      this._editsAfterDeciding++;
    }
  }

  rationaleChanged(length: number): void {
    this._input();
    this._maxRationaleLength = Math.max(this._maxRationaleLength, length);
  }

  pasted(length: number): void {
    this._pastedChars += length;
  }

  visibilityChanged(hidden: boolean): void {
    if (hidden) {
      this._hiddenSince ??= this._now();
    } else if (this._hiddenSince !== undefined) {
      this._hiddenMs += this._now() - this._hiddenSince;
      this._hiddenSince = undefined;
    }
  }

  summarize(input: InteractionSummaryInput): InteractionSignal[] {
    const now = this._now();
    const signals: InteractionSignal[] = [];

    if (this._firstInputAt !== undefined) {
      signals.push({
        kind: "time_to_first_input",
        value: this._firstInputAt - this._startedAt,
        durationMs: this._firstInputAt - this._startedAt,
      });
    }

    if (this._firstResolutionAt !== undefined) {
      const order =
        this._firstEvidenceChangeAt === undefined
          ? "outcome_only"
          : this._firstResolutionAt < this._firstEvidenceChangeAt
            ? "outcome_first"
            : "evidence_first";
      signals.push({ kind: "decision_order", value: order });
    }

    if (this._resolutionSelections > 1) {
      signals.push({
        kind: "changes_of_mind",
        value: this._resolutionSelections - 1,
      });
    }

    const alternatives = [...this._consideredOptions].filter(
      (id) => id !== input.selectedResolutionId,
    );
    if (alternatives.length > 0) {
      signals.push({
        kind: "alternatives_considered",
        value: alternatives.length,
        target: alternatives.join(","),
      });
    }

    if (this._editsAfterDeciding > 0) {
      signals.push({
        kind: "edits_after_deciding",
        value: this._editsAfterDeciding,
      });
    }

    if (input.evidenceIds.length > 0) {
      const touched = input.evidenceIds.filter((id) =>
        this._evidenceTouched.has(id),
      ).length;
      signals.push({
        kind: "evidence_coverage",
        value: `${touched}/${input.evidenceIds.length}`,
      });
    }

    if (input.recommendedResolutionId) {
      const kept = input.selectedResolutionId === input.recommendedResolutionId;
      signals.push({
        kind: "recommendation_kept",
        value: kept,
        target: input.recommendedResolutionId,
      });
      const elapsed = now - this._startedAt - this._hiddenMs;
      if (kept && elapsed < FAST_ACCEPTANCE_MS) {
        signals.push({
          kind: "fast_acceptance",
          value: true,
          durationMs: elapsed,
        });
      }
    }

    const deleted = this._maxRationaleLength - input.rationaleText.length;
    if (deleted >= TYPED_THEN_DELETED_CHARS) {
      signals.push({ kind: "typed_then_deleted", value: deleted });
    }

    if (this._pastedChars > 0) {
      signals.push({ kind: "pasted_text", value: this._pastedChars });
    }

    const hiddenMs =
      this._hiddenMs +
      (this._hiddenSince !== undefined ? now - this._hiddenSince : 0);
    if (hiddenMs > 0) {
      signals.push({
        kind: "time_away",
        value: hiddenMs,
        durationMs: hiddenMs,
      });
    }

    if (input.rationaleSuggestion && input.rationaleText.length > 0) {
      signals.push({
        kind: "unedited_model_share",
        value: unchangedShare(input.rationaleSuggestion, input.rationaleText),
      });
    }

    return signals;
  }

  private _input(): void {
    this._firstInputAt ??= this._now();
  }
}

/** Share of the final text, 0 to 1, still the suggestion word for word from the start. */
function unchangedShare(suggestion: string, finalText: string): number {
  let common = 0;
  const limit = Math.min(suggestion.length, finalText.length);
  while (common < limit && suggestion[common] === finalText[common]) {
    common++;
  }
  return Math.round((common / finalText.length) * 100) / 100;
}
