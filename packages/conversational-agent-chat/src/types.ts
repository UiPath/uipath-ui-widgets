import { UiPath } from "@uipath/uipath-typescript/core";
import type { ConversationJobStartOverrides } from "@uipath/uipath-typescript/conversational-agent";

// "keys" is a dev-debug mode that renders raw translation keys instead of resolved strings.
// Additional locales will be bundled once the localization team delivers translations.
export type Locale = "en" | "keys";

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
  /** ID of the agent release to chat with. Required unless `existingConversationId` is provided. */
  agentId?: number;
  /**
   * ID of the folder the agent lives in. Optional — when omitted, the widget resolves it by
   * listing agents and matching on `agentId`. Prefer passing this when known, since the fallback
   * lists all agents accessible to the SDK's scope.
   */
  folderId?: number;
  /** Allow for loading an existing conversation by ID instead of creating a new one on first message */
  existingConversationId?: string;
  /**
   * External User ID to associate with conversational agent requests.
   * Required when authenticating via an app-scoped external app (client credential grant);
   * omit for standard user tokens. Sent as the `x-uipath-external-user-id` header on HTTP
   * requests and as a query parameter on the WebSocket connection.
   */
  externalUserId?: string;
  locale?: Locale;
  theme?: "light" | "dark" | "light-hc" | "dark-hc";
  readOnly?: boolean;
  overrideLabels?: OverrideLabels;
  /**
   * Fallback first-run experience. Used only when the agent's appearance
   * provides no welcome title, description, or starting prompts. When the
   * agent has any FRE data, this prop is ignored and only the agent's data
   * is rendered.
   */
  firstRunExperience?: FirstRunExperience;
  /** Override which features are disabled. Merged with defaults (fullScreen, preview, close are always disabled). */
  disabledFeatures?: DisabledFeatures;
  /** Optional configuration for job start behavior */
  jobStartOverrides?: ConversationJobStartOverrides;
  /** @internal */
  isDebugMode?: boolean;
  /** @internal */
  evaluationSets?: EvaluationSet[];
  /** @internal */
  addToEvalButtonLabel?: string;
  /** @internal */
  onEvaluationSetClicked?: (id: string) => void;
  /**
   * Called when the user sends a message. Used by debug-mode consumers that need to gate agent execution on the
   * first user message.
   * @internal
   */
  onUserMessageSent?: (message: { content: string }) => void;
}

export interface AgentSummary {
  id: number;
  name: string;
  description: string;
  folderId: number;
  /** Version of the deployed agent (e.g. "1.0.7"). Absent on draft agents. */
  processVersion?: string;
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
