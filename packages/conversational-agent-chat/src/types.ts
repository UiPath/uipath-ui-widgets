import { UiPath } from "@uipath/uipath-typescript/core";

export type Locale =
  | "en"
  | "es"
  | "pt"
  | "de"
  | "fr"
  | "ja"
  | "ko"
  | "ru"
  | "tr"
  | "zh-CN"
  | "zh-TW"
  | "pt-BR"
  | "es-MX"
  | "keys";

export interface OverrideLabels {
  title?: string;
  footerDisclaimer?: string;
  inputPlaceholder?: string;
}

export interface ConversationalAgentChatProps {
  sdk: UiPath;
  agentId: number;
  folderId: number;
  locale?: Locale;
  theme?: "light" | "dark" | "light-hc" | "dark-hc";
  readOnly?: boolean;
  overrideLabels?: OverrideLabels;
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

export enum TelemetryEvent {
  NewChat = "CAC.NewChat",
  SendMessage = "CAC.SendMessage",
  OpenConversation = "CAC.OpenConversation",
  FileAttached = "CAC.FileAttached",
  Feedback = "CAC.Feedback",
}

export enum TelemetryStatus {
  Success = "CAC.Success",
  Error = "CAC.Error",
}
