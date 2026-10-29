export const signal = {
  field: (id: string) => ({ "data-signal-field": id }),
  evidence: (id: string) => ({ "data-signal-evidence": id }),
  outcome: (id: string, recommended: boolean) => ({
    "data-signal-outcome": id,
    "data-signal-recommended": recommended ? "" : undefined,
  }),
  rationale: { "data-signal-rationale": "" },
  addFactor: { "data-signal-add-factor": "" },
};
