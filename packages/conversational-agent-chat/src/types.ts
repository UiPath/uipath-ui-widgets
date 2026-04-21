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

/** @internal */
export interface EvaluationSet {
  id: string;
  name: string;
  isDefault?: boolean;
  isDisabled?: boolean;
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
  /** @internal */
  isDebugMode?: boolean;
  /** @internal */
  evaluationSets?: EvaluationSet[];
  /** @internal */
  addToEvalButtonLabel?: string;
  /** @internal */
  onEvaluationSetClicked?: (id: string) => void;
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
