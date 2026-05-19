import { Badge, Input, cn } from "@uipath/apollo-wind";
import { type ChangeEvent, useState } from "react";
import { useTranslation } from "react-i18next";

import type { AgentSchemaFieldProps } from "../AgentSchemaField";
import { FieldShell } from "../FieldShell";

interface ArrayFieldProps extends AgentSchemaFieldProps {
  label: React.ReactNode;
}

export const ArrayField = ({
  prop,
  value,
  onChange,
  error = false,
  disabled,
  label,
}: ArrayFieldProps) => {
  const { t } = useTranslation();
  const chips = (value as string[] | undefined) ?? [];
  const [inputValue, setInputValue] = useState("");

  const addChip = () => {
    const trimmed = inputValue.trim();
    if (trimmed) onChange([...chips, trimmed]);
    setInputValue("");
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addChip();
    } else if (e.key === "Backspace" && inputValue === "") {
      onChange(chips.slice(0, -1));
    }
  };

  return (
    <FieldShell
      label={label}
      error={error}
      disabled={disabled}
      helperText={prop.description}
    >
      <div
        className={cn(
          "flex min-h-9 w-full flex-wrap items-center gap-1 rounded-md border border-input bg-background px-3 py-1 text-sm",
          "focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2",
          error && "border-destructive focus-within:ring-destructive",
          disabled && "cursor-not-allowed opacity-50",
        )}
      >
        {chips.map((chip, i) => (
          <Badge key={i} variant="secondary" className="gap-1 pr-1">
            <span>{chip}</span>
            <button
              type="button"
              aria-label={t("agent_schema_remove_chip", { chip })}
              disabled={disabled}
              onClick={() => onChange(chips.filter((_, idx) => idx !== i))}
              className="rounded px-1 text-muted-foreground hover:text-foreground disabled:pointer-events-none"
            >
              <svg
                width="10"
                height="10"
                viewBox="0 0 12 12"
                fill="none"
                aria-hidden="true"
              >
                <path
                  d="M2 2L10 10M10 2L2 10"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
              </svg>
            </button>
          </Badge>
        ))}
        <Input
          value={inputValue}
          onChange={(e: ChangeEvent<HTMLInputElement>) =>
            setInputValue(e.target.value)
          }
          onKeyDown={handleKeyDown}
          onBlur={addChip}
          disabled={disabled}
          className="h-6 min-w-16 flex-1 border-0 bg-transparent p-0 shadow-none focus-visible:ring-0 focus-visible:ring-offset-0"
        />
      </div>
    </FieldShell>
  );
};
