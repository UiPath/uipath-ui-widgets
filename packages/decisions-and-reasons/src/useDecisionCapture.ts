import * as React from "react";
import {
  AutopilotDecisionAnalysis,
  DecisionModel,
  DecisionSource,
  DecisionSubmission,
  DecisionVerdict,
  EvidenceItem,
  InteractionSignalKind,
  RelevanceLevel,
  SubmittablePart,
} from "./models";
import { InteractionSignalTracker } from "./interaction-signals";
import { MockDecisionSource } from "./mock-data-source";

const PART_LABELS: Record<SubmittablePart, string> = {
  resolution: "resolution",
  refund: "refund",
  rationale: "rationale",
  evidence: "evidence",
};

const DEFAULT_SOURCE = new MockDecisionSource();
const SIGNALS_REFRESH_MS = 1000;
const RESOLUTION_SIGNALS = new Set<InteractionSignalKind>([
  "recommendation_kept",
  "fast_acceptance",
]);

export interface UseDecisionCaptureArgs {
  taskId: string;
  capturedBy: string;
  source?: DecisionSource;
  apAnalysis?: AutopilotDecisionAnalysis;
  maxReasons?: number;
  /** Whether a consumer is reading liveSignals this render, so the refresh tick only runs when needed. */
  signalsVisible?: boolean;
  onSubmitted?: (submission: DecisionSubmission) => void;
  onSubmitFailed?: (error: Error) => void;
}

