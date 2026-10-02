import * as React from "react";
import {
  DecisionModel,
  DecisionSource,
  DecisionTaskData,
  EvidenceItem,
  InstructionScope,
  NotRelevantWhy,
  Weight,
} from "./models";
import { MockDecisionSource } from "./mock-data-source";

const DEFAULT_SOURCE = new MockDecisionSource();

const NOT_RELEVANT: Weight = "Not relevant";

export interface UseDecisionCaptureArgs {
  taskId: string;
  source?: DecisionSource;
  readOnly?: boolean;
  onComplete?: (outcome: string, data: DecisionTaskData) => void;
  onCompleteFailed?: (error: Error) => void;
}

interface WeightEdit {
  weight: Weight | undefined;
  why: NotRelevantWhy | undefined;
  note: string;
}

export type ChangeKind = "add" | "rem" | "mod";

export interface Change {
  part: "Decision" | "Reason" | "Rationale" | "Lesson";
  kind: ChangeKind;
  subject?: string;
  from?: string;
  to: string;
}

const editOf = (item: EvidenceItem): WeightEdit => ({
  weight: item.weight,
  why: item.notRelevantWhy,
  note: item.notRelevantNote ?? "",
});

const isChanged = (item: EvidenceItem, edit: WeightEdit | undefined) => {
  if (!edit) {
    return false;
  }
  if (edit.weight !== item.weight) {
    return true;
  }
  return (
    edit.weight === NOT_RELEVANT &&
    (edit.why !== item.notRelevantWhy ||
      edit.note !== (item.notRelevantNote ?? ""))
  );
};

const describeWeight = (weight: Weight | undefined, edit?: WeightEdit) => {
  if (!weight) {
    return "No weight";
  }
  if (weight !== NOT_RELEVANT || !edit?.why) {
    return weight;
  }
  const reason = edit.why === "Other" ? edit.note.trim() || "Other" : edit.why;
  return `${weight} · ${reason}`;
};

