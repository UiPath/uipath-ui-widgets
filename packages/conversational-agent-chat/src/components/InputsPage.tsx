import { styled } from "@mui/material";
import { useRef, useState } from "react";
import { ApButton } from "@uipath/apollo-react";

import { AgentSchemaForm } from "./AgentSchemaForm";
import type { AgentSchemaFormHandle } from "./AgentSchemaForm";
import type { InputSchema } from "./AgentSchemaForm/types";
import { ConversationalAgentIcon } from "../icons/ConversationalAgentIcon";

// Layout — matches react-sdk's InputsPage structure
const ContainerLayout = styled("div")`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: calc(100% - 48px);
`;

const InputsContainer = styled("div")`
  width: 30%;
  min-width: 300px;
  max-width: 450px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 42px 0;
`;

const AgentIconWrapper = styled("div")`
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background-color: ${({ theme }) =>
    theme.palette.semantic?.colorChipInfoBackground};
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 8px;

  svg path,
  svg rect,
  svg ellipse {
    fill: ${({ theme }) => theme.palette.semantic?.colorInfoForeground};
  }

  svg path[stroke] {
    stroke: ${({ theme }) => theme.palette.semantic?.colorInfoForeground};
    fill: none;
  }
`;

const AgentTitle = styled("h2")`
  margin: 4px 0;
`;

const AgentDescription = styled("p")`
  margin: 4px;
`;

const ButtonRow = styled("div")`
  display: flex;
  justify-content: center;
  margin-top: 10px;
  width: 100%;
`;

interface InputsPageProps {
  /** Agent display name shown as the page title. */
  agentName: string;
  /** JSON Schema for the agent's input fields. */
  inputSchema: InputSchema;
  /** Called with the validated form data when the user clicks "Start Conversation". */
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
  const formRef = useRef<AgentSchemaFormHandle>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (data: unknown) => {
    setIsSubmitting(true);
    try {
      await onSubmit(data);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ContainerLayout>
      <InputsContainer>
        <AgentIconWrapper>
          <ConversationalAgentIcon />
        </AgentIconWrapper>
        <AgentTitle>{agentName}</AgentTitle>
        <AgentDescription>
          Before we get started, I need a few details.
        </AgentDescription>
        <AgentSchemaForm
          formRef={formRef}
          inputSchema={inputSchema}
          collapsibleOptional
          onSubmit={handleSubmit}
        />
        <ButtonRow>
          <ApButton
            label="Start Conversation"
            onClick={() => formRef.current?.submit()}
            loading={isSubmitting}
            style={{ width: "100%" }}
          />
        </ButtonRow>
      </InputsContainer>
    </ContainerLayout>
  );
}
