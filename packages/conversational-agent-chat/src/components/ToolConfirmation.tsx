import { useRef, useState } from "react";
import { Button, cn } from "@uipath/apollo-wind";
import type { ToolCallConfirmationValue } from "@uipath/uipath-typescript/conversational-agent";
import {
  AgentSchemaForm,
  type AgentSchemaFormHandle,
} from "./AgentSchemaForm/AgentSchemaForm";
import type { InputSchema } from "./AgentSchemaForm/types";

/**
 * Normalizes values by converting Date objects to ISO strings.
 * Callers may pass Date instances through `inputValue` (e.g. from earlier
 * form state); the form fields downstream expect string values.
 */
function normalizeValue(value: unknown): unknown {
  if (value instanceof Date) return value.toISOString();
  if (Array.isArray(value)) return value.map(normalizeValue);
  if (value && typeof value === "object") {
    const normalized: Record<string, unknown> = {};
    for (const [key, val] of Object.entries(value)) {
      normalized[key] = normalizeValue(val);
    }
    return normalized;
  }
  return value;
}

/** Strings for tool confirmation UI; pass from the chat root so parallel React roots stay in sync with locale. */
export interface ToolConfirmationLabels {
  cancel: string;
  confirm: string;
  statusCancelled: string;
  statusConfirmed: string;
}

export interface ToolConfirmationProps {
  confirmationData: ToolCallConfirmationValue;
  isCompleted: boolean;
  wasRejected?: boolean;
  labels: ToolConfirmationLabels;
  onApprove: (endValue: { input?: unknown }) => void;
  onCancel: () => void;
}

export function ToolConfirmation({
  confirmationData,
  isCompleted,
  wasRejected,
  labels,
  onApprove,
  onCancel,
}: ToolConfirmationProps) {
  const formRef = useRef<AgentSchemaFormHandle>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (isCompleted) {
    return (
      <div className="flex flex-col gap-2 py-3">
        <span className="text-sm font-semibold">
          {confirmationData.toolName}
        </span>
        <span
          className={cn(
            "text-[13px] italic",
            wasRejected ? "text-destructive" : "text-success-text",
          )}
        >
          {wasRejected ? labels.statusCancelled : labels.statusConfirmed}
        </span>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2 py-3">
      <span className="text-sm font-semibold">
        {confirmationData.toolName}
      </span>
      <AgentSchemaForm
        inputSchema={confirmationData.inputSchema as InputSchema}
        initialValues={
          normalizeValue(confirmationData.inputValue ?? {}) as Record<
            string,
            unknown
          >
        }
        disabled={isSubmitting}
        formRef={formRef}
        collapsibleOptional
        onSubmit={async (data) => {
          setIsSubmitting(true);
          onApprove({ input: data });
        }}
      />
      <div className="mt-1 flex justify-end gap-2">
        <Button
          type="button"
          variant="outline"
          disabled={isSubmitting}
          onClick={() => {
            setIsSubmitting(true);
            onCancel();
          }}
        >
          {labels.cancel}
        </Button>
        <Button
          type="button"
          disabled={isSubmitting}
          onClick={() => formRef.current?.submit()}
        >
          {labels.confirm}
        </Button>
      </div>
    </div>
  );
}
