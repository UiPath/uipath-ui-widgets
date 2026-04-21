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
  | "es-MX";

export interface OverrideLabels {
  title?: string;
  footerDisclaimer?: string;
  inputPlaceholder?: string;
}

export interface FirstRunExperience {
  title?: string;
  description?: string;
  suggestions?: { label: string; prompt: string }[];
}

export interface DisabledFeatures {
  attachments?: boolean;
  resize?: boolean;
  fullScreen?: boolean;
  close?: boolean;
  preview?: boolean;
  history?: boolean;
  settings?: boolean;
  newChat?: boolean;
  htmlPreview?: boolean;
}

export interface ConversationalAgentChatProps {
  sdk: UiPath;
  agentId?: number;
  folderId?: number;
  /** Allow for loading an existing conversation by ID instead of creating a new one on first message */
  existingConversationId?: string;
  locale?: Locale;
  theme?: "light" | "dark" | "light-hc" | "dark-hc";
  readOnly?: boolean;
  overrideLabels?: OverrideLabels;
  /** Override the first-run experience. When omitted, derived from agent appearance data. */
  firstRunExperience?: FirstRunExperience;
  /** Override which features are disabled. Merged with defaults (fullScreen, preview, close are always disabled). */
  disabledFeatures?: DisabledFeatures;
  /**
   * Called when the user sends a message. Used by debug-mode consumers that need to gate agent execution on the
   * first user message.
   * @internal
   */
  onUserMessageSent?: (message: { content: string }) => void;
  /**
   * Optional identifier used in UiPath logs to identify the implementing service of
   * requests. External consumers do not need to set this; the server tags unrecognized
   * or missing values as external automatically.
   */
  surfaceName?: string;
  /**
   * Optional version of the implementing service of requests. Paired with `surfaceName` for
   * internal telemetry.
   */
  surfaceVersion?: string;
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
