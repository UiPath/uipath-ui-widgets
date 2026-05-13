import { Alert, AlertDescription, Button } from "@uipath/apollo-wind";
import { useRef, useState } from "react";
import { useTranslation } from "react-i18next";

import { AgentSchemaForm } from "./AgentSchemaForm";
import type { AgentSchemaFormHandle } from "./AgentSchemaForm";
import type { InputSchema } from "./AgentSchemaForm/types";
import { ConversationalAgentIcon } from "../icons/ConversationalAgentIcon";

interface InputsPageProps {
  /** Agent display name shown as the page title. */
  agentName: string;
  /** JSON Schema for the agent's input fields. */
  inputSchema: InputSchema;
  /**
   * Called with the validated form data when the user clicks "Start Conversation".
   * Must throw on failure so the error can be surfaced inline; do not swallow.
   */
  onSubmit: (data: unknown) => void | Promise<void>;
}

/**
 * Pre-chat input page that collects agent inputs before starting a conversation.
 * Matches the react-sdk's InputsPage pattern: agent icon, title, form fields, submit button.
 */
export function InputsPage({
  agentName,
  inputSchema,
  onSubmit,
}: InputsPageProps) {
  const { t } = useTranslation();
  const formRef = useRef<AgentSchemaFormHandle>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const handleSubmit = async (data: unknown) => {
    setSubmitError(null);
    setIsSubmitting(true);
    try {
      await onSubmit(data);
    } catch (err) {
      setSubmitError(
        err instanceof Error ? err.message : t("inputs_page_submit_error"),
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-[calc(100%_-_48px)] flex-col items-center justify-center">
      <div className="flex w-[30%] min-w-[300px] max-w-[450px] flex-col items-center justify-center py-[42px]">
        <div className="mb-2 flex h-14 w-14 items-center justify-center rounded-full bg-chip-info-background text-info-foreground">
          <ConversationalAgentIcon />
        </div>
        <h2 className="my-1 text-2xl font-semibold">{agentName}</h2>
        <p className="m-1 text-base text-muted-foreground">
          {t("inputs_page_intro")}
        </p>
        {submitError && (
          <Alert variant="destructive" className="mb-2 w-full">
            <AlertDescription>{submitError}</AlertDescription>
          </Alert>
        )}
        <AgentSchemaForm
          formRef={formRef}
          inputSchema={inputSchema}
          collapsibleOptional
          disabled={isSubmitting}
          onSubmit={handleSubmit}
        />
        <div className="mt-2.5 flex w-full justify-center">
          <Button
            onClick={() => formRef.current?.submit()}
            disabled={isSubmitting}
            className="w-full"
          >
            {isSubmitting
              ? t("inputs_page_starting")
              : t("inputs_page_start_conversation")}
          </Button>
        </div>
      </div>
    </div>
  );
}
