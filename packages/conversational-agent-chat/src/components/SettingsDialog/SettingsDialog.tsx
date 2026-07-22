import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@uipath/apollo-wind";
import type { ConversationalAgent } from "@uipath/uipath-typescript/conversational-agent";
import { useTranslation } from "react-i18next";
import type { InputSchema } from "../AgentSchemaForm/types";
import { ConnectionsSection } from "./ConnectionsSection";
import { InputsSection } from "./InputsSection";
import { ProfileSection } from "./ProfileSection";

export interface SettingsDialogProps {
  conversationalAgent: ConversationalAgent;
  onClose: () => void;
  /**
   * Used as React `key` on `ProfileSection` so form/load state reset when the
   * user switches agent (or folder) without relying on `ConversationalAgent` reference.
   */
  profileResetKey: string;
  /** ID of the current agent release. Required for the connections section. */
  agentId?: number;
  /** ID of the folder containing the current agent. Required for the connections section. */
  folderId?: number;
  /**
   * Agent's input schema. When present (and non-empty), an `Inputs` section
   * appears alongside profile so users can edit/re-apply agent inputs on the
   * active conversation.
   */
  inputSchema?: InputSchema | null;
  /** Last-applied agent inputs, used to pre-populate the inputs form. */
  initialInputs?: Record<string, unknown>;
  /** Persists agent inputs against the current conversation. */
  onApplyInputs?: (values: Record<string, unknown>) => Promise<void>;
  /**
   * `key` for `InputsSection` so its form state resets on agent or
   * conversation switch.
   */
  inputsResetKey?: string;
}

/**
 * Settings content rendered inline into Apollo's settings panel via
 * `AutopilotChatService`'s `settingsRenderer` config. Apollo owns the panel
 * chrome (header, back/close, backdrop); this component just fills the body.
 */
export const SettingsDialog = ({
  conversationalAgent,
  onClose,
  profileResetKey,
  agentId,
  folderId,
  inputSchema,
  initialInputs,
  onApplyInputs,
  inputsResetKey,
}: SettingsDialogProps) => {
  const { t } = useTranslation();
  const showInputs =
    inputSchema != null &&
    onApplyInputs != null &&
    Object.keys(inputSchema.properties ?? {}).length > 0;
  const showConnections = agentId != null && folderId != null;
  return (
    <div className="p-4">
      <Accordion
        type="multiple"
        defaultValue={[]}
        className="flex flex-col gap-2"
      >
        {showInputs && (
          <AccordionItem
            value="inputs"
            className="rounded-md border-b-0 bg-accent"
          >
            <AccordionTrigger className="px-4 hover:no-underline">
              {t("agent_inputs_title")}
            </AccordionTrigger>
            <AccordionContent className="px-4">
              <InputsSection
                key={inputsResetKey}
                inputSchema={inputSchema}
                initialValues={initialInputs}
                onApplyInputs={onApplyInputs}
                onApplied={onClose}
              />
            </AccordionContent>
          </AccordionItem>
        )}
        {showConnections && (
          <AccordionItem
            value="connections"
            className="rounded-md border-b-0 bg-accent"
          >
            <AccordionTrigger className="px-4 hover:no-underline">
              {t("connections_title")}
            </AccordionTrigger>
            <AccordionContent className="px-4">
              <ConnectionsSection
                key={`${agentId}-${folderId}`}
                conversationalAgent={conversationalAgent}
                agentId={agentId}
                folderId={folderId}
              />
            </AccordionContent>
          </AccordionItem>
        )}
        <AccordionItem
          value="profile"
          className="rounded-md border-b-0 bg-accent"
        >
          <AccordionTrigger className="px-4 hover:no-underline">
            {t("profile_information_title")}
          </AccordionTrigger>
          <AccordionContent className="px-4">
            <ProfileSection
              key={profileResetKey}
              conversationalAgent={conversationalAgent}
              onSaved={onClose}
            />
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
};
