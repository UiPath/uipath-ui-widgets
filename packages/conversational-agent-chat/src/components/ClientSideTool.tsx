import { useRef, useState } from "react";
import { Button } from "@uipath/apollo-wind";
import {
  AgentSchemaForm,
  type AgentSchemaFormHandle,
} from "./AgentSchemaForm/AgentSchemaForm";
import type { InputSchema } from "./AgentSchemaForm/types";

export interface ClientSideToolProps {
  toolName: string;
  inputSchema: unknown;
  defaultValues?: Record<string, unknown>;
  labels: ClientSideToolLabels;
  onSubmit: (formData: Record<string, unknown>) => void;
  onCancel: () => void;
}

export interface ClientSideToolLabels {
  submit: string;
  cancel: string;
  description: string;
}

export function ClientSideTool({
  toolName,
  inputSchema,
  defaultValues,
  labels,
  onSubmit,
  onCancel,
}: ClientSideToolProps) {
  const formRef = useRef<AgentSchemaFormHandle>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const schema = (inputSchema ?? {
    type: "object",
    properties: {},
  }) as InputSchema;

  return (
    <div className="my-3 flex flex-col gap-3 rounded-lg border border-border bg-background p-4">
      <span className="border-b border-border pb-3 text-sm font-semibold">
        {toolName}
      </span>
      <span className="text-[13px] text-muted-foreground">
        {labels.description}
      </span>
      <AgentSchemaForm
        inputSchema={schema}
        initialValues={defaultValues ?? {}}
        disabled={isSubmitting}
        formRef={formRef}
        onSubmit={async (data) => {
          setIsSubmitting(true);
          onSubmit(data);
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
          {labels.submit}
        </Button>
      </div>
    </div>
  );
}
