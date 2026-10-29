import { useRef, useState } from "react";
import type { FC } from "react";
import {
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  Input,
} from "@uipath/apollo-wind";
import { useCapture } from "../../hooks/useCapture";
import {
  MAX_REASON_LENGTH,
  OTHER_REASON,
  normalizedReason,
  unpickedReasons,
} from "../../utils/reasonTags";
import { signal } from "../../utils/signals";

export const ReasonTags: FC<{ options: readonly string[] }> = ({ options }) => {
  const { state, locked, root, addReason, removeReason } = useCapture();
  const [typing, setTyping] = useState(false);
  const [draft, setDraft] = useState("");
  const otherPicked = useRef(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const picked = state.added.map((reason) => reason.title);
  const remaining = unpickedReasons(options, picked);

  const submit = () => {
    const title = normalizedReason(draft);
    if (!title || picked.includes(title)) return;
    addReason(title, "");
    setDraft("");
    setTyping(false);
  };

  return (
    <div className="space-y-2">
      {state.added.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {state.added.map((reason) => (
            <span
              key={reason.id}
              {...signal.rationale}
              className="inline-flex items-center gap-1 rounded-full border border-foreground bg-foreground px-3 py-0.5 text-xs text-background"
            >
              {reason.title}
              {!locked && (
                <button
                  type="button"
                  aria-label={`Remove ${reason.title}`}
                  className="leading-none"
                  onClick={() => removeReason(reason.id)}
                >
                  ×
                </button>
              )}
            </span>
          ))}
        </div>
      )}
      {!locked && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              {...signal.addFactor}
              variant="outline"
              size="xs"
              className="min-w-48 justify-start text-xs"
            >
              Pick a reason
              <span aria-hidden className="ml-auto text-muted-foreground">
                ▾
              </span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="start"
            className="min-w-60"
            container={root}
            onCloseAutoFocus={(event) => {
              if (!otherPicked.current) return;
              otherPicked.current = false;
              event.preventDefault();
              inputRef.current?.focus();
            }}
          >
            {remaining.map((option) => (
              <DropdownMenuItem
                key={option}
                className="text-xs"
                onSelect={() => addReason(option, "")}
              >
                {option}
              </DropdownMenuItem>
            ))}
            {remaining.length > 0 && <DropdownMenuSeparator />}
            <DropdownMenuItem
              className="text-xs"
              onSelect={() => {
                otherPicked.current = true;
                setTyping(true);
              }}
            >
              {OTHER_REASON}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )}
      {!locked && typing && (
        <div className="flex items-center gap-2">
          <Input
            {...signal.rationale}
            ref={inputRef}
            autoFocus
            aria-label="Other reason"
            placeholder="Type your reason"
            maxLength={MAX_REASON_LENGTH}
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            onKeyDown={(event) => {
              if (event.key !== "Enter") return;
              event.preventDefault();
              submit();
            }}
          />
          <Button disabled={!draft.trim()} onClick={submit}>
            Add reason
          </Button>
        </div>
      )}
    </div>
  );
};
