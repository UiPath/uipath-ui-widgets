import { Alert, AlertDescription, Button, Spinner } from "@uipath/apollo-wind";
import { useRef, useState } from "react";
import { useTranslation } from "react-i18next";

import { AgentSchemaForm } from "../AgentSchemaForm";
import type { AgentSchemaFormHandle } from "../AgentSchemaForm";
import type { InputSchema } from "../AgentSchemaForm/types";

export interface InputsSectionProps {
  inputSchema: InputSchema;
  /** Last-applied values; pre-populates the form when settings is reopened. */
  initialValues?: Record<string, unknown>;
  /**
   * Persists the validated inputs (e.g. via `conversations.updateById`). Must
   * throw on failure so the error can surface inline.
   */
  onApplyInputs: (values: Record<string, unknown>) => Promise<void>;
  /** Closes the settings panel after a successful apply. */
  onApplied?: () => void;
}

export const InputsSection = ({
  inputSchema,
  initialValues,
  onApplyInputs,
  onApplied,
}: InputsSectionProps) => {
  const { t } = useTranslation();
  const formRef = useRef<AgentSchemaFormHandle>(null);
  const [applying, setApplying] = useState(false);
  const [applyError, setApplyError] = useState<string | null>(null);

  const handleSubmit = async (values: Record<string, unknown>) => {
    setApplyError(null);
    setApplying(true);
    try {
      await onApplyInputs(values);
      onApplied?.();
    } catch (err) {
      setApplyError(err instanceof Error ? err.message : String(err));
    } finally {
      setApplying(false);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <AgentSchemaForm
        formRef={formRef}
        inputSchema={inputSchema}
        initialValues={initialValues}
        onSubmit={handleSubmit}
        disabled={applying}
        collapsibleOptional={false}
      />
      {applyError && (
        <Alert variant="destructive">
          <AlertDescription>
            {t("error_apply_inputs", { errorMessage: applyError })}
          </AlertDescription>
        </Alert>
      )}
      <div className="flex justify-end">
        <Button onClick={() => formRef.current?.submit()} disabled={applying}>
          {applying && <Spinner size="sm" className="mr-2" />}
          {applying
            ? t("applying_inputs_button_label")
            : t("apply_inputs_button_label")}
        </Button>
      </div>
    </div>
  );
};
