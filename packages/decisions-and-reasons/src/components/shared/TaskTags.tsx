import { useState } from "react";
import type { FC } from "react";
import { Button, Card, Input, Toggle } from "@uipath/apollo-wind";
import { useCapture } from "../../hooks/useCapture";
import { MAX_TAG_LENGTH } from "../../utils/tags";
import { signal } from "../../utils/signals";
import { CHIP_CLASS } from "./styles";

export const TaskTags: FC<{ options: readonly string[] }> = ({ options }) => {
  const { state, locked, toggleTaskTag, addTaskTag } = useCapture();
  const [draft, setDraft] = useState("");
  const custom = state.tags.filter((tag) => !options.includes(tag));

  const submit = () => {
    addTaskTag(draft);
    setDraft("");
  };

  return (
    <Card className="space-y-3 p-5">
      <div>
        <h3 className="text-base font-semibold">Task tags</h3>
        <p className="text-xs text-muted-foreground">
          Tap the tags that apply. Optional.
        </p>
      </div>
      <div className="flex flex-wrap gap-1.5">
        {[...options, ...custom].map((tag) => (
          <Toggle
            key={tag}
            {...signal.rationale}
            variant="outline"
            size="xs"
            className={CHIP_CLASS}
            disabled={locked}
            pressed={state.tags.includes(tag)}
            onPressedChange={() => toggleTaskTag(tag)}
          >
            {tag}
          </Toggle>
        ))}
      </div>
      {!locked && (
        <div className="flex items-center gap-2">
          <Input
            {...signal.rationale}
            aria-label="New task tag"
            placeholder="Add your own tag"
            maxLength={MAX_TAG_LENGTH}
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            onKeyDown={(event) => {
              if (event.key !== "Enter") return;
              event.preventDefault();
              submit();
            }}
          />
          <Button disabled={!draft.trim()} onClick={submit}>
            Add tag
          </Button>
        </div>
      )}
    </Card>
  );
};
