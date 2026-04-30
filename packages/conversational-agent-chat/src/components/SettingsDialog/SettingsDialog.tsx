import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@uipath/apollo-wind";
import type { ConversationalAgent } from "@uipath/uipath-typescript/conversational-agent";
import { useTranslation } from "react-i18next";
import { ProfileSection } from "./ProfileSection";

export interface SettingsDialogProps {
  conversationalAgent: ConversationalAgent;
  onClose: () => void;
  /**
   * Used as React `key` on `ProfileSection` so form/load state reset when the
   * user switches agent (or folder) without relying on `ConversationalAgent` reference.
   */
  profileResetKey: string;
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
}: SettingsDialogProps) => {
  const { t } = useTranslation();
  return (
    <div className="p-4">
      <Accordion type="single" collapsible defaultValue="profile">
        <AccordionItem value="profile">
          <AccordionTrigger>{t("profile_information_title")}</AccordionTrigger>
          <AccordionContent>
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
