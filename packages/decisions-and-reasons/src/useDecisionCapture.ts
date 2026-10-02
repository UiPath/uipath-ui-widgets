import * as React from "react";
import {
  AutopilotDecisionAnalysis,
  DecisionModel,
  DecisionSource,
  DecisionTaskData,
  EvidenceItem,
  FieldValue,
  RelevanceLevel,
} from "./models";
import { MockDecisionSource } from "./mock-data-source";

const DEFAULT_SOURCE = new MockDecisionSource();

export interface UseDecisionCaptureArgs {
  taskId: string;
  source?: DecisionSource;
  apAnalysis?: AutopilotDecisionAnalysis;
  onComplete?: (outcome: string, data: DecisionTaskData) => void;
  onCompleteFailed?: (error: Error) => void;
}

interface Proposed {
  values: Record<string, FieldValue>;
  evidence: EvidenceItem[];
}

/** Stateful logic shared by both widget flavors: fetch, edits, completion. */
export function useDecisionCapture(args: UseDecisionCaptureArgs) {
  const { taskId, source, apAnalysis, onComplete, onCompleteFailed } = args;

  const [model, setModel] = React.useState<DecisionModel | null>(null);
  const [values, setValues] = React.useState<Record<string, FieldValue>>({});
  const [evidence, setEvidence] = React.useState<EvidenceItem[]>([]);
  const [rationaleText, setRationaleText] = React.useState("");
  const [instructionText, setInstructionText] = React.useState("");
  const [completing, setCompleting] = React.useState(false);
  const [proposed, setProposed] = React.useState<Proposed>({
    values: {},
    evidence: [],
  });

  React.useEffect(() => {
    let cancelled = false;
    const effectiveSource = source ?? DEFAULT_SOURCE;
    void effectiveSource.getDecision(taskId).then((loaded) => {
      if (cancelled) {
        return;
      }
      const loadedValues = Object.fromEntries(
        loaded.fields.map((f) => [f.key, f.value]),
      );
      setModel(loaded);
      setValues(loadedValues);
      setEvidence(loaded.evidence);
      setProposed({ values: loadedValues, evidence: loaded.evidence });
      setRationaleText((prev) =>
        prev.trim().length > 0 ? prev : (loaded.rationaleSuggestion ?? ""),
      );
    });
    return () => {
      cancelled = true;
    };
  }, [taskId, source]);

  const modelLoaded = model !== null;

  const proposedEvidenceFor = (id: string) =>
    proposed.evidence.find((e) => e.id === id);

  const evidenceChanged = React.useMemo(
    () =>
      evidence.length !== proposed.evidence.length ||
      evidence.some((item) => {
        const original = proposed.evidence.find((e) => e.id === item.id);
        return (
          !original ||
          original.relevance !== item.relevance ||
          original.verdict !== item.verdict
        );
      }),
    [evidence, proposed],
  );

  const fieldsChanged = React.useMemo(
    () =>
      Object.keys(proposed.values).some(
        (k) => values[k] !== proposed.values[k],
      ),
    [values, proposed],
  );

  const hasEdits = evidenceChanged || fieldsChanged;

  React.useEffect(() => {
    if (!apAnalysis || !model) {
      return;
    }
    const {
      outcomes,
      agentRecommendedOutcome,
      confidenceScore,
      evidence: analysisEvidence,
      rationaleSuggestion,
    } = apAnalysis;
    setModel((prev) => {
      if (!prev) {
        return prev;
      }
      const nextOutcomes = outcomes?.length ? outcomes : prev.outcomes;
      const recommendationIsValid =
        !!agentRecommendedOutcome &&
        nextOutcomes.some((o) => o.name === agentRecommendedOutcome);
      return {
        ...prev,
        outcomes: nextOutcomes,
        ...(recommendationIsValid ? { agentRecommendedOutcome } : {}),
        ...(confidenceScore !== undefined ? { confidenceScore } : {}),
      };
    });
    if (analysisEvidence?.length && !evidenceChanged) {
      setEvidence(analysisEvidence);
      setProposed((prev) => ({ ...prev, evidence: analysisEvidence }));
    }
    if (rationaleSuggestion && rationaleText.trim().length === 0) {
      setRationaleText(rationaleSuggestion);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [apAnalysis, modelLoaded]);

  const recommendedOutcome = model?.outcomes.some(
    (o) => o.name === model.agentRecommendedOutcome,
  )
    ? model.agentRecommendedOutcome
    : undefined;

  const overrides = (outcome: string) =>
    hasEdits || (!!recommendedOutcome && outcome !== recommendedOutcome);

  const canComplete = (outcome: string) =>
    modelLoaded &&
    !completing &&
    rationaleText.trim().length > 0 &&
    (!overrides(outcome) || instructionText.trim().length > 0);

  const hint = (() => {
    if (rationaleText.trim().length === 0) {
      return "Write the rationale to choose an outcome.";
    }
    if (instructionText.trim().length > 0) {
      return "";
    }
    if (hasEdits) {
      return "You changed what the agent proposed, so tell it what to do next time.";
    }
    if (recommendedOutcome) {
      return "Choosing an outcome other than the recommendation needs an instruction.";
    }
    return "";
  })();

  const setValue = (key: string, value: FieldValue) =>
    setValues((prev) => ({ ...prev, [key]: value }));

  const setRelevance = (id: string, relevance: RelevanceLevel) =>
    setEvidence((prev) =>
      prev.map((e) => (e.id === id ? { ...e, relevance } : e)),
    );

  const setVerdict = (id: string, verdict: string) =>
    setEvidence((prev) =>
      prev.map((e) => (e.id === id ? { ...e, verdict } : e)),
    );

  const proposedValue = (key: string): FieldValue | undefined =>
    values[key] !== proposed.values[key] ? proposed.values[key] : undefined;

  const proposedRelevance = (
    item: EvidenceItem,
  ): RelevanceLevel | undefined => {
    const original = proposedEvidenceFor(item.id);
    return original && original.relevance !== item.relevance
      ? original.relevance
      : undefined;
  };

  const proposedVerdict = (item: EvidenceItem): string | undefined => {
    const original = proposedEvidenceFor(item.id);
    return original && original.verdict !== item.verdict
      ? original.verdict
      : undefined;
  };

  const complete = (outcome: string) => {
    if (!model || !canComplete(outcome)) {
      return;
    }
    const data: DecisionTaskData = {};
    model.fields.forEach((f) => {
      data[f.key] = values[f.key];
    });
    data.evidence = evidence;
    data.rationaleText = rationaleText;
    data.instructionText = instructionText;
    setCompleting(true);
    try {
      onComplete?.(outcome, data);
    } catch (e) {
      onCompleteFailed?.(e as Error);
    } finally {
      setCompleting(false);
    }
  };

  return {
    model,
    values,
    evidence,
    rationaleText,
    instructionText,
    completing,
    hint,
    recommendedOutcome,
    setValue,
    setRelevance,
    setVerdict,
    setRationaleText,
    setInstructionText,
    proposedValue,
    proposedRelevance,
    proposedVerdict,
    canComplete,
    complete,
  };
}

export type DecisionCaptureState = ReturnType<typeof useDecisionCapture>;
