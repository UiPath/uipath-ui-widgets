import { Box } from "@mui/material";
import { ConversationalAgentChat } from "@uipath/ui-widgets-conversational-agent-chat";
import type { UiPath } from "@uipath/uipath-typescript/core";
import PageHeader from "./PageHeader";

interface ConversationalAgentPageProps {
  uipathSdk: UiPath;
}

function ConversationalAgentPage({ uipathSdk }: ConversationalAgentPageProps) {
  return (
    <>
      <PageHeader widgetId="conversational-agent-chat" />
      <Box sx={{ height: 800, p: 2 }}>
        <ConversationalAgentChat
          sdk={uipathSdk}
          agentId={parseInt(import.meta.env.VITE_CONV_AGENT_ID)}
          folderId={parseInt(import.meta.env.VITE_CONV_AGENT_FOLDER_ID)}
        />
      </Box>
    </>
  );
}

export default ConversationalAgentPage;
