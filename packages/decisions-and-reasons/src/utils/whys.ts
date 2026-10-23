import type { WhyPick } from "../models/capture";

export const EMPTY_WHY: WhyPick = { why: null, note: "" };

export const whyText = (pick: WhyPick) =>
  pick.why === "Other" ? pick.note || "Other" : (pick.why ?? "");

export const toggledWhy = (pick: WhyPick, why: string): WhyPick => ({
  why: pick.why === why ? null : why,
  note: pick.note,
});

export const notedWhy = (pick: WhyPick | undefined, note: string): WhyPick => ({
  why: pick?.why ?? null,
  note,
});
