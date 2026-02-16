import { UiPath } from "@uipath/uipath-typescript/core";

export interface ConversationalAgentChatProps {
  sdk: UiPath;
  agentId: number;
  folderId: number;
}

export enum MessageWidget {
  AI = "ai",
  Human = "human",
  ApolloAgentsToolCall = "apollo-agents-tool-call",
  ToolConfirmation = "apollo-cas-tool-confirmation",
}

export interface AttachFileOutput {
  uri: string;
  name: string;
  mimeType: string;
}
