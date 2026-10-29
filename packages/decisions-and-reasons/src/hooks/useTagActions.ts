import type { ReviewState } from "../models/capture";
import { normalizedTag, toggledTag } from "../utils/tags";
import type { Commit } from "./useCaptureState";

type TagActionsInput = {
  state: ReviewState;
  commit: Commit;
};

export function useTagActions({ state, commit }: TagActionsInput) {
  const toggleTaskTag = (tag: string) =>
    commit(
      `Task tag ${state.tags.includes(tag) ? "removed" : "added"}: ${tag}`,
      { tags: toggledTag(state.tags, tag) },
    );

  const addTaskTag = (text: string) => {
    const tag = normalizedTag(text);
    if (!tag || state.tags.includes(tag)) return;
    toggleTaskTag(tag);
  };

  return { toggleTaskTag, addTaskTag };
}