/** Stateful logic shared by both widget flavors: fetch, edits, interaction signals, submit. */
export function useDecisionCapture(args: UseDecisionCaptureArgs) {
  const {
    taskId,
    capturedBy,
    source,
    apAnalysis,
    maxReasons = 3,
    signalsVisible = false,
    onSubmitted,
    onSubmitFailed,
  } = args;

  const [model, setModel] = React.useState<DecisionModel | null>(null);
  const [selectedResolutionId, setSelectedResolutionId] = React.useState<
    string | null
  >(null);
  const [refund, setRefund] = React.useState(0);
  const [rationaleText, setRationaleText] = React.useState("");
  const [evidence, setEvidence] = React.useState<EvidenceItem[]>([]);
  const [submitting, setSubmitting] = React.useState(false);

  const originalRef = React.useRef({
    refund: 0,
    rationaleText: "",
    evidence: [] as EvidenceItem[],
  });
  const trackerRef = React.useRef(new InteractionSignalTracker());

  React.useEffect(() => {
    const onVisibility = () =>
      trackerRef.current.visibilityChanged(
        document.visibilityState === "hidden",
      );
    document.addEventListener("visibilitychange", onVisibility);
    return () => document.removeEventListener("visibilitychange", onVisibility);
  }, []);

  React.useEffect(() => {
    let cancelled = false;
    const effectiveSource = source ?? DEFAULT_SOURCE;
    void effectiveSource.getDecision(taskId).then((loaded) => {
      if (cancelled) {
        return;
      }
      setModel(loaded);
      trackerRef.current = new InteractionSignalTracker();
      trackerRef.current.start();
      setRefund(loaded.amount.refund);
      setRationaleText(loaded.rationale.text);
      const loadedEvidence = loaded.evidence.slice(0, maxReasons);
      setEvidence(loadedEvidence.map((e) => ({ ...e })));
      originalRef.current = {
        refund: loaded.amount.refund,
        rationaleText: loaded.rationale.text,
        evidence: loadedEvidence.map((e) => ({ ...e })),
      };
    });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [taskId, source]);

  const modelLoaded = model !== null;
  const evidenceChanged = React.useMemo(() => {
    const original = originalRef.current.evidence;
    return (
      evidence.some((item) => {
        const match = original.find((o) => o.id === item.id);
        return (
          !match ||
          match.relevance !== item.relevance ||
          match.decision !== item.decision
        );
      }) || evidence.length !== original.length
    );
  }, [evidence]);

  // Applies a late-arriving analysis once the fetch resolves. Never overwrites rationale the
  // human already started typing; replaces only evidence rows the human hasn't touched yet.
  React.useEffect(() => {
    if (!apAnalysis || !model) {
      return;
    }
    const { resolutionOptions, agentRecommendedResolutionId, confidenceScore } =
      apAnalysis;
    setModel((prev) => {
      if (!prev) {
        return prev;
      }
      const options = resolutionOptions?.length
        ? resolutionOptions
        : prev.resolutionOptions;
      const recommendationIsValid =
        !!agentRecommendedResolutionId &&
        options.some((o) => o.id === agentRecommendedResolutionId);
      return {
        ...prev,
        resolutionOptions: options,
        ...(recommendationIsValid
          ? {
              agentRecommendedResolutionId: agentRecommendedResolutionId!,
              isAgentRecommended: true,
            }
          : {}),
        ...(confidenceScore !== undefined ? { confidenceScore } : {}),
      };
    });
    if (
      resolutionOptions?.length &&
      selectedResolutionId &&
      !resolutionOptions.some((o) => o.id === selectedResolutionId)
    ) {
      setSelectedResolutionId(null);
    }
    if (apAnalysis.evidence?.length && !evidenceChanged) {
      const next = apAnalysis.evidence
        .slice(0, maxReasons)
        .map((e) => ({ ...e }));
      setEvidence(next);
      originalRef.current = {
        ...originalRef.current,
        evidence: next.map((e) => ({ ...e })),
      };
    }
    if (apAnalysis.rationaleSuggestion && rationaleText.trim().length === 0) {
      setRationaleText(apAnalysis.rationaleSuggestion);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [apAnalysis, modelLoaded]);

  const changedParts = React.useMemo<SubmittablePart[]>(() => {
    if (!model) {
      return [];
    }
    const parts: SubmittablePart[] = [];
    if (
      selectedResolutionId &&
      selectedResolutionId !== model.agentRecommendedResolutionId
    ) {
      parts.push("resolution");
    }
    if (refund !== originalRef.current.refund) {
      parts.push("refund");
    }
    if (rationaleText !== originalRef.current.rationaleText) {
      parts.push("rationale");
    }
    if (evidenceChanged) {
      parts.push("evidence");
    }
    return parts;
  }, [model, selectedResolutionId, refund, rationaleText, evidenceChanged]);

  const statusLine = React.useMemo(() => {
    if (!selectedResolutionId) {
      return "No resolution selected";
    }
    if (changedParts.length === 0) {
      return "Matches agent recommendation";
    }
    const names = changedParts.map((p) => PART_LABELS[p]).join(", ");
    return `Change in position · ${changedParts.length} of 4 parts: ${names}`;
  }, [selectedResolutionId, changedParts]);

  const addEvidence = () => {
    setEvidence((prev) => [
      ...prev,
      {
        id: `manual-${crypto.randomUUID()}`,
        title: "New evidence",
        description: "",
        tags: [],
        supports: "approve",
        relevance: "not-relevant",
        decision: "approve",
      },
    ]);
  };

  const setRelevance = (id: string, relevance: RelevanceLevel) => {
    trackerRef.current.evidenceChanged(id);
    setEvidence((prev) =>
      prev.map((e) => (e.id === id ? { ...e, relevance } : e)),
    );
  };

  const setDecision = (id: string, decision: DecisionVerdict) => {
    trackerRef.current.evidenceChanged(id);
    setEvidence((prev) =>
      prev.map((e) => (e.id === id ? { ...e, decision } : e)),
    );
  };

  const selectResolution = (id: string) => {
    trackerRef.current.resolutionSelected();
    setSelectedResolutionId(id);
  };

  const changeRationale = (text: string) => {
    trackerRef.current.rationaleChanged(text.length);
    setRationaleText(text);
  };

  const pasted = (length: number) => trackerRef.current.pasted(length);
  const hoverStart = (optionId: string) =>
    trackerRef.current.resolutionHoverStart(optionId);
  const hoverEnd = (optionId: string) =>
    trackerRef.current.resolutionHoverEnd(optionId);

  const summarizeSignals = (resolutionId: string) =>
    trackerRef.current.summarize({
      selectedResolutionId: resolutionId,
      recommendedResolutionId: model?.isAgentRecommended
        ? model.agentRecommendedResolutionId
        : undefined,
      rationaleText,
      rationaleSuggestion: apAnalysis?.rationaleSuggestion,
      evidenceIds: evidence.map((e) => e.id),
    });

  const [, setSignalsTick] = React.useState(0);
  React.useEffect(() => {
    if (!signalsVisible || !modelLoaded) {
      return;
    }
    const id = setInterval(
      () => setSignalsTick((n) => n + 1),
      SIGNALS_REFRESH_MS,
    );
    return () => clearInterval(id);
  }, [signalsVisible, modelLoaded]);

  // Before a resolution is picked, the recommendation signals would describe a choice not yet made.
  const liveSignals =
    signalsVisible && model
      ? summarizeSignals(selectedResolutionId ?? "").filter(
          (s) => selectedResolutionId || !RESOLUTION_SIGNALS.has(s.kind),
        )
      : [];

  const submit = async () => {
    if (!selectedResolutionId) {
      return;
    }
    setSubmitting(true);
    const submission: DecisionSubmission = {
      taskId,
      selectedResolutionId,
      refund,
      rationaleText,
      evidence: evidence.map((e) => ({
        id: e.id,
        title: e.title,
        relevance: e.relevance,
        decision: e.decision,
      })),
      capturedBy,
      metadata: model
        ? {
            taskTitle: model.taskTitle,
            taskType: model.taskType,
            priority: model.priority,
          }
        : undefined,
      signals: summarizeSignals(selectedResolutionId),
    };
    try {
      onSubmitted?.(submission);
    } catch (e) {
      onSubmitFailed?.(e as Error);
    } finally {
      setSubmitting(false);
    }
  };

  return {
    model,
    selectedResolutionId,
    refund,
    rationaleText,
    evidence,
    submitting,
    statusLine,
    canSubmit: !!selectedResolutionId && !submitting,
    liveSignals,
    setRefund,
    setRationaleText: changeRationale,
    setRelevance,
    setDecision,
    selectResolution,
    addEvidence,
    pasted,
    hoverStart,
    hoverEnd,
    submit,
  };
}
