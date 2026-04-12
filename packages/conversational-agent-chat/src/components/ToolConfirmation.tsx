import { useRef, useState } from "react";
import { styled } from "@mui/material";
import type { ToolCallConfirmationValue } from "@uipath/uipath-typescript/conversational-agent";
import {
  AgentSchemaForm,
  type AgentSchemaFormHandle,
} from "./AgentSchemaForm/AgentSchemaForm";
import type { InputSchema } from "./AgentSchemaForm/types";

const ConfirmationContainer = styled("div")`
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 12px 0;
`;

const ToolName = styled("span")`
  font-weight: 600;
  font-size: 14px;
`;

const ButtonRow = styled("div")`
  display: flex;
  gap: 8px;
  justify-content: flex-end;
  margin-top: 4px;
`;

const ActionButton = styled("button")<{ variant?: "primary" | "secondary" }>`
  padding: 6px 16px;
  border-radius: 4px;
  font-size: 14px;
  cursor: pointer;
  border: 1px solid;
  background: ${({ variant }) =>
    variant === "primary" ? "var(--color-primary, #0067df)" : "transparent"};
  color: ${({ variant }) => (variant === "primary" ? "#fff" : "inherit")};
  border-color: ${({ variant }) =>
    variant === "primary" ? "var(--color-primary, #0067df)" : "currentColor"};
  opacity: 1;
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const CompletedStatus = styled("span")<{ rejected?: boolean }>`
  font-size: 13px;
  color: ${({ rejected }) =>
    rejected ? "var(--color-error, #d32f2f)" : "var(--color-success, #2e7d32)"};
  font-style: italic;
`;

/**
 * Normalizes values by converting Date objects to ISO strings.
 * JSON parsers sometimes auto-convert ISO date strings to Date objects.
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

export interface ToolConfirmationProps {
  confirmationData: ToolCallConfirmationValue;
  isCompleted: boolean;
  wasRejected?: boolean;
  onApprove: (endValue: { input?: unknown }) => void;
  onCancel: () => void;
}

export function ToolConfirmation({
  confirmationData,
  isCompleted,
  wasRejected,
  onApprove,
  onCancel,
}: ToolConfirmationProps) {
  const formRef = useRef<AgentSchemaFormHandle>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (isCompleted) {
    return (
      <ConfirmationContainer>
        <ToolName>{confirmationData.toolName}</ToolName>
        <CompletedStatus rejected={wasRejected}>
          {wasRejected ? "Cancelled" : "Confirmed"}
        </CompletedStatus>
      </ConfirmationContainer>
    );
  }

  return (
    <ConfirmationContainer>
      <ToolName>{confirmationData.toolName}</ToolName>
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
      <ButtonRow>
        <ActionButton
          variant="secondary"
          disabled={isSubmitting}
          onClick={() => {
            setIsSubmitting(true);
            onCancel();
          }}
        >
          Cancel
        </ActionButton>
        <ActionButton
          variant="primary"
          disabled={isSubmitting}
          onClick={() => formRef.current?.submit()}
        >
          Confirm
        </ActionButton>
      </ButtonRow>
    </ConfirmationContainer>
  );
}
