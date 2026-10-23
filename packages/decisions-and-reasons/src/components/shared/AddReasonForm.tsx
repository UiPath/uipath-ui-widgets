import { useState } from "react";
import type { FC } from "react";
import { Button, Input, Toggle } from "@uipath/apollo-wind";
import { useCapture } from "../../hooks/useCapture";
import { signal } from "../../utils/signals";
import { CHIP_CLASS } from "./styles";

export const AddReasonForm: FC = () => {
  const { spec, state, addReason } = useCapture();
  const [adding, setAdding] = useState(false);
  const [title, setTitle] = useState("");
  const [supports, setSupports] = useState("");
  const supportsPick = supports || state.outcome || spec.recommended;
  const trimmedTitle = title.trim();

  const submit = () => {
    if (!trimmedTitle) return;
    addReason(trimmedTitle, supports);
    setTitle("");
    setSupports("");
    setAdding(false);
  };

  if (!adding) {
    return (
      <Button
        {...signal.addFactor}
        variant="link"
        className="h-auto p-0 text-xs"
        onClick={() => setAdding(true)}
      >
        + Add a reason
      </Button>
    );
  }

  return (
    <div className="space-y-2 rounded-lg border border-dashed border-border-de-emp p-3">
      <Input
        placeholder="One line: what is the reason"
        value={title}
        onChange={(event) => setTitle(event.target.value)}
      />
      <div className="flex flex-wrap items-center gap-1.5">
        <span className="text-xs text-muted-foreground">Supports</span>
        {spec.outcomes.map((outcome) => (
          <Toggle
            key={outcome.id}
            variant="outline"
            size="xs"
            className={CHIP_CLASS}
            pressed={supportsPick === outcome.id}
            onPressedChange={() => setSupports(outcome.id)}
          >
            {outcome.label}
          </Toggle>
        ))}
      </div>
      <div className="flex items-center gap-3 text-xs">
        <Button disabled={!trimmedTitle} onClick={submit}>
          Add reason
        </Button>
        <Button
          variant="ghost"
          className="text-muted-foreground"
          onClick={() => setAdding(false)}
        >
          Cancel
        </Button>
        <span className="text-muted-foreground">
          Starts at High. Change it from the weight menu.
        </span>
      </div>
    </div>
  );
};
