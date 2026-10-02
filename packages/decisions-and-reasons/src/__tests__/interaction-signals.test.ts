import { describe, expect, it } from "vitest";
import { InteractionSignalTracker } from "../interaction-signals";

function clock() {
  let time = 0;
  return {
    now: () => time,
    advance: (ms: number) => {
      time += ms;
    },
  };
}

const kinds = (signals: { kind: string }[]) => signals.map((s) => s.kind);

describe("InteractionSignalTracker", () => {
  it("records outcome-first, changes of mind and edits after deciding", () => {
    const c = clock();
    const tracker = new InteractionSignalTracker(c.now);
    tracker.start();
    c.advance(2000);
    tracker.resolutionSelected();
    c.advance(1000);
    tracker.resolutionSelected();
    tracker.evidenceChanged("r1");

    const signals = tracker.summarize({
      selectedResolutionId: "deny",
      rationaleText: "x",
      evidenceIds: ["r1", "r2", "r3"],
    });

    expect(signals.find((s) => s.kind === "time_to_first_input")?.value).toBe(
      2000,
    );
    expect(signals.find((s) => s.kind === "decision_order")?.value).toBe(
      "outcome_first",
    );
    expect(signals.find((s) => s.kind === "changes_of_mind")?.value).toBe(1);
    expect(signals.find((s) => s.kind === "edits_after_deciding")?.value).toBe(
      1,
    );
    expect(signals.find((s) => s.kind === "evidence_coverage")?.value).toBe(
      "1/3",
    );
  });

  it("counts only long hovers on options that were not chosen", () => {
    const c = clock();
    const tracker = new InteractionSignalTracker(c.now);
    tracker.start();
    tracker.resolutionHoverStart("approve");
    c.advance(800);
    tracker.resolutionHoverEnd("approve");
    tracker.resolutionHoverStart("partial");
    c.advance(200);
    tracker.resolutionHoverEnd("partial");
    tracker.resolutionHoverStart("deny");
    c.advance(900);
    tracker.resolutionHoverEnd("deny");
    tracker.resolutionSelected();

    const alternatives = tracker
      .summarize({
        selectedResolutionId: "deny",
        rationaleText: "",
        evidenceIds: [],
      })
      .find((s) => s.kind === "alternatives_considered");

    expect(alternatives?.value).toBe(1);
    expect(alternatives?.target).toBe("approve");
  });

  it("flags fast acceptance of the recommendation, excluding time away", () => {
    const c = clock();
    const tracker = new InteractionSignalTracker(c.now);
    tracker.start();
    tracker.visibilityChanged(true);
    c.advance(60_000);
    tracker.visibilityChanged(false);
    c.advance(3000);
    tracker.resolutionSelected();

    const signals = tracker.summarize({
      selectedResolutionId: "deny",
      recommendedResolutionId: "deny",
      rationaleText: "",
      evidenceIds: [],
    });

    expect(signals.find((s) => s.kind === "recommendation_kept")?.value).toBe(
      true,
    );
    expect(signals.find((s) => s.kind === "fast_acceptance")?.value).toBe(true);
    expect(signals.find((s) => s.kind === "time_away")?.durationMs).toBe(
      60_000,
    );
  });

  it("does not flag fast acceptance when the recommendation is overridden", () => {
    const tracker = new InteractionSignalTracker(clock().now);
    tracker.start();
    tracker.resolutionSelected();

    const signals = tracker.summarize({
      selectedResolutionId: "approve",
      recommendedResolutionId: "deny",
      rationaleText: "",
      evidenceIds: [],
    });

    expect(signals.find((s) => s.kind === "recommendation_kept")?.value).toBe(
      false,
    );
    expect(kinds(signals)).not.toContain("fast_acceptance");
  });

  it("reports deleted rationale text, pasted characters and unedited model share without keeping text", () => {
    const tracker = new InteractionSignalTracker(clock().now);
    tracker.start();
    tracker.rationaleChanged(80);
    tracker.pasted(42);

    const suggestion = "The unapproved change triggers Clause 4.2.";
    const signals = tracker.summarize({
      selectedResolutionId: "deny",
      rationaleText: suggestion,
      rationaleSuggestion: suggestion,
      evidenceIds: [],
    });

    expect(signals.find((s) => s.kind === "typed_then_deleted")?.value).toBe(
      80 - suggestion.length,
    );
    expect(signals.find((s) => s.kind === "pasted_text")?.value).toBe(42);
    expect(signals.find((s) => s.kind === "unedited_model_share")?.value).toBe(
      1,
    );
    expect(
      signals.every(
        (s) => typeof s.value !== "string" || !s.value.includes("Clause"),
      ),
    ).toBe(true);
  });

  it("emits no signals when the reviewer never interacted", () => {
    const tracker = new InteractionSignalTracker(clock().now);
    tracker.start();

    expect(
      tracker.summarize({
        selectedResolutionId: "deny",
        rationaleText: "",
        evidenceIds: [],
      }),
    ).toEqual([]);
  });
});
