import { useRef } from "react";
import type { Dispatch, SetStateAction } from "react";
import type { ReviewPart, ReviewSeed, ReviewState } from "../models/capture";
import { truncate } from "../utils/text";
import { EMPTY_WHY, notedWhy, toggledWhy } from "../utils/whys";
import type { Commit } from "./useCaptureState";

const PREVIEW_LENGTH = 60;

type FieldActionsInput = {
  state: ReviewState;
  setState: Dispatch<SetStateAction<ReviewState>>;
  commit: Commit;
  seeds: ReviewSeed[];
  parts: ReviewPart[];
  labelOf: (id: string) => string;
  logEdits: boolean;
};

export function useFieldActions({
  state,
  setState,
  commit,
  seeds,
  parts,
  labelOf,
  logEdits,
}: FieldActionsInput) {
  const settled = useRef<Record<string, string>>({});
  const { looked } = state;

  const valueOf = (id: string) =>
    parts.find((part) => part.id === id)?.value ?? "";

  const lookAt = (id: string) =>
    setState((current) =>
      current.looked[id]
        ? current
        : { ...current, looked: { ...current.looked, [id]: true } },
    );

  const pickMany = (
    patch: Record<string, string | null>,
    lookId: string,
    what: string,
  ) => {
    const values = Object.fromEntries(
      Object.entries({ ...state.values, ...patch }).filter(
        (entry): entry is [string, string] => entry[1] !== null,
      ),
    );
    commit(what, { values, looked: { ...looked, [lookId]: true } });
  };

  const pick = (id: string, value: string) =>
    pickMany(
      { [id]: value },
      id,
      `Field: ${labelOf(id)}, ${valueOf(id)} → ${value}`,
    );

  const edit = (id: string, value: string) =>
    setState((current) => ({
      ...current,
      values: { ...current.values, [id]: value },
    }));

  const settle = (id: string) => {
    const value = state.values[id];
    if (value === undefined || settled.current[id] === value) return;
    settled.current[id] = value;
    const from = seeds.find((seed) => seed.id === id)?.proposed ?? "";
    commit(
      logEdits
        ? `Field: ${labelOf(id)}, ${truncate(from, PREVIEW_LENGTH)} → ${truncate(value, PREVIEW_LENGTH)}`
        : null,
      { looked: { ...looked, [id]: true } },
    );
  };

  const toggleWhy = (id: string, why: string) =>
    commit(`Why: ${labelOf(id)}, ${why}`, {
      whys: {
        ...state.whys,
        [id]: toggledWhy(state.whys[id] ?? EMPTY_WHY, why),
      },
    });

  const editNote = (id: string, note: string) =>
    setState((current) => ({
      ...current,
      whys: { ...current.whys, [id]: notedWhy(current.whys[id], note) },
    }));

  return { lookAt, pick, pickMany, edit, settle, toggleWhy, editNote };
}
