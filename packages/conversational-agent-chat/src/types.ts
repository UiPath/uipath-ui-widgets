import { AutopilotChatMode } from '@uipath/apollo-react/material/components';
import { UiPath } from "@uipath/uipath-typescript/core";

export interface ConversationalAgentChatProps {
  sdk: UiPath;
  agentId: number;
  folderId: number;
  mode?: AutopilotChatMode;
  title?: string;
  description?: string;
}

export enum MessageWidget {
  AI = 'ai',
  Human = 'human',
  ApolloAgentsToolCall = 'apollo-agents-tool-call',
  ToolConfirmation = 'apollo-cas-tool-confirmation'
}

export interface AttachFileOutput {
  uri: string;
  name: string;
  mimeType: string;
}