/** Stateful logic for the widget: fetch, the reviewer's edits against the proposal, the gate and the completion data. */
export function useDecisionCapture(args: UseDecisionCaptureArgs) {
  const {
    taskId,
    source,
    readOnly = false,
    onComplete,
    onCompleteFailed,
  } = args;

  const [model, setModel] = React.useState<DecisionModel | null>(null);
  const [outcome, setOutcome] = React.useState<string | null>(null);
  const [edits, setEdits] = React.useState<Record<string, WeightEdit>>({});
  const [picked, setPicked] = React.useState<string[]>([]);
  const [instructionText, setInstructionText] = React.useState("");
  const [lessonIndex, setLessonIndex] = React.useState<number | null>(null);
  const [scope, setScope] = React.useState<InstructionScope>("this-task");
  const [completing, setCompleting] = React.useState(false);
  const [filed, setFiled] = React.useState(false);

  React.useEffect(() => {
    let cancelled = false;
    const effectiveSource = source ?? DEFAULT_SOURCE;
    void effectiveSource.getDecision(taskId).then((loaded) => {
      if (cancelled) {
        return;
      }
      setModel(loaded);
      setOutcome(loaded.completedOutcome ?? null);
      setEdits({});
      setPicked(loaded.rationale ?? []);
      setInstructionText(loaded.instructionText ?? "");
      setLessonIndex(null);
      setScope(loaded.instructionScope ?? "this-task");
      setFiled(!!loaded.completedOutcome);
    });
    return () => {
      cancelled = true;
    };
  }, [taskId, source]);

  const locked = readOnly || filed;
  const evidence = model?.evidence;
  const proposedOutcome = model?.proposedOutcome;
  const outcomes = model?.outcomes ?? [];
  const validProposed = outcomes.some((o) => o.name === proposedOutcome)
    ? proposedOutcome
    : undefined;

  const weightOf = (item: EvidenceItem): Weight | undefined =>
    edits[item.id] ? edits[item.id].weight : item.weight;
  const whyOf = (item: EvidenceItem): NotRelevantWhy | undefined =>
    edits[item.id] ? edits[item.id].why : item.notRelevantWhy;
  const noteOf = (item: EvidenceItem): string =>
    edits[item.id] ? edits[item.id].note : (item.notRelevantNote ?? "");

  const proposedWeight = (item: EvidenceItem): string | undefined =>
    isChanged(item, edits[item.id])
      ? describeWeight(item.weight, editOf(item))
      : undefined;

  const proposedOutcomeNote =
    outcome && validProposed && outcome !== validProposed
      ? validProposed
      : undefined;

  const setWeight = (item: EvidenceItem, weight: Weight) =>
    setEdits((prev) => {
      const current = prev[item.id] ?? editOf(item);
      const keepWhy = weight === NOT_RELEVANT;
      return {
        ...prev,
        [item.id]: {
          weight,
          why: keepWhy ? current.why : undefined,
          note: keepWhy ? current.note : "",
        },
      };
    });

  const setWhy = (item: EvidenceItem, why: NotRelevantWhy) =>
    setEdits((prev) => {
      const current = prev[item.id] ?? editOf(item);
      return {
        ...prev,
        [item.id]: {
          ...current,
          why,
          note: why === "Other" ? current.note : "",
        },
      };
    });

  const setNote = (item: EvidenceItem, note: string) =>
    setEdits((prev) => ({
      ...prev,
      [item.id]: { ...(prev[item.id] ?? editOf(item)), note },
    }));

  const togglePicked = (text: string) =>
    setPicked((prev) =>
      prev.includes(text) ? prev.filter((p) => p !== text) : [...prev, text],
    );

  const addOwn = (text: string) => {
    const trimmed = text.trim();
    if (!trimmed) {
      return;
    }
    setPicked((prev) => (prev.includes(trimmed) ? prev : [...prev, trimmed]));
  };

  const pickLesson = (index: number) => {
    const options = model?.instructionOptions ?? [];
    if (lessonIndex === index) {
      setLessonIndex(null);
      setInstructionText("");
      return;
    }
    setLessonIndex(index);
    setInstructionText(options[index] ?? "");
  };

  const changedItems = (evidence ?? []).filter((item) =>
    isChanged(item, edits[item.id]),
  );
  const departedOutcome =
    !!outcome && !!validProposed && outcome !== validProposed;
  const departed = departedOutcome || changedItems.length > 0;
  const unexplained = (evidence ?? []).filter(
    (item) => weightOf(item) === NOT_RELEVANT && !whyOf(item),
  );
  const agree =
    !departed &&
    !!validProposed &&
    (outcome === null || outcome === validProposed);

  const optionTexts = model?.rationaleOptions ?? [];
  const rationale = [
    ...optionTexts.filter((t) => picked.includes(t)),
    ...picked.filter((t) => !optionTexts.includes(t)),
  ];
  const lesson = departed ? instructionText.trim() : "";

  const changes: Change[] = [];
  if (departedOutcome && outcome && validProposed) {
    changes.push({
      part: "Decision",
      kind: "mod",
      from: validProposed,
      to: outcome,
    });
  }
  changedItems.forEach((item) => {
    const weight = weightOf(item);
    changes.push({
      part: "Reason",
      kind: weight === NOT_RELEVANT ? "rem" : "mod",
      subject: item.title,
      from: describeWeight(item.weight, editOf(item)),
      to: describeWeight(weight, edits[item.id]),
    });
  });
  if (rationale.length > 0) {
    changes.push({
      part: "Rationale",
      kind: "add",
      to: `${rationale.length} chip${rationale.length === 1 ? "" : "s"}`,
    });
  }
  if (lesson) {
    changes.push({ part: "Lesson", kind: "add", to: lesson });
  }

  const missing: string[] = [];
  if (!agree && !outcome) {
    missing.push("a decision");
  }
  if (unexplained.length > 0) {
    missing.push(
      `a why for ${unexplained.length} not relevant reason${unexplained.length === 1 ? "" : "s"}`,
    );
  }
  if (departed && rationale.length === 0) {
    missing.push("a rationale chip");
  }
  if (departed && !lesson) {
    missing.push("a lesson");
  }

  const canComplete = !!model && !locked && !completing && missing.length === 0;

  const finalEvidence = (item: EvidenceItem): EvidenceItem => {
    const edit = edits[item.id];
    if (!isChanged(item, edit)) {
      return item;
    }
    const next: EvidenceItem = { ...item };
    delete next.notRelevantWhy;
    delete next.notRelevantNote;
    if (edit.weight) {
      next.weight = edit.weight;
    }
    if (edit.weight === NOT_RELEVANT && edit.why) {
      next.notRelevantWhy = edit.why;
      if (edit.why === "Other" && edit.note.trim()) {
        next.notRelevantNote = edit.note.trim();
      }
    }
    return next;
  };

  const complete = () => {
    if (!model || !canComplete) {
      return;
    }
    const chosen = agree ? validProposed : outcome;
    if (!chosen) {
      return;
    }
    const data: DecisionTaskData = {};
    if (evidence) {
      data.evidence = evidence.map(finalEvidence);
    }
    data.rationale = rationale;
    data.instructionText = lesson;
    data.instructionScope = scope;
    setCompleting(true);
    try {
      onComplete?.(chosen, data);
      setOutcome(chosen);
      setFiled(true);
    } catch (e) {
      onCompleteFailed?.(e as Error);
    } finally {
      setCompleting(false);
    }
  };

  return {
    model,
    outcome,
    setOutcome,
    locked,
    filed,
    validProposed,
    proposedOutcomeNote,
    weightOf,
    whyOf,
    noteOf,
    proposedWeight,
    setWeight,
    setWhy,
    setNote,
    rationaleBank: [
      ...optionTexts,
      ...picked.filter((t) => !optionTexts.includes(t)),
    ],
    picked,
    togglePicked,
    addOwn,
    lessonIndex,
    pickLesson,
    instructionText,
    setInstructionText,
    scope,
    setScope,
    departed,
    changes,
    missing,
    agree,
    completing,
    canComplete,
    complete,
  };
}

export type DecisionCaptureState = ReturnType<typeof useDecisionCapture>;
