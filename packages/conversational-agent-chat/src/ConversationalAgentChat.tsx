import {
  ApChat,
  AutopilotChatActionPayload,
  AutopilotChatCustomHeaderAction,
  AutopilotChatEvent,
  AutopilotChatFileInfo,
  AutopilotChatMessage,
  AutopilotChatMode,
  AutopilotChatPreHookAction,
  type AutopilotChatRenameConversationPayload,
  AutopilotChatService,
  type SupportedLocale,
} from "@uipath/apollo-react/material/components";
import { FontVariantToken } from "@uipath/apollo-core";
import {
  Alert,
  AlertDescription,
  Button,
  Column,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  PortalContainerProvider,
  Toaster,
  toast,
} from "@uipath/apollo-wind";
import {
  ContentPartChunkEvent,
  ContentPartStream,
  ConversationalAgent,
  ConversationCreateResponse,
  ConversationEndReason,
  ErrorStartHandlerArgs,
  ExchangeGetResponse,
  ConnectionState,
  ExchangeStream,
  FeedbackRating,
  MessageStream,
  SessionStream,
  SortOrder,
  ToolCallEndEvent,
  ToolCallStream,
} from "@uipath/uipath-typescript/conversational-agent";
import type {
  AgentGetByIdResponse,
  AvailableConnectionsResponse,
  JSONObject,
  JSONValue,
  ToolCallConfirmationValue,
} from "@uipath/uipath-typescript/conversational-agent";
import { Traces } from "@uipath/uipath-typescript/traces";
import type { SpanGetResponse } from "@uipath/uipath-typescript/traces";
import {
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { createRoot, type Root } from "react-dom/client";
import { useWidgetTranslation } from "./i18n/useWidgetTranslation";
import { InputsPage } from "./components/InputsPage";
import type { InputSchema } from "./components/AgentSchemaForm/types";
import { FeedbackDialog } from "./components/FeedbackDialog";
import { Loader } from "./components/Loader";
import { SettingsDialog } from "./components/SettingsDialog";
import { type ConnectorReadiness } from "./components/ConnectionReadinessCard";
import type { ToolConfirmationLabels } from "./components/ToolConfirmation";
import {
  createToolConfirmationRenderer,
  type ToolConfirmationRenderer,
} from "./components/ToolConfirmationRenderer";
import {
  createClientSideToolRenderer,
  type ClientSideToolRenderer,
} from "./components/ClientSideToolRenderer";
import { createConnectionReadinessRenderer } from "./components/ConnectionReadinessRenderer";
import { ALLOWED_ATTACHMENTS } from "./constants/attachments";
import "./ConversationalAgentChat.css";
import {
  AttachFileOutput,
  ConversationalAgentChatProps,
  Locale,
  TelemetryEvent,
  MessageWidget,
  TelemetryStatus,
} from "./types";
import {
  convertAttachmentToFile,
  createFileKey,
  getConversationHistoryDisplayItems,
  getFirstRunExperience,
  isFlowAgent,
  mapCitationSource,
  mapExchangesToChatMessages,
  normalizeInput,
  sortEvaluationSets,
} from "./utils";
import { getToolCallTraces, mergeToolCallTraceMeta } from "./utils/spanTree";
import { trackTelemetry } from "./utils/telemetryUtils";
import { getI18n } from "./i18n";
import { resolveAgent as fetchAgentRelease } from "./utils/resolveAgent";
import FilePreviewer from "./components/FilePreviewer";

// The widget's own i18next instance — never the shared default one, which a
// host (Studio Web) may already own. See i18n/i18n.config.ts.
const i18n = getI18n();

const TOOL_CONFIRMATION_WIDGET_ID_PREFIX = "confirmation-";
const CONNECTION_READINESS_CARD = "cas-connection-readiness";
const CONNECTION_READINESS_CARD_ID = "connection-readiness-card";
// Exchanges per page when lazily loading a conversation's history. Pages are
// fetched newest-first and prepended as the user scrolls toward the top.
const EXCHANGES_PAGE_SIZE = 15;

// Watchdog for a session that never starts: buffered sends only flush on
// `sessionStarted`, so if it never arrives, surface an error instead of
// leaving the send silently pending.
const SESSION_START_TIMEOUT_MS = 30_000;
// Bounds a conversation create so a hung request surfaces a banner instead of
// leaving a send waiting forever.
const CONVERSATION_CREATE_TIMEOUT_MS = 30_000;
// Backend limit on ConversationSchema.label.
const CONVERSATION_LABEL_MAX_LENGTH = 100;
type ConversationCreateOptionsArg = Parameters<
  ConversationalAgent["conversations"]["create"]
>[2];

// Rejects work waiting on a conversation the user or host has since moved away
// from (New Chat, a switch, re-init, unmount); the waiter drops it silently.
class ConversationReplacedError extends Error {}

type Deferred<T> = {
  promise: Promise<T>;
  resolve: (value: T) => void;
  reject: (reason: unknown) => void;
};

function createDeferred<T>(): Deferred<T> {
  let resolve!: (value: T) => void;
  let reject!: (reason: unknown) => void;
  const promise = new Promise<T>((res, rej) => {
    resolve = res;
    reject = rej;
  });
  // A gate is rejected when replaced, whether or not anything awaited it.
  promise.catch(() => {});
  return { promise, resolve, reject };
}

const hasRequiredInputs = (schema: InputSchema | null | undefined) =>
  (schema?.required?.length ?? 0) > 0;

// Map widget Locale to Apollo supported locale to allow for locales not supported by Apollo
function toApolloSupportedLocale(widgetLocale: Locale): SupportedLocale {
  return widgetLocale === "keys" ? "en" : (widgetLocale as SupportedLocale);
}

export const ConversationalAgentChat = ({
  sdk,
  agentId,
  folderId,
  existingConversationId,
  externalUserId,
  inputSchema: inputSchemaProp,
  locale = "en",
  theme: themeProp,
  mode = AutopilotChatMode.Embedded,
  renderer = "material",
  readOnly = false,
  overrideLabels,
  firstRunExperience,
  disabledFeatures,
  citationPreview = true,
  usePdfJsViewer = true,
  jobStartOverrides,
  isDebugMode = false,
  evaluationSets,
  addToEvalButtonLabel,
  onEvaluationSetClicked,
  onUserMessageSent,
  surfaceName,
  surfaceVersion,
}: ConversationalAgentChatProps) => {
  // `inputSchema` is an internal debug-only override. In normal usage the
  // schema is resolved from the agent release, so accepting it outside debug
  // mode would only confuse callers — reject the combination loudly.
  if (inputSchemaProp && !isDebugMode) {
    throw new Error(
      "`inputSchema` is only supported when `isDebugMode` is true; the agent's input schema is resolved automatically.",
    );
  }
  const theme = themeProp ?? "light";
  // must change language before useTranslation is called to avoid stale translations
  if (i18n.language !== locale) {
    i18n.changeLanguage(locale);
  }
  const { t } = useWidgetTranslation();
  // Scopes our toasts to our own <Toaster> so a host's Toaster doesn't render them too.
  const toasterId = useId();
  const agentService = useRef(
    new ConversationalAgent(sdk, {
      ...(externalUserId ? { externalUserId } : {}),
      surfaceName,
      surfaceVersion,
    }),
  );
  // The active conversation. The state drives the session effect; the ref is
  // written alongside it (see activateConversation) so Apollo's imperative
  // handlers, registered once, always read the current value. Each activation
  // is a new object, so reopening the same conversation restarts its session.
  const [activation, setActivation] = useState<{
    conversation: ConversationCreateResponse | null;
  }>({ conversation: null });
  const activeConversationRef = useRef<ConversationCreateResponse | null>(null);
  // Bumped whenever the active conversation changes, so a create started for
  // an earlier one never becomes active.
  const conversationGeneration = useRef(0);
  // The in-flight create, shared by everything waiting on a conversation.
  const pendingCreate = useRef<Promise<ConversationCreateResponse> | null>(
    null,
  );
  // Conversations this widget created, so the first history page (which can
  // land after the create) doesn't drop the active one from the sidebar.
  const createdConversationIds = useRef(new Set<string>());
  // Bumped per init run (and on unmount) so a superseded run stops at its next await.
  const initRun = useRef(0);
  const initializedFor = useRef<string | null>(null);
  const themeRef = useRef(theme);
  const modeRef = useRef(mode);
  const rendererRef = useRef(renderer);
  const overrideLabelsRef = useRef(overrideLabels);
  const disabledFeaturesRef = useRef(disabledFeatures);
  const firstRunExperienceRef = useRef(firstRunExperience);
  const initialConversationConsumed = useRef(false);
  const resolvedAgent = useRef<AgentGetByIdResponse | null>(null);
  const folderIdRef = useRef<number | undefined>(folderId);
  // An object prop, so read through a ref: a dependency on it would re-run
  // everything downstream on each host render.
  const jobStartOverridesRef = useRef(jobStartOverrides);
  const toolConfirmationLabelsRef = useRef<ToolConfirmationLabels | null>(null);
  // Per-instance so unmounting one widget doesn't tear down another's React roots.
  const toolConfirmationRenderer = useMemo<ToolConfirmationRenderer>(
    () => createToolConfirmationRenderer(),
    [],
  );
  const clientSideToolRenderer = useMemo<ClientSideToolRenderer>(
    () => createClientSideToolRenderer(),
    [],
  );
  const connectionReadinessRenderer = useMemo(
    () => createConnectionReadinessRenderer(),
    [],
  );
  // useLayoutEffect is ok here because the work is minimal enough that the cost is essentially zero
  // needed because React 19 doesn't support ref writes on render

  useLayoutEffect(() => {
    themeRef.current = theme;
    modeRef.current = mode;
    rendererRef.current = renderer;
    overrideLabelsRef.current = overrideLabels;
    disabledFeaturesRef.current = disabledFeatures;
    firstRunExperienceRef.current = firstRunExperience;
    folderIdRef.current = folderId;
    jobStartOverridesRef.current = jobStartOverrides;
    onEvaluationSetClickedRef.current = onEvaluationSetClicked;
    onUserMessageSentRef.current = onUserMessageSent;
    citationPreviewRef.current = citationPreview;
    toolConfirmationLabelsRef.current = {
      cancel: t("cancel"),
      confirm: t("tool_confirmation_confirm"),
      statusCancelled: t("tool_confirmation_status_cancelled"),
      statusConfirmed: t("tool_confirmation_status_confirmed"),
    };
  }, [
    theme,
    mode,
    renderer,
    overrideLabels,
    disabledFeatures,
    firstRunExperience,
    onEvaluationSetClicked,
    onUserMessageSent,
    citationPreview,
    folderId,
    jobStartOverrides,
    locale,
    t,
  ]);
  // Rebuild the SDK service when sdk or externalUserId change. Skip the first run because the
  // useRef initializer above already built it with the initial values. The chat is re-initialized
  // via initKey (which includes externalUserId), and initChat resets the active conversation.
  const didMountAgentServiceRef = useRef(false);
  useLayoutEffect(() => {
    if (!didMountAgentServiceRef.current) {
      didMountAgentServiceRef.current = true;
      return;
    }
    agentService.current = new ConversationalAgent(
      sdk,
      externalUserId ? { externalUserId } : undefined,
    );
  }, [sdk, externalUserId]);
  const session = useRef<SessionStream | null>(null);
  // Resolves with the active conversation's session once the session effect
  // starts it. Replaced (and the old one rejected) whenever the active
  // conversation changes, so a send never lands in a conversation the user left.
  const sessionReady = useRef(createDeferred<SessionStream>());
  // Set when the active session failed to start; the next send restarts it.
  const sessionNeedsRestart = useRef(false);
  const [sessionAttempt, setSessionAttempt] = useState(0);
  const pastConversations = useRef<ConversationCreateResponse[]>([]);
  const uploadedAttachments = useRef(new Map<string, AttachFileOutput>());
  const conversationsCursor = useRef<{ value: string } | undefined>(undefined);
  // Why the active conversation ended, or null while it's open. A ref so the
  // send handler reads the current value without re-registering.
  const endReasonRef = useRef<ConversationEndReason | null>(null);
  // Cursor for the active conversation's exchange history. Reset whenever a
  // conversation is opened/started; undefined means no older pages remain.
  const exchangesCursor = useRef<{ value: string } | undefined>(undefined);
  const agentIdRef = useRef<number | undefined>(undefined);
  const agentKeyRef = useRef<string | undefined>(undefined);
  const toolDisplayModeRef = useRef<string | undefined>(undefined);
  const isFlowAgentRef = useRef(false);
  const searchTextRef = useRef<string>("");
  // Latest spans for the active conversation's trace, polled only in FullTrace mode
  const traceSpansRef = useRef<SpanGetResponse[]>([]);
  // toolCallId -> JSON of the last-sent meta, so unchanged tool calls aren't re-sent each poll.
  const sentToolCallMetaJsonRef = useRef<Map<string, string>>(new Map());
  const tracePollIntervalRef = useRef<ReturnType<typeof setInterval> | null>(
    null,
  );
  const tracePollInFlightRef = useRef<Promise<void> | null>(null);
  const isMountedRef = useRef(false);

  const [chatService, setChatService] = useState<AutopilotChatService>();
  const [error, setError] = useState<string | null>(null);
  const [inputSchemaState, setInputSchemaState] = useState<InputSchema | null>(
    null,
  );
  const [showInputPage, setShowInputPage] = useState(false);
  const [agentNameState, setAgentNameState] = useState("");
  // Bumped on New Chat to force a fresh <InputsPage> mount with cleared form state.
  const [inputsInstance, setInputsInstance] = useState(0);
  const activeExchange = useRef<ExchangeStream | null>(null);
  const [feedbackDialogOpen, setFeedbackDialogOpen] = useState(false);
  const [feedbackIsPositive, setFeedbackIsPositive] = useState(false);
  const pendingFeedback = useRef<AutopilotChatActionPayload | null>(null);
  // Citation source-document preview, opened from a citation click.
  const [citationPreviewData, setCitationPreviewData] = useState<{
    file?: File;
    title: string;
    pageNumber: number;
    error?: boolean;
  } | null>(null);
  const citationPreviewRef = useRef(citationPreview);
  const [hasMessages, setHasMessages] = useState(false);
  const [connectionReadiness, setConnectionReadiness] = useState<
    ConnectorReadiness[] | null
  >(null);
  const [themeRoot, setThemeRoot] = useState<HTMLDivElement | null>(null);
  const onEvaluationSetClickedRef = useRef(onEvaluationSetClicked);
  const onUserMessageSentRef = useRef(onUserMessageSent);
  const chatServiceRef = useRef<AutopilotChatService | null>(null);
  const settingsRootRef = useRef<Root | null>(null);
  const autoBindTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  // Last-applied agent inputs for the active conversation. Pre-populates the
  // settings inputs form when reopened; cleared on New Chat.
  const storedAgentInputs = useRef<Record<string, unknown>>({});
  // Mirrors `inputSchemaState` so the imperative `renderSettings` closure always
  // sees the current schema without re-instantiating the chat service.
  const inputSchemaStateRef = useRef<InputSchema | null>(null);
  useLayoutEffect(() => {
    inputSchemaStateRef.current = inputSchemaState;
  }, [inputSchemaState]);

  // Merge the trace's "conversationToolCall" spans into their tool call messages (keyed by toolCallId)
  const applyTraceSpans = useCallback(
    (spans: SpanGetResponse[]) => {
      // Only FullTrace renders the span tree; other modes use the SDK's tool call events alone.
      if (toolDisplayModeRef.current !== "FullTrace") return;
      const chat = chatServiceRef.current;
      if (!chat) return;
      traceSpansRef.current = spans;

      const conversation = chat.getConversation() ?? [];

      for (const trace of getToolCallTraces(spans)) {
        // The trace only enriches tool call messages the SDK or history already
        // created, so it can't show a tool call before its deferred spinner
        // (e.g. while a confirmation is pending).
        const existing = conversation.find((m) => m.id === trace.toolCallId);
        if (!existing) continue;

        const meta = mergeToolCallTraceMeta(
          trace,
          existing.meta,
          toolDisplayModeRef.current,
        );
        const metaJson = JSON.stringify(meta);
        if (
          sentToolCallMetaJsonRef.current.get(trace.toolCallId) === metaJson
        ) {
          continue;
        }

        chat.sendResponse({
          ...existing,
          id: trace.toolCallId,
          content: t("performing_action_message", {
            action: meta.toolName ?? "",
          }),
          created_at: existing.created_at ?? trace.startTime,
          widget: MessageWidget.ApolloAgentsToolCall,
          meta,
        });
        sentToolCallMetaJsonRef.current.set(trace.toolCallId, metaJson);
      }
    },
    [t],
  );

  const fetchAndApplyTrace = useCallback(
    async (traceId: string) => {
      try {
        const spans = await new Traces(sdk).getById(traceId);
        if (
          !isMountedRef.current ||
          activeConversationRef.current?.traceId !== traceId
        ) {
          return;
        }
        applyTraceSpans(spans);
      } catch {
        // Transient errors: the next poll tick (or reopening) retries.
      }
    },
    [sdk, applyTraceSpans],
  );

  // Live polling on FullTrace mode only.
  const startTracePolling = useCallback(() => {
    if (toolDisplayModeRef.current !== "FullTrace") return;
    const traceId = activeConversationRef.current?.traceId;
    if (!traceId || tracePollIntervalRef.current) return;

    const tick = async () => {
      if (tracePollInFlightRef.current) return;
      const poll = fetchAndApplyTrace(traceId);
      tracePollInFlightRef.current = poll;
      try {
        await poll;
      } finally {
        tracePollInFlightRef.current = null;
      }
    };
    void tick();
    tracePollIntervalRef.current = setInterval(tick, 1000);
  }, [fetchAndApplyTrace]);

  const stopTracePolling = useCallback(
    (finalFetch: boolean) => {
      if (!tracePollIntervalRef.current) return;
      clearInterval(tracePollIntervalRef.current);
      tracePollIntervalRef.current = null;
      const traceId = activeConversationRef.current?.traceId;
      if (!finalFetch || !traceId) return;
      const pendingPoll = tracePollInFlightRef.current;
      void (async () => {
        await pendingPoll;
        await fetchAndApplyTrace(traceId);
      })();
    },
    [fetchAndApplyTrace],
  );

  // On leaving a conversation, stop polling
  const resetTraceState = useCallback(() => {
    stopTracePolling(false);
    traceSpansRef.current = [];
    sentToolCallMetaJsonRef.current = new Map();
  }, [stopTracePolling]);

  const setupExchangeHandlers = useCallback(
    (exchange: ExchangeStream) => {
      if (!chatService) return;

      exchange.onErrorStart((error: ErrorStartHandlerArgs) => {
        trackTelemetry(TelemetryEvent.SendMessage, TelemetryStatus.Error, {
          error: error.message,
        });
        chatService.setError(error.message || t("error_generic"));
      });

      exchange.onMessageStart((message: MessageStream) => {
        if (message.startEvent.role === "assistant") {
          if (toolDisplayModeRef.current === "FullTrace") {
            startTracePolling();
            message.onMessageEnd(() => stopTracePolling(true));
          }

          const messageId = message.messageId;
          const messageTimestamp = message.startEvent.timestamp;
          const exchangeId = exchange.exchangeId;

          // Shared envelope for the assistant stream (text, citation, done);
          // only the chunk and `done` vary.
          // stream: true so Apollo's actions row (copy, thumbs) renders —
          // useIsStreamingMessage only listens to SendChunk events; the
          // stream: false branch fires Response and leaves isStreaming stuck
          // at true.
          const sendAssistantChunk = (
            contentPartChunk: NonNullable<
              Parameters<
                AutopilotChatService["sendResponse"]
              >[0]["contentPartChunk"]
            >,
            done = false,
          ) => {
            chatService.sendResponse({
              id: messageId,
              contentPartChunk,
              created_at: messageTimestamp,
              widget: MessageWidget.AI,
              stream: true,
              done,
              meta: { exchangeId },
            });
          };

          message.onContentPartStart((contentPart: ContentPartStream) => {
            if (contentPart.startEvent.mimeType.startsWith("text/")) {
              // Apollo dictates citation boundaries by chunk index — text and
              // its citation share one index, the next text segment uses index+1.
              let chunkIndex = 0;
              let isFirstChunk = true;

              contentPart.onChunk((chunk: ContentPartChunkEvent) => {
                if (chunk.citation?.startCitation && !isFirstChunk) {
                  chunkIndex++;
                }

                if (chunk.data !== undefined) {
                  sendAssistantChunk({ text: chunk.data, index: chunkIndex });
                }

                if (chunk.citation?.endCitation) {
                  for (const source of chunk.citation.endCitation.sources) {
                    sendAssistantChunk({
                      citation: mapCitationSource(source),
                      index: chunkIndex,
                    });
                  }
                  chunkIndex++;
                }

                isFirstChunk = false;
              });

              contentPart.onContentPartEnd(() => {
                sendAssistantChunk({ index: chunkIndex }, true);
              });
            }
          });

          // Track tool calls so we can defer the spinner when an interrupt arrives
          const pendingToolCalls = new Map<
            string,
            {
              toolName: string;
              toolInput: Record<string, unknown>;
              startTimeIso: string;
              spinnerSent: boolean;
            }
          >();

          // In FullTrace the SDK's tool call events still render the tool call,
          // so it appears and completes even if trace fetches fail
          const withTraceSpan = (
            toolCallId: string,
            meta: Record<string, unknown>,
          ) => {
            if (toolDisplayModeRef.current !== "FullTrace") return meta;
            sentToolCallMetaJsonRef.current.delete(toolCallId);
            const span = chatService
              .getConversation()
              ?.find((m) => m.id === toolCallId)?.meta?.span;
            return span ? { ...meta, span } : meta;
          };

          const sendToolCallSpinner = (toolCallId: string) => {
            const pending = pendingToolCalls.get(toolCallId);
            if (!pending || pending.spinnerSent) return;
            pending.spinnerSent = true;
            chatService.sendResponse({
              id: toolCallId,
              content: t("performing_action_message", {
                action: pending.toolName,
              }),
              created_at: pending.startTimeIso,
              widget: MessageWidget.ApolloAgentsToolCall,
              meta: withTraceSpan(toolCallId, {
                toolName: pending.toolName,
                input: pending.toolInput,
                startTime: pending.startTimeIso,
                displayMode: toolDisplayModeRef.current,
              }),
            });
          };

          // Caller supplies the approve/reject channel.
          const sendToolConfirmationWidget = (params: {
            toolCallId: string;
            toolName: string;
            inputSchema?: JSONValue;
            inputValue?: JSONValue;
            onApprove: (input?: unknown) => void;
            onCancel: () => void;
          }) => {
            const widgetMessageId = `${TOOL_CONFIRMATION_WIDGET_ID_PREFIX}${params.toolCallId}`;
            const confirmationData: ToolCallConfirmationValue = {
              toolCallId: params.toolCallId,
              toolName: params.toolName,
              inputSchema: params.inputSchema ?? {},
              inputValue: params.inputValue,
            };
            const createdAt = new Date().toISOString();

            const sendUpdate = (isCompleted: boolean, wasRejected: boolean) => {
              chatService.sendResponse({
                id: widgetMessageId,
                content: t("tool_confirmation_required"),
                created_at: createdAt,
                widget: MessageWidget.ToolConfirmation,
                stream: false,
                done: true,
                meta: {
                  confirmationData,
                  isCompleted,
                  wasRejected,
                  // Unreachable once completed (the form's buttons are gone),
                  // but kept on the meta so its shape stays stable.
                  onApprove: handleApprove,
                  onCancel: handleCancel,
                },
              });
            };

            const handleApprove = (endValue: { input?: unknown }) => {
              sendUpdate(true, false);
              params.onApprove(endValue.input);
            };
            const handleCancel = () => {
              sendUpdate(true, true);
              params.onCancel();
            };

            sendUpdate(false, false);
          };

          message.onToolCallStart((toolCall: ToolCallStream) => {
            const startEvent = toolCall.startEvent;
            const startTimeIso = new Date().toISOString();
            const toolInput = startEvent.input
              ? normalizeInput(startEvent.input)
              : {};
            const { isClientSideTool, outputSchema } = startEvent;

            pendingToolCalls.set(toolCall.toolCallId, {
              toolName: startEvent.toolName,
              toolInput,
              startTimeIso,
              spinnerSent: false,
            });

            const completeToolCallSpinner = (
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              output: any,
              isError: boolean,
              cancelled?: boolean,
            ) => {
              if (!pendingToolCalls.has(toolCall.toolCallId)) return;

              const pending = pendingToolCalls.get(toolCall.toolCallId);
              if (pending && !pending.spinnerSent) {
                sendToolCallSpinner(toolCall.toolCallId);
              }
              const endTimeIso = new Date().toISOString();
              chatService.sendResponse({
                id: toolCall.toolCallId,
                content: t("performing_action_message", {
                  action: startEvent.toolName,
                }),
                created_at: endTimeIso,
                widget: MessageWidget.ApolloAgentsToolCall,
                meta: withTraceSpan(toolCall.toolCallId, {
                  toolName: startEvent.toolName,
                  input: toolInput,
                  startTime: startTimeIso,
                  output,
                  endTime: endTimeIso,
                  isError,
                  ...(cancelled && { cancelled: true }),
                  displayMode: toolDisplayModeRef.current,
                }),
              });
              pendingToolCalls.delete(toolCall.toolCallId);
            };

            toolCall.onToolCallEnd((endEvent: ToolCallEndEvent) => {
              completeToolCallSpinner(
                endEvent.output,
                endEvent.isError ?? false,
              );
            });

            // Handle client-side tool execution
            toolCall.onExecutingToolCall(() => {
              if (!isClientSideTool) return;

              const clientSideWidgetId = `client-side-tool-${toolCall.toolCallId}`;

              const outputSchemaObj = (outputSchema ?? {
                type: "object",
                properties: {},
              }) as Record<string, unknown>;

              chatService.sendResponse({
                id: clientSideWidgetId,
                content: t("performing_action_message", {
                  action: startEvent.toolName,
                }),
                created_at: new Date().toISOString(),
                widget: MessageWidget.ClientSideToolInput,
                stream: false,
                done: true,
                meta: {
                  toolName: startEvent.toolName,
                  inputSchema: outputSchemaObj,
                  isCompleted: false,
                  onSubmit: (formData: Record<string, unknown>) => {
                    const conversation = chatService.getConversation();
                    const messageToUpdate = conversation?.find(
                      (m) => m.id === clientSideWidgetId,
                    );
                    if (messageToUpdate?.meta) {
                      messageToUpdate.meta.isCompleted = true;
                    }
                    completeToolCallSpinner(formData, false);
                    toolCall.sendToolCallEnd({
                      output: formData,
                      isError: false,
                    });
                  },
                  onCancel: () => {
                    const conversation = chatService.getConversation();
                    const messageToUpdate = conversation?.find(
                      (m) => m.id === clientSideWidgetId,
                    );
                    if (messageToUpdate?.meta) {
                      messageToUpdate.meta.isCompleted = true;
                    }
                    completeToolCallSpinner(null, false, true);
                    toolCall.sendToolCallEnd({ cancelled: true });
                  },
                },
              });
            });

            // New flow: confirmation is a property of the tool call itself.
            if (startEvent.requireConfirmation) {
              sendToolConfirmationWidget({
                toolCallId: toolCall.toolCallId,
                toolName: startEvent.toolName,
                inputSchema: startEvent.inputSchema,
                inputValue: startEvent.input,
                onApprove: (input) => {
                  sendToolCallSpinner(toolCall.toolCallId);
                  const approvedInput =
                    (input as JSONValue | undefined) ?? startEvent.input ?? {};
                  toolCall.sendToolCallConfirm({
                    approved: true,
                    input: approvedInput,
                  });
                },
                onCancel: () => {
                  // For client-side tools, the server suppresses endToolCall
                  // so update spinner locally
                  if (isClientSideTool) {
                    completeToolCallSpinner(null, false, true);
                  }
                  toolCall.sendToolCallConfirm({ approved: false });
                },
              });
            } else {
              // No confirmation needed — show spinner immediately.
              sendToolCallSpinner(toolCall.toolCallId);
            }
          });
        }
      });

      exchange.onExchangeEnd(() => {
        stopTracePolling(true);
        activeExchange.current = null;
        chatService.sendOutputStreamEvent({ turnComplete: true });
        chatService.setShowLoading(false);
        chatService.setWaiting(false);
        setHasMessages(true);
      });
    },
    [chatService, startTracePolling, stopTracePolling, t],
  );

  // Makes `conversation` the active one (null for none). Rejects anything still
  // waiting on the previous conversation's create or session, and arms a fresh
  // session gate that the session effect resolves.
  const activateConversation = useCallback(
    (conversation: ConversationCreateResponse | null) => {
      conversationGeneration.current += 1;
      pendingCreate.current = null;
      sessionReady.current.reject(new ConversationReplacedError());
      sessionReady.current = createDeferred();
      sessionNeedsRestart.current = false;
      activeConversationRef.current = conversation;
      setActivation({ conversation });
    },
    [],
  );

  const resolveAgent = useCallback(async (): Promise<
    AgentGetByIdResponse | undefined
  > => {
    // Only the init run that started this lookup may write the cache, so a
    // superseded run can't leave another agent's release behind.
    const run = initRun.current;
    let effectiveAgentId = agentId;
    let effectiveFolderId = folderIdRef.current;
    // When the host passes only existingConversationId, derive the agent from
    // the conversation so the header title + FRE still render for empty replays.
    if (effectiveAgentId == null && existingConversationId) {
      if (
        !activeConversationRef.current &&
        !initialConversationConsumed.current
      ) {
        const existing = await agentService.current.conversations.getById(
          existingConversationId,
        );
        if (initRun.current !== run) return undefined;
        activateConversation(existing);
        initialConversationConsumed.current = true;
      }
      const conv = activeConversationRef.current;
      if (conv?.agentId != null) {
        effectiveAgentId = conv.agentId;
        effectiveFolderId = conv.folderId;
      }
    }
    if (effectiveAgentId == null) return undefined;
    if (resolvedAgent.current?.id === effectiveAgentId) {
      const cachedFolderId = resolvedAgent.current.folderId;
      if (effectiveFolderId == null || cachedFolderId === effectiveFolderId) {
        return resolvedAgent.current;
      }
    }
    const release = await fetchAgentRelease(
      sdk,
      effectiveAgentId,
      effectiveFolderId,
      { externalUserId },
    );
    if (!release) return undefined;
    if (initRun.current === run) {
      resolvedAgent.current = release;
      folderIdRef.current = release.folderId;
    }
    return release;
  }, [
    activateConversation,
    agentId,
    existingConversationId,
    sdk,
    externalUserId,
  ]);

  const setConversationHistory = useCallback(
    (next: ConversationCreateResponse[], allLoaded?: boolean) => {
      pastConversations.current = next;
      // Through the ref: a create started during init finishes before the
      // `chatService` state is set, and must still reach the sidebar.
      chatServiceRef.current?.setHistory(
        getConversationHistoryDisplayItems(next, t("new_chat")),
        allLoaded,
      );
    },
    [t],
  );

  // The only way a conversation is created. Everything that needs one (load,
  // New Chat, the inputs form, a send, an attachment, the settings panel)
  // joins the one in-flight create rather than starting a second.
  const startConversation = useCallback(
    (agentInput?: JSONObject): Promise<ConversationCreateResponse> => {
      if (pendingCreate.current) return pendingCreate.current;
      const generation = conversationGeneration.current;
      let timer: ReturnType<typeof setTimeout> | undefined;
      const timeout = new Promise<never>((_, reject) => {
        timer = setTimeout(
          () => reject(new Error(t("error_initialize_chat"))),
          CONVERSATION_CREATE_TIMEOUT_MS,
        );
      });
      const create = (async () => {
        const agent = await resolveAgent();
        if (!agent) {
          throw new Error(t("error_missing_conversation_params"));
        }
        const jobStartOverrides = jobStartOverridesRef.current;
        const options = {
          ...(jobStartOverrides ? { jobStartOverrides } : {}),
          ...(agentInput ? { agentInput: { inline: agentInput } } : {}),
        };
        return agent.conversations.create(
          Object.keys(options).length > 0
            ? (options as ConversationCreateOptionsArg)
            : undefined,
        );
      })();
      const pending: Promise<ConversationCreateResponse> = Promise.race([
        create,
        timeout,
      ])
        .then(
          (conversation) => {
            if (conversationGeneration.current !== generation) {
              throw new ConversationReplacedError();
            }
            createdConversationIds.current.add(conversation.id);
            activateConversation(conversation);
            // Show it in the sidebar right away so the label the service
            // generates after the first exchange refreshes it in place.
            setConversationHistory([
              conversation,
              ...pastConversations.current,
            ]);
            return conversation;
          },
          (err: unknown) => {
            if (conversationGeneration.current !== generation) {
              throw new ConversationReplacedError();
            }
            throw err;
          },
        )
        .finally(() => {
          clearTimeout(timer);
          if (pendingCreate.current === pending) pendingCreate.current = null;
        });
      pendingCreate.current = pending;
      return pending;
    },
    [activateConversation, resolveAgent, setConversationHistory, t],
  );

  const ensureConversation =
    useCallback(async (): Promise<ConversationCreateResponse> => {
      return activeConversationRef.current ?? startConversation();
    }, [startConversation]);

  // For the creates nothing awaits (load, New Chat): a failure becomes a
  // banner, and the next send retries.
  const startConversationInBackground = useCallback(() => {
    startConversation().catch((err: unknown) => {
      if (err instanceof ConversationReplacedError) return;
      chatServiceRef.current?.setError(t("error_initialize_chat"));
    });
  }, [startConversation, t]);

  // Load and New Chat create the conversation up front under the same rule.
  const shouldCreateUpfront = useCallback(
    (agent: AgentGetByIdResponse | null | undefined, requiredInputs: boolean) =>
      !!agent && !requiredInputs && !readOnly && !isDebugMode,
    [isDebugMode, readOnly],
  );

  const showEndedBanner = useCallback(
    (reason: ConversationEndReason) => {
      const message =
        reason === ConversationEndReason.Failed
          ? t("conversation_ended_failed")
          : reason === ConversationEndReason.Cancelled
            ? t("conversation_ended_cancelled")
            : t("conversation_ended_completed");
      // Clearing also unmounts a dismissed banner; Apollo's alert keeps its hidden state otherwise.
      chatServiceRef.current?.clearError();
      chatServiceRef.current?.setError(
        message,
        reason === ConversationEndReason.Completed ? "warn" : "error",
      );
    },
    [t],
  );

  const applyEndedState = useCallback(
    (reason?: ConversationEndReason) => {
      endReasonRef.current = reason ?? ConversationEndReason.Completed;
      showEndedBanner(endReasonRef.current);
    },
    [showEndedBanner],
  );

  const clearEndedState = useCallback(() => {
    if (!endReasonRef.current) return;
    endReasonRef.current = null;
    chatServiceRef.current?.clearError();
  }, []);

  // Read by the session's handlers, so a new `t` (locale change) or callback
  // identity doesn't restart the session.
  const sessionCallbacksRef = useRef({
    applyEndedState,
    setConversationHistory,
    t,
  });
  useLayoutEffect(() => {
    sessionCallbacksRef.current = {
      applyEndedState,
      setConversationHistory,
      t,
    };
  }, [applyEndedState, setConversationHistory, t]);

  // Owns the session: starts one for the active conversation as soon as the
  // chat is up, and ends it when the conversation changes or the widget
  // unmounts. React runs the cleanup before the next start, so a switch always
  // ends the old session first. Ended and read-only conversations take no
  // input, so they get no session. The in-flight exchange is left running on
  // a switch (ending it is reserved for onStopResponse), so reopening a busy
  // conversation resumes its turn.
  useEffect(() => {
    const conversation = activation.conversation;
    // A live end is recorded on the ref only (see onConversationEnd), so check
    // it too before restarting this conversation's session.
    const latest = activeConversationRef.current;
    const ended =
      !!conversation?.endedTime ||
      (latest?.id === conversation?.id && !!latest?.endedTime);
    if (!chatService || !conversation || ended || readOnly) {
      return;
    }
    const conversationId = conversation.id;
    const ready = sessionReady.current;
    // A fresh session replaces any failed one, so the next send needn't restart it.
    sessionNeedsRestart.current = false;
    const sessionHelper = agentService.current.conversations.startSession(
      conversationId,
      { echo: false },
    );
    // Mark active before registering handlers so a synchronous sessionStarted
    // can't lose the `session.current === sessionHelper` guard race below.
    session.current = sessionHelper;
    // Refresh the sidebar label when the service auto-generates one (or the
    // label is updated via the API). Bound to this session's conversation id
    // so a stale event from an ended session can't mislabel the active one.
    sessionHelper.onLabelUpdated(({ label }) => {
      sessionCallbacksRef.current.setConversationHistory(
        pastConversations.current.map((c) =>
          c.id === conversationId ? { ...c, label } : c,
        ),
      );
    });
    sessionHelper.onConversationEnd(({ reason }) => {
      const endReason = reason ?? ConversationEndReason.Completed;
      const endedTime = new Date().toISOString();
      // Mark it ended in the history list so reopening it later shows the ended state.
      sessionCallbacksRef.current.setConversationHistory(
        pastConversations.current.map((c) =>
          c.id === conversationId ? { ...c, endedTime, endReason } : c,
        ),
      );
      const active = activeConversationRef.current;
      if (active?.id !== conversationId) return;
      // Only the ref: the session stays open until the user leaves, so the
      // turn in flight still finishes. The ended state blocks further sends.
      activeConversationRef.current = { ...active, endedTime, endReason };
      sessionCallbacksRef.current.applyEndedState(endReason);
    });
    // A failed start surfaces an error and re-arms the gate; the next send
    // restarts the session rather than reusing this one.
    const failSession = (message: string) => {
      if (session.current !== sessionHelper) return;
      session.current = null;
      sessionReady.current = createDeferred();
      sessionNeedsRestart.current = true;
      chatService.setError(message);
    };
    // Buffer outgoing events until the server confirms the session is started,
    // then flush, so a send never blocks on the sessionStarted round-trip.
    sessionHelper.pauseEmits();
    const startTimeout = setTimeout(() => {
      if (sessionHelper.isEmitPaused) {
        const { t } = sessionCallbacksRef.current;
        failSession(t("error_session_start_timeout"));
      }
    }, SESSION_START_TIMEOUT_MS);
    sessionHelper.onSessionStarted(() => {
      clearTimeout(startTimeout);
      if (session.current !== sessionHelper) return;
      sessionHelper.resumeEmits();
    });
    sessionHelper.onErrorStart((error) => {
      clearTimeout(startTimeout);
      const { t } = sessionCallbacksRef.current;
      failSession(error.message || t("error_generic"));
    });
    ready.resolve(sessionHelper);
    return () => {
      clearTimeout(startTimeout);
      try {
        sessionHelper.sendSessionEnd();
      } catch {
        /* session already closed */
      }
      if (session.current === sessionHelper) session.current = null;
      // Re-arm the gate if nothing else did (activation and failSession do),
      // so a restart for the same conversation, e.g. readOnly turned on and
      // back off, doesn't leave sends on this ended session.
      if (sessionReady.current === ready) {
        sessionReady.current = createDeferred();
      }
      activeExchange.current = null;
    };
  }, [activation, chatService, readOnly, sessionAttempt]);

  // Shared helper: fetch connection readiness and update state.
  const fetchConnectionReadiness = useCallback(() => {
    const capturedAgentId = agentIdRef.current;
    const capturedFolderId = folderIdRef.current;
    if (capturedAgentId == null || capturedFolderId == null) return;
    const capturedInitKey = initializedFor.current;

    const applyReadiness = (items: AvailableConnectionsResponse) => {
      if (initializedFor.current !== capturedInitKey) return;
      if (items.length === 0) {
        setConnectionReadiness(null);
        return;
      }
      const readiness: ConnectorReadiness[] = items.map((item) => {
        const selectedConn = item.currentConnectionId
          ? item.connections?.find((c) => c.id === item.currentConnectionId)
          : undefined;
        return {
          connectorKey: item.connectorKey,
          connectorName: item.connectorName ?? item.connectorKey,
          connectorImage: item.connectorImage,
          isConfigurable: item.isConfigurable !== false,
          currentConnectionId: item.currentConnectionId,
          currentConnectionName: item.currentConnectionName,
          currentConnectionState:
            selectedConn?.state ??
            (item.currentConnectionId ? ConnectionState.Expired : undefined),
          connectionsUrl: item.connectionsUrl,
        };
      });
      const hasUnresolved = readiness.some(
        (c) =>
          c.isConfigurable &&
          (!c.currentConnectionId ||
            c.currentConnectionState !== ConnectionState.Enabled),
      );
      setConnectionReadiness(hasUnresolved ? readiness : null);
    };
    agentService.current
      .getAvailableConnections(capturedAgentId, capturedFolderId)
      .then(applyReadiness)
      .catch(() => {
        if (initializedFor.current !== capturedInitKey) return;
        setConnectionReadiness(null);
      });
  }, []);

  // Leaves the active conversation (the session effect ends its session),
  // abandoning any create still in flight. Shared by New Chat and init.
  const resetConversation = useCallback(() => {
    clearEndedState();
    activateConversation(null);
    activeExchange.current = null;
    exchangesCursor.current = undefined;
    storedAgentInputs.current = {};
    resetTraceState();
    setHasMessages(false);
    connectionReadinessRenderer.unmountAll();
  }, [
    activateConversation,
    clearEndedState,
    connectionReadinessRenderer,
    resetTraceState,
  ]);

  const onNewChat = useCallback(() => {
    resetConversation();
    if (hasRequiredInputs(inputSchemaState)) {
      // Re-show the InputsPage with a cleared form; it creates on submit.
      // Bumping the counter forces an unmount/remount via the key on
      // <InputsPage>, which resets internal form state.
      setInputsInstance((n) => n + 1);
      setShowInputPage(true);
    } else if (shouldCreateUpfront(resolvedAgent.current, false)) {
      startConversationInBackground();
    }
    fetchConnectionReadiness();
    trackTelemetry(TelemetryEvent.NewChat, TelemetryStatus.Success);
  }, [
    fetchConnectionReadiness,
    inputSchemaState,
    resetConversation,
    shouldCreateUpfront,
    startConversationInBackground,
  ]);

  const buildHistoryFilterOptions = useCallback(() => {
    // The SDK's URL builder calls value.toString() without a null check, so
    // omit any param that is undefined/empty rather than passing it as such.
    const opts: {
      agentKey?: string;
      agentId?: number;
      label?: string;
    } = {};
    if (agentKeyRef.current) opts.agentKey = agentKeyRef.current;
    if (agentIdRef.current !== undefined) opts.agentId = agentIdRef.current;
    if (searchTextRef.current) opts.label = searchTextRef.current;
    return opts;
  }, []);

  const fetchFirstHistoryPage = useCallback(async () => {
    if (!chatService) return;
    const result = await agentService.current.conversations.getAll({
      sort: SortOrder.Descending,
      pageSize: 20,
      ...buildHistoryFilterOptions(),
    });
    conversationsCursor.current = result.nextCursor;
    // A conversation created while this page loaded may not be in it yet;
    // keep it at the top unless a search is filtering the list. Take the
    // sidebar's copy, which carries any label update since the create.
    const active = activeConversationRef.current;
    const kept =
      active &&
      createdConversationIds.current.has(active.id) &&
      !searchTextRef.current &&
      !result.items.some((c) => c.id === active.id)
        ? (pastConversations.current.find((c) => c.id === active.id) ?? active)
        : null;
    setConversationHistory(
      kept ? [kept, ...result.items] : result.items,
      !result.hasNextPage,
    );
  }, [buildHistoryFilterOptions, chatService, setConversationHistory]);

  const onHistoryLoadMore = useCallback(async () => {
    if (!chatService) return;
    if (!conversationsCursor.current) {
      chatService.appendOlderHistoryItems([], true);
      return;
    }
    const result = await agentService.current.conversations.getAll({
      sort: SortOrder.Descending,
      pageSize: 20,
      cursor: conversationsCursor.current,
      ...buildHistoryFilterOptions(),
    });
    conversationsCursor.current = result.nextCursor;
    pastConversations.current = [...pastConversations.current, ...result.items];
    chatService.appendOlderHistoryItems(
      getConversationHistoryDisplayItems(result.items, t("new_chat")),
      !result.hasNextPage,
    );
  }, [buildHistoryFilterOptions, chatService, t]);

  const onHistorySearch = useCallback(
    async ({ searchText }: { searchText: string }) => {
      searchTextRef.current = searchText;
      await fetchFirstHistoryPage();
    },
    [fetchFirstHistoryPage],
  );

  const onClickDeleteConversation = useCallback(
    async (id: string) => {
      if (!chatService) return;
      await agentService.current.conversations.deleteById(id);
      setConversationHistory(
        pastConversations.current.filter((c) => c.id !== id),
      );
      if (activeConversationRef.current?.id === id) {
        onNewChat();
      }
    },
    [chatService, onNewChat, setConversationHistory],
  );

  const onRenameConversation = useCallback(
    async ({
      conversationId,
      name,
    }: AutopilotChatRenameConversationPayload) => {
      if (!chatService) return;
      try {
        // Stop the server's auto-labeling from overwriting the user's name.
        const updated = await agentService.current.conversations.updateById(
          conversationId,
          { label: name.trim(), autogenerateLabel: false },
        );
        setConversationHistory(
          pastConversations.current.map((c) =>
            c.id === conversationId ? { ...c, label: updated.label } : c,
          ),
        );
      } catch (err) {
        toast.error(t("error_rename_conversation"), {
          description: err instanceof Error ? err.message : String(err),
          toasterId,
        });
      }
    },
    [chatService, setConversationHistory, t, toasterId],
  );

  const onSendMessage = useCallback(
    async (data: AutopilotChatMessage) => {
      // An ended conversation accepts no input. Apollo has already added the
      // request bubble and loading state before this runs, and has no pre-hook
      // for sends, so re-show the banner and undo the loading state.
      if (endReasonRef.current) {
        showEndedBanner(endReasonRef.current);
        chatService?.stopResponse();
        return;
      }
      try {
        // required for debug-mode hosts that need to gate agent execution on the first user message
        onUserMessageSentRef.current?.({ content: data.content });
        // Clearing also unmounts a dismissed banner; Apollo's alert keeps its hidden state otherwise.
        chatService?.clearError();
        setHasMessages(true);
        setConnectionReadiness(null);
        // Joins a create already in flight, or creates one (debug mode, or
        // after a failed create).
        await ensureConversation();
        if (sessionNeedsRestart.current) {
          sessionNeedsRestart.current = false;
          setSessionAttempt((n) => n + 1);
        }
        const sessionHelper = await sessionReady.current.promise;
        const exchange = sessionHelper.startExchange();
        chatService?.setWaiting(true);
        chatService?.setShowLoading(true);
        activeExchange.current = exchange;
        setupExchangeHandlers(exchange);
        const message = exchange.startMessage({});
        await message.sendContentPart({
          mimeType: "text/plain",
          data: data.content,
        });
        for (const attachment of data.attachments || []) {
          const key = createFileKey(attachment);
          const attachmentOutput = uploadedAttachments.current.get(key);
          if (attachmentOutput) {
            const part = message.startContentPart({
              name: attachmentOutput.name,
              mimeType: attachmentOutput.mimeType,
              externalValue: {
                uri: attachmentOutput.uri,
              },
            });
            part.sendContentPartEnd();
          }
        }
        message.sendMessageEnd();
        trackTelemetry(TelemetryEvent.SendMessage, TelemetryStatus.Success);
      } catch (err) {
        // The user left the conversation this send was waiting on.
        if (err instanceof ConversationReplacedError) return;
        const errorMessage = err instanceof Error ? err.message : String(err);
        trackTelemetry(TelemetryEvent.SendMessage, TelemetryStatus.Error, {
          error: errorMessage,
        });
        chatService?.setError(t("error_send_message", { errorMessage }));
      }
    },
    [
      chatService,
      ensureConversation,
      setupExchangeHandlers,
      showEndedBanner,
      t,
    ],
  );

  const processAttachmentsInBatch = useCallback(
    async (attachmentBatch: AutopilotChatFileInfo[]) => {
      if (!chatService) return;

      const batchPromises = attachmentBatch.map(async (attachment) => {
        try {
          const file = convertAttachmentToFile(attachment);
          const conversation = await ensureConversation();
          const attachmentOutput =
            await agentService.current.conversations.uploadAttachment(
              conversation.id,
              file,
            );
          const key = createFileKey(attachment);
          uploadedAttachments.current.set(key, attachmentOutput);
          return { attachment, success: true, error: null };
        } catch (error) {
          // Clear loading state on error
          chatService.setAttachmentsLoading([
            { ...attachment, loading: false },
          ]);
          return { attachment, success: false, error };
        }
      });

      return await Promise.all(batchPromises);
    },
    [chatService, ensureConversation],
  );

  const onSetAttachments = useCallback(
    async ({ added }: { added: AutopilotChatFileInfo[] }) => {
      if (!chatService) return;

      if (added.length > 0) {
        // Filter out already uploaded files
        const newAttachments = added.filter((attachment) => {
          const key = createFileKey(attachment);
          return !uploadedAttachments.current.has(key);
        });

        if (newAttachments.length > 0) {
          chatService.setAttachmentsLoading(
            newAttachments.map((attachment) => ({
              ...attachment,
              loading: true,
            })),
          );

          const BATCH_SIZE = 3;
          const results = [];

          for (let i = 0; i < newAttachments.length; i += BATCH_SIZE) {
            const batch = newAttachments.slice(i, i + BATCH_SIZE);
            const batchResults = await processAttachmentsInBatch(batch);
            results.push(...(batchResults || []));
            chatService.setAttachmentsLoading(
              batch.map((attachment) => ({
                ...attachment,
                loading: false,
              })),
            );
            // The user left the conversation these were waiting on; drop the rest.
            if (
              batchResults?.some(
                (result) => result.error instanceof ConversationReplacedError,
              )
            ) {
              chatService.setAttachmentsLoading(
                newAttachments.slice(i + BATCH_SIZE).map((attachment) => ({
                  ...attachment,
                  loading: false,
                })),
              );
              return;
            }
          }

          // Handle any failed uploads
          const failedUploads = results.filter((result) => !result.success);
          if (failedUploads.length > 0) {
            chatService.setError(t("error_upload_attachments"));
            for (const failedUpload of failedUploads) {
              const key = createFileKey(failedUpload.attachment);
              uploadedAttachments.current.delete(key);
            }
            trackTelemetry(TelemetryEvent.FileAttached, TelemetryStatus.Error, {
              failedCount: failedUploads.length,
            });
          } else {
            trackTelemetry(
              TelemetryEvent.FileAttached,
              TelemetryStatus.Success,
              {
                fileCount: newAttachments.length,
              },
            );
          }
        }
      }
    },
    [chatService, processAttachmentsInBatch, t],
  );

  // Fetch one page of a conversation's exchanges, newest-first, advancing
  // `exchangesCursor` so the next call returns the chunk immediately older.
  // The returned page is sorted chronologically (ascending) so messages render
  // top-to-bottom; callers prepend each older page above the existing ones.
  const fetchExchanges = useCallback(
    async (
      conversationId: string,
      cursor?: { value: string },
    ): Promise<{ exchanges: ExchangeGetResponse[]; hasNextPage: boolean }> => {
      const conversation =
        await agentService.current.conversations.getById(conversationId);
      const result = await conversation.exchanges.getAll({
        pageSize: EXCHANGES_PAGE_SIZE,
        exchangeSort: SortOrder.Descending,
        messageSort: SortOrder.Ascending,
        ...(cursor ? { cursor } : {}),
      });
      exchangesCursor.current = result.nextCursor;
      const exchanges = [...result.items].sort(
        (a: ExchangeGetResponse, b: ExchangeGetResponse) =>
          new Date(a.createdTime).getTime() - new Date(b.createdTime).getTime(),
      );
      return { exchanges, hasNextPage: result.hasNextPage };
    },
    [],
  );

  const onClickOpenConversation = useCallback(
    async (id: string) => {
      if (!chatService) return;

      try {
        chatService.stopResponse();
        chatService.clearError();
        const selectedConversation = pastConversations.current.find(
          (c) => c.id === id,
        );
        if (!selectedConversation) return;

        resetTraceState();
        activateConversation(selectedConversation);
        exchangesCursor.current = undefined;
        // Set now, not after the transcript loads: an ended conversation gets
        // no session, so a send in between must be blocked rather than wait.
        endReasonRef.current = selectedConversation.endedTime
          ? (selectedConversation.endReason ?? ConversationEndReason.Completed)
          : null;

        connectionReadinessRenderer.unmountAll();
        const { exchanges } = await fetchExchanges(selectedConversation.id);
        const messages = mapExchangesToChatMessages(
          exchanges,
          toolDisplayModeRef.current,
        );
        chatService.setConversation(messages);
        setHasMessages(messages.length > 0);
        if (selectedConversation.endedTime) {
          applyEndedState(selectedConversation.endReason);
        }
        fetchConnectionReadiness();
        if (
          toolDisplayModeRef.current === "FullTrace" &&
          selectedConversation.traceId
        ) {
          void fetchAndApplyTrace(selectedConversation.traceId);
        }
        trackTelemetry(
          TelemetryEvent.OpenConversation,
          TelemetryStatus.Success,
          {
            conversationId: id,
          },
        );
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : String(err);
        trackTelemetry(TelemetryEvent.OpenConversation, TelemetryStatus.Error, {
          conversationId: id,
          error: errorMessage,
        });
        chatService.setError(t("error_open_conversation", { errorMessage }));
      }
    },
    [
      activateConversation,
      applyEndedState,
      chatService,
      connectionReadinessRenderer,
      fetchAndApplyTrace,
      fetchConnectionReadiness,
      fetchExchanges,
      resetTraceState,
      t,
    ],
  );

  // Apollo fires this when the user scrolls to the top of the message list.
  // Prepend the next older page; signal `done` (no more pages) so Apollo stops
  // requesting once the cursor is exhausted.
  const onConversationLoadMore = useCallback(async () => {
    if (!chatService) return;
    const conversationId = activeConversationRef.current?.id;
    if (!conversationId || !exchangesCursor.current) {
      chatService.prependOlderMessages([], true);
      return;
    }
    try {
      const { exchanges, hasNextPage } = await fetchExchanges(
        conversationId,
        exchangesCursor.current,
      );
      chatService.prependOlderMessages(
        mapExchangesToChatMessages(exchanges, toolDisplayModeRef.current),
        !hasNextPage,
      );
      applyTraceSpans(traceSpansRef.current);
    } catch (err) {
      chatService.prependOlderMessages([], true);
      const errorMessage = err instanceof Error ? err.message : String(err);
      trackTelemetry(TelemetryEvent.OpenConversation, TelemetryStatus.Error, {
        conversationId,
        error: errorMessage,
      });
    }
  }, [applyTraceSpans, chatService, fetchExchanges]);

  const initChat = useCallback(async () => {
    const run = ++initRun.current;
    const initKey = `${agentId}-${folderId}-${existingConversationId ?? ""}-${externalUserId ?? ""}`;
    // A re-init (the host changed agent, user or conversation) starts over:
    // leave the previous conversation, drop the cached agent, and show the
    // loader until this run finishes.
    resetConversation();
    initialConversationConsumed.current = false;
    resolvedAgent.current = null;
    setChatService(undefined);
    setShowInputPage(false);
    setError(null);
    try {
      initializedFor.current = initKey;
      setConnectionReadiness(null);
      if (autoBindTimeoutRef.current) {
        clearTimeout(autoBindTimeoutRef.current);
        autoBindTimeoutRef.current = null;
      }

      const agentRelease = await resolveAgent();
      if (initRun.current !== run) return;
      agentIdRef.current = agentRelease?.id;
      agentKeyRef.current = agentRelease?.releaseKey;
      toolDisplayModeRef.current =
        (agentRelease?.appearance as { displayMode?: string } | undefined)
          ?.displayMode ?? "InputsAndOutputs";
      isFlowAgentRef.current = isFlowAgent(agentRelease);
      const agentName = agentRelease?.name ?? "";

      // In debug mode the agent (and its derived schema) may not be resolvable,
      // so an explicit `inputSchema` override takes precedence. Normal usage
      // always derives the schema from the resolved agent release.
      // TODO(sdk-typing): drop the cast once @uipath/uipath-typescript exposes
      // inputSchema on AgentRelease. The API returns it but the SDK type
      // definitions don't include it yet.
      const inputSchema =
        (isDebugMode ? inputSchemaProp : undefined) ??
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ((agentRelease as any)?.inputSchema as InputSchema | undefined);

      // Show input page if there's an inputSchema with required properties and
      // this is a new conversation. Optional-only schemas use the settings panel.
      // Skip when resuming an existing conversation — its inputs were already
      // captured at creation time. The exception is debug mode, where the host
      // opens an empty conversation up front, so inputs are still collected here.
      const requiredInputs = hasRequiredInputs(inputSchema);
      // Persist the schema regardless of `hasRequiredInputs` so the settings
      // panel can render optional-input editing.
      setInputSchemaState(inputSchema ?? null);
      if (requiredInputs && (!existingConversationId || isDebugMode)) {
        setAgentNameState(agentName);
        setShowInputPage(true);
      }

      // Resolve the first-run experience: the host-provided config wins so
      // callers can override the welcome copy and starting prompts, falling
      // back to the agent's own appearance. Full screen then falls back to the
      // agent's name, so it always opens on the centered first-run screen; the
      // other modes already show the name in their header.
      const firstRunExperienceConfig = getFirstRunExperience(
        firstRunExperienceRef.current,
        agentRelease?.appearance,
        modeRef.current === AutopilotChatMode.FullScreen ? agentName : "",
      );

      // Fetch connection readiness (fire-and-forget; card is optional)
      if (agentRelease) {
        fetchConnectionReadiness();
        // Re-fetch after a delay to pick up server-side auto-bind results
        autoBindTimeoutRef.current = setTimeout(() => {
          autoBindTimeoutRef.current = null;
          if (initializedFor.current !== initKey) return;
          fetchConnectionReadiness();
        }, 1500);
      }

      // Persists agent inputs against the active conversation via
      // updateConversation. Server-side this applies to all subsequent
      // messages; we don't prepend per send.
      const handleApplySettingsInputs = async (
        inputs: Record<string, unknown>,
      ) => {
        // Waits for a create still in flight (or starts one) rather than
        // failing before the first message.
        const conversation = await ensureConversation();
        await agentService.current.conversations.updateById(conversation.id, {
          agentInput: { inline: inputs as JSONObject },
        });
        storedAgentInputs.current = inputs;
      };

      // TODO: if Apollo adds more renderer slots (footer, first-run, etc.),
      // extract this mount/unmount plumbing into a `useApolloRenderer` hook.
      const renderSettings = (element: HTMLElement) => {
        // Apollo clears `element.innerHTML` on every settings toggle, including
        // close — where it returns without calling the renderer back. So we
        // never mount the root on `element` itself: that wipe would detach the
        // root's DOM behind React's back, and the next unmount() would throw
        // `NotFoundError: The node to be removed is not a child of this node`.
        // React defers that throw out of Apollo's try/catch around the renderer,
        // so it escapes as an uncaught error and takes down the host app.
        // Mounting on our own child element keeps unmount() valid: the wipe
        // detaches the wrapper wholesale and its subtree stays attached to it.
        if (settingsRootRef.current) {
          settingsRootRef.current.unmount();
          settingsRootRef.current = null;
        }
        const mount = document.createElement("div");
        element.appendChild(mount);
        const root = createRoot(mount);
        settingsRootRef.current = root;
        const profileResetKey =
          agentId != null && folderId != null
            ? `${agentId}-${folderId}`
            : "no-agent";
        const conversationId = activeConversationRef.current?.id ?? "no-conv";
        const inputsResetKey = `${profileResetKey}-${conversationId}`;
        root.render(
          <PortalContainerProvider>
            <SettingsDialog
              profileResetKey={profileResetKey}
              conversationalAgent={agentService.current}
              onClose={() => {
                chatServiceRef.current?.toggleSettings(false);
                fetchConnectionReadiness();
              }}
              inputSchema={inputSchemaStateRef.current}
              initialInputs={storedAgentInputs.current}
              onApplyInputs={handleApplySettingsInputs}
              inputsResetKey={inputsResetKey}
              agentId={agentIdRef.current}
              folderId={folderIdRef.current}
              onConnectionsChanged={fetchConnectionReadiness}
            />
          </PortalContainerProvider>,
        );
      };

      const chatServiceInstance = AutopilotChatService.Instantiate({
        instanceName: `agent-${agentId}-${folderId}`,
        config: {
          mode: modeRef.current,
          renderer: rendererRef.current,
          locale: toApolloSupportedLocale(locale),
          theme: themeRef.current,
          readOnly,
          firstRunExperience: firstRunExperienceConfig && {
            title: firstRunExperienceConfig.title ?? "",
            description: firstRunExperienceConfig.description ?? "",
            suggestions: firstRunExperienceConfig.suggestions ?? [],
          },
          overrideLabels: {
            title: overrideLabelsRef.current?.title ?? agentName,
            footerDisclaimer:
              overrideLabelsRef.current?.footerDisclaimer ??
              t("disclaimer_message"),
            inputPlaceholder:
              overrideLabelsRef.current?.inputPlaceholder ??
              t("chat_input_placeholder"),
          },
          paginatedHistory: true,
          paginatedMessages: true,
          settingsRenderer: renderSettings,
          preHooks: {
            [AutopilotChatPreHookAction.RenameConversation]: async ({
              name,
            }: AutopilotChatRenameConversationPayload) => {
              const trimmed = name.trim();
              if (trimmed.length === 0) return false;
              if (trimmed.length > CONVERSATION_LABEL_MAX_LENGTH) {
                toast.error(t("error_rename_conversation_too_long_title"), {
                  description: t("error_rename_conversation_too_long", {
                    max: CONVERSATION_LABEL_MAX_LENGTH,
                  }),
                  toasterId,
                });
                return false;
              }
              return true;
            },
            [AutopilotChatPreHookAction.CitationClick]: async (
              citationData,
            ) => {
              // When preview is disabled, or the citation is not a
              // context-grounding citation (no download_url to a source
              // document), fall through to Apollo's default handling.
              if (!citationPreviewRef.current) return true;

              const { citation } = citationData;
              if (!citation?.download_url) return true;

              const pageNumber = Number(citation.page_number) || 1;
              try {
                const blob = await agentService.current.downloadCitationSource({
                  title: citation.title,
                  number: citation.number ?? citation.id ?? 0,
                  downloadUrl: citation.download_url,
                  pageNumber: String(pageNumber),
                });
                const file = new File([blob], citation.title, {
                  type: blob.type,
                });
                setCitationPreviewData({
                  file,
                  title: citation.title,
                  pageNumber,
                });
              } catch (e) {
                // Consume the click and surface the error in-dialog. Falling
                // through to Apollo's default would re-open the auth-gated
                // download_url in a new tab, which is exactly the 401 this
                // preview replaces.
                console.error("Failed to load citation document", e);
                setCitationPreviewData({
                  title: citation.title,
                  pageNumber,
                  error: true,
                });
              }
              return false;
            },
          },
          // Apollo's ApChat defaults message text to fontSizeM (14px); the
          // deprecated portal-shell chat used a larger size, so bump primary
          // text and markdown body tokens to fontSizeL (16px) to match.
          spacing: {
            primaryFontToken: FontVariantToken.fontSizeL,
            primaryBoldFontToken: FontVariantToken.fontSizeLBold,
            suggestionFontToken: FontVariantToken.fontSizeL,
            markdownTokens: {
              p: FontVariantToken.fontSizeL,
              li: FontVariantToken.fontSizeL,
              th: FontVariantToken.fontSizeL,
              td: FontVariantToken.fontSizeL,
              em: FontVariantToken.fontSizeL,
              del: FontVariantToken.fontSizeL,
              strong: FontVariantToken.fontSizeLBold,
              link: FontVariantToken.fontSizeL,
            },
          },
          disabledFeatures: {
            fullScreen: true,
            preview: true,
            close: true,
            // Apollo defaults `settings: true`; flip it so our gear renders
            // by default. Consumers can still opt out via `disabledFeatures`.
            settings: false,
            // Apollo disables rename by default; enable it to match the react-sdk.
            renameChat: false,
            ...(!agentId ? { newChat: true, history: true } : {}),
            ...disabledFeaturesRef.current,
            ...(isFlowAgentRef.current ? { stopResponse: true } : {}),
          },
        },
      });

      chatServiceRef.current = chatServiceInstance;

      // Singleton keeps the previous conversation's unsent draft and error banner; drop both before the awaits.
      chatServiceInstance.setPrompt("");
      chatServiceInstance.clearError();
      endReasonRef.current = null;

      if (!disabledFeaturesRef.current?.attachments) {
        chatServiceInstance.setAllowedAttachments(ALLOWED_ATTACHMENTS);
      }

      // Clean up any existing readiness roots before replacing the conversation
      connectionReadinessRenderer.unmountAll();

      if (existingConversationId) {
        // Already fetched when the agent was derived from the conversation.
        let conversation = activeConversationRef.current;
        if (!conversation) {
          conversation = await agentService.current.conversations.getById(
            existingConversationId,
          );
          if (initRun.current !== run) return;
          initialConversationConsumed.current = true;
        }
        exchangesCursor.current = undefined;
        const { exchanges } = await fetchExchanges(conversation.id);
        if (initRun.current !== run) return;
        // The session effect starts its session once the chat is up (none if ended).
        activateConversation(conversation);
        const messages = mapExchangesToChatMessages(exchanges);
        chatServiceInstance.setConversation(
          mapExchangesToChatMessages(exchanges, toolDisplayModeRef.current),
        );
        if (conversation.endedTime) {
          applyEndedState(conversation.endReason);
        }
        if (
          toolDisplayModeRef.current === "FullTrace" &&
          conversation.traceId
        ) {
          void fetchAndApplyTrace(conversation.traceId);
        }
        setHasMessages(messages.length > 0);
      } else {
        // AutopilotChatService is a singleton, so it may still hold the
        // previous agent's messages. Reset before showing the new agent.
        chatServiceInstance.setConversation([]);
      }

      setChatService(chatServiceInstance);
      // Created behind the mounted chat, never behind the loader; a send in
      // the meantime joins it.
      if (
        !existingConversationId &&
        shouldCreateUpfront(agentRelease, requiredInputs)
      ) {
        startConversationInBackground();
      }
    } catch (err) {
      if (initRun.current !== run) return;
      const message =
        err instanceof Error ? err.message : t("error_initialize_chat");
      setError(message);
      initializedFor.current = null;
    }
  }, [
    activateConversation,
    agentId,
    applyEndedState,
    ensureConversation,
    fetchAndApplyTrace,
    folderId,
    existingConversationId,
    externalUserId,
    inputSchemaProp,
    isDebugMode,
    locale,
    readOnly,
    resetConversation,
    resolveAgent,
    shouldCreateUpfront,
    startConversationInBackground,
    fetchConnectionReadiness,
    connectionReadinessRenderer,
    fetchExchanges,
    t,
    toasterId,
  ]);

  const handleReload = useCallback(() => {
    initializedFor.current = null;
    setError(null);
    setChatService(undefined);
    initChat();
  }, [initChat]);

  const onStopResponse = useCallback(() => {
    if (!chatService) return;
    stopTracePolling(true);
    if (activeExchange.current) {
      // Flows own their exchange; a client exchange end strands them. Switching
      // conversations still fires StopResponse.
      if (!isFlowAgentRef.current) {
        activeExchange.current.sendExchangeEnd();
        chatService.setError(t("response_stopped_message"), "warn");
      }
      activeExchange.current = null;
    }
    chatService.sendOutputStreamEvent({ turnComplete: true });
    chatService.setShowLoading(false);
    chatService.setWaiting(false);
  }, [chatService, stopTracePolling, t]);

  const onCustomHeaderActionClicked = useCallback(
    (action: AutopilotChatCustomHeaderAction) => {
      if (action.id.startsWith("eval-")) {
        const evaluationSetId = action.id.replace("eval-", "");
        onEvaluationSetClickedRef.current?.(evaluationSetId);
      }
    },
    [],
  );

  const onFeedback = useCallback((data: AutopilotChatActionPayload) => {
    pendingFeedback.current = data;
    setFeedbackIsPositive(!!data.action.details?.isPositive);
    setFeedbackDialogOpen(true);
  }, []);

  const onFeedbackSubmit = useCallback((comment: string) => {
    const data = pendingFeedback.current;
    // Streamed messages may not have meta.exchangeId yet; guard against it
    // so a missing id doesn't throw and leave the dialog stuck open.
    const exchangeId = data?.message.meta?.exchangeId;
    if (data && exchangeId) {
      const rating = data.action.details?.isPositive
        ? FeedbackRating.Positive
        : FeedbackRating.Negative;
      activeConversationRef.current?.exchanges?.createFeedback(exchangeId, {
        rating,
        comment,
      });
      trackTelemetry(TelemetryEvent.Feedback, TelemetryStatus.Success, {
        rating,
      });
    }
    pendingFeedback.current = null;
    setFeedbackDialogOpen(false);
  }, []);

  const onFeedbackCancel = useCallback(() => {
    // Apollo's internal Feedback handler marks the message with `feedback`
    // as soon as the thumb is clicked, which collapses the actions row to
    // the chosen (disabled) thumb. If the user then cancels the dialog,
    // re-send the message without `feedback` so the row reverts to both
    // thumbs and the click can be retried.
    const messageId = pendingFeedback.current?.message.id;
    if (messageId && chatService) {
      const current = chatService
        .getConversation()
        .find((m) => m.id === messageId);
      if (current?.feedback) {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { feedback: _feedback, ...withoutFeedback } = current;
        chatService.sendResponse(withoutFeedback);
      }
    }
    pendingFeedback.current = null;
    setFeedbackDialogOpen(false);
  }, [chatService]);

  // Initialize chat service on mount and when agentId/folderId/externalUserId/existingConversationId changes
  useEffect(() => {
    const initKey = `${agentId}-${folderId}-${existingConversationId ?? ""}-${externalUserId ?? ""}`;
    if (initializedFor.current !== initKey) {
      initChat();
    }
  }, [agentId, folderId, existingConversationId, externalUserId, initChat]);

  useEffect(() => {
    return () => {
      if (settingsRootRef.current) {
        settingsRootRef.current.unmount();
        settingsRootRef.current = null;
      }
      if (autoBindTimeoutRef.current) {
        clearTimeout(autoBindTimeoutRef.current);
        autoBindTimeoutRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    chatService?.setTheme(theme);
  }, [chatService, theme]);

  useEffect(() => {
    chatService?.setChatMode(mode);
  }, [chatService, mode]);

  useEffect(() => {
    chatService?.setRenderer(renderer);
  }, [chatService, renderer]);

  // The widget translates these labels itself (Apollo's own strings follow
  // `locale`), so re-send them when the locale or the host's labels change.
  const footerDisclaimerLabel = overrideLabels?.footerDisclaimer;
  const inputPlaceholderLabel = overrideLabels?.inputPlaceholder;
  useEffect(() => {
    chatService?.setOverrideLabels({
      footerDisclaimer: footerDisclaimerLabel ?? t("disclaimer_message"),
      inputPlaceholder: inputPlaceholderLabel ?? t("chat_input_placeholder"),
    });
  }, [chatService, footerDisclaimerLabel, inputPlaceholderLabel, t]);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  // On unmount, supersede any init run or create still in flight so neither
  // touches the unmounted widget (the session effect ends the session), and
  // stop trace polling. Clearing initializedFor lets StrictMode's simulated
  // remount initialize again.
  useEffect(() => {
    return () => {
      initRun.current += 1;
      initializedFor.current = null;
      conversationGeneration.current += 1;
      pendingCreate.current = null;
      if (tracePollIntervalRef.current) {
        clearInterval(tracePollIntervalRef.current);
        tracePollIntervalRef.current = null;
      }
    };
  }, []);

  // Release React state held by the imperative tool-confirmation and client-side tool roots.
  useEffect(() => {
    return () => {
      toolConfirmationRenderer.unmountAll();
      clientSideToolRenderer.unmountAll();
      connectionReadinessRenderer.unmountAll();
    };
  }, [
    toolConfirmationRenderer,
    clientSideToolRenderer,
    connectionReadinessRenderer,
  ]);

  // Register event handlers after chatService is available
  useEffect(() => {
    if (!chatService) return;

    let cancelled = false;
    const unsubscribers: Array<() => void> = [];

    const registerEvents = async () => {
      try {
        if (agentId) {
          await fetchFirstHistoryPage();
          // only register handlers if the component is still mounted
          if (cancelled) return;
        }
        unsubscribers.push(
          chatService.on(AutopilotChatEvent.NewChat, onNewChat),
          chatService.on(AutopilotChatEvent.Request, onSendMessage),
          chatService.on(AutopilotChatEvent.SetAttachments, onSetAttachments),
          chatService.on(
            AutopilotChatEvent.OpenConversation,
            onClickOpenConversation,
          ),
          chatService.on(
            AutopilotChatEvent.DeleteConversation,
            onClickDeleteConversation,
          ),
          chatService.on(
            AutopilotChatEvent.RenameConversation,
            onRenameConversation,
          ),
          chatService.on(AutopilotChatEvent.HistoryLoadMore, onHistoryLoadMore),
          chatService.on(
            AutopilotChatEvent.ConversationLoadMore,
            onConversationLoadMore,
          ),
          chatService.on(AutopilotChatEvent.HistorySearch, onHistorySearch),
          chatService.on(AutopilotChatEvent.Feedback, onFeedback),
          chatService.on(AutopilotChatEvent.StopResponse, onStopResponse),
        );
        chatService.injectMessageRenderer({
          name: MessageWidget.ToolConfirmation,
          render: (container, message) =>
            toolConfirmationRenderer.render(
              container,
              message,
              toolConfirmationLabelsRef.current ?? undefined,
            ),
        });
        chatService.injectMessageRenderer({
          name: MessageWidget.ClientSideToolInput,
          render: (container, message) =>
            clientSideToolRenderer.render(container, message),
        });
        chatService.injectMessageRenderer({
          name: CONNECTION_READINESS_CARD,
          render: (container, message) =>
            connectionReadinessRenderer.render(container, message, {
              conversationalAgent: agentService.current,
              onAllConnected: () => setConnectionReadiness(null),
              onOpenSettings: () =>
                chatServiceRef.current?.toggleSettings(true),
              onConnectionsChanged: fetchConnectionReadiness,
            }),
        });
      } catch (err) {
        const message =
          err instanceof Error ? err.message : t("error_load_history");
        setError(message);
      }
    };

    registerEvents();

    return () => {
      cancelled = true;
      unsubscribers.forEach((unsub) => unsub());
    };
  }, [
    agentId,
    chatService,
    fetchFirstHistoryPage,
    folderId,
    onClickDeleteConversation,
    onClickOpenConversation,
    onConversationLoadMore,
    onFeedback,
    onHistoryLoadMore,
    onHistorySearch,
    onNewChat,
    onRenameConversation,
    onSendMessage,
    onSetAttachments,
    onStopResponse,
    t,
    toolConfirmationRenderer,
    clientSideToolRenderer,
    connectionReadinessRenderer,
    fetchConnectionReadiness,
  ]);

  // Inject/update/remove the connection readiness card as a message in the
  // conversation — matching CAS positioning inside the scroll area.
  useEffect(() => {
    if (!chatService) return;
    const conversation = chatService.getConversation() ?? [];
    const existingIndex = conversation.findIndex(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (m: any) => m.id === CONNECTION_READINESS_CARD_ID,
    );

    if (connectionReadiness) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const cardMessage: any = {
        id: CONNECTION_READINESS_CARD_ID,
        content: " ",
        created_at: new Date().toISOString(),
        role: "assistant",
        widget: CONNECTION_READINESS_CARD,
        done: true,
        disableActions: true,
        meta: {
          connectors: connectionReadiness,
          agentId: agentIdRef.current,
          folderId: folderIdRef.current,
          defaultCollapsed: hasMessages,
        },
      };
      if (existingIndex >= 0) {
        const updated = [...conversation];
        updated[existingIndex] = cardMessage;
        chatService.setConversation(updated);
      } else if (hasMessages) {
        // Append so the card appears near the bottom where the user is
        chatService.setConversation([...conversation, cardMessage]);
      } else {
        // Fresh conversation — card goes first, before welcome message
        chatService.setConversation([cardMessage, ...conversation]);
      }
    } else if (existingIndex >= 0) {
      // Defer unmount — the card's onAllConnected effect may still be
      // executing inside this root's React tree when this runs.
      queueMicrotask(() => connectionReadinessRenderer.unmountAll());
      chatService.setConversation(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        conversation.filter((m: any) => m.id !== CONNECTION_READINESS_CARD_ID),
      );
    }
  }, [
    chatService,
    connectionReadiness,
    hasMessages,
    connectionReadinessRenderer,
  ]);

  useEffect(() => {
    if (
      !chatService ||
      !isDebugMode ||
      !evaluationSets ||
      evaluationSets.length === 0
    ) {
      return;
    }

    const label = addToEvalButtonLabel || t("add_to_evaluation_set");
    const sortedSets = sortEvaluationSets(evaluationSets);
    const headerAction: AutopilotChatCustomHeaderAction = {
      id: "add-to-eval-button",
      name: label,
      description: label,
      disabled: !hasMessages,
      children: sortedSets.map((s) => ({
        id: `eval-${s.id}`,
        name: s.name,
        description: t("add_to_evaluation_set_named", { name: s.name }),
        disabled: s.isDisabled,
      })),
    };
    chatService.setCustomHeaderActions([headerAction]);
    const unsubscribe = chatService.on(
      AutopilotChatEvent.CustomHeaderActionClicked,
      onCustomHeaderActionClicked,
    );
    return () => {
      unsubscribe?.();
    };
  }, [
    chatService,
    isDebugMode,
    evaluationSets,
    addToEvalButtonLabel,
    hasMessages,
    onCustomHeaderActionClicked,
    t,
  ]);

  return (
    <div className="uipath-conversational-agent-chat">
      {/* Apollo's color tokens switch on a theme class, which the scoped
          stylesheet only honors on a descendant of the widget root (or on the
          host's <body>), so `theme` is applied here rather than on the root.
          Without an explicit `theme`, no class is set and the host's <body>
          theme class keeps applying, as before. */}
      <div
        ref={setThemeRoot}
        className={
          themeProp ? `uipath-cas-theme ${themeProp}` : "uipath-cas-theme"
        }
      >
        <PortalContainerProvider>
          {!error && showInputPage && inputSchemaState && (
            <InputsPage
              key={`${agentId}-${inputsInstance}`}
              agentName={agentNameState}
              inputSchema={inputSchemaState}
              onSubmit={async (data) => {
                const inputs = data as Record<string, unknown>;
                if (isDebugMode && existingConversationId) {
                  await agentService.current.conversations.updateById(
                    existingConversationId,
                    { agentInput: { inline: inputs as JSONObject } },
                  );
                } else {
                  // Awaited so a failure shows on the form and the user keeps
                  // the inputs this conversation requires.
                  await startConversation(inputs as JSONObject);
                }
                storedAgentInputs.current = inputs;
                setShowInputPage(false);
              }}
            />
          )}

          {error && (
            <div className="info-container">
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
              <Button variant={"outline"} onClick={handleReload}>
                {t("reload")}
              </Button>
            </div>
          )}

          {!error && !chatService && (
            <div className="info-container">
              <div>{t("loading")}</div>
              <Loader />
            </div>
          )}

          {!error && chatService && !showInputPage && (
            <>
              <ApChat
                key={locale}
                chatServiceInstance={chatService}
                locale={toApolloSupportedLocale(locale)}
                theme={theme}
                enableInternalThemeProvider
                // Keep Apollo's tooltips, menus and history popover inside the
                // themed wrapper; portalled to <body> they'd lose the theme tokens.
                portalContainer={themeRoot ?? undefined}
              />
            </>
          )}

          <FeedbackDialog
            open={feedbackDialogOpen}
            isPositive={feedbackIsPositive}
            onOpenChange={setFeedbackDialogOpen}
            onSubmit={onFeedbackSubmit}
            onCancel={onFeedbackCancel}
          />
          <Dialog
            open={!!citationPreviewData}
            onOpenChange={(open) => {
              if (!open) setCitationPreviewData(null);
            }}
          >
            {citationPreviewData && (
              <DialogContent className="sm:max-w-4xl">
                <DialogHeader>
                  <DialogTitle>{citationPreviewData.title}</DialogTitle>
                </DialogHeader>
                {citationPreviewData.error ? (
                  <Column
                    w="full"
                    align="center"
                    justify="center"
                    style={{ height: "60vh", maxHeight: "600px" }}
                  >
                    {t("file_preview_error")}
                  </Column>
                ) : (
                  <FilePreviewer
                    file={citationPreviewData.file}
                    usePdfJs={usePdfJsViewer}
                    pageNumber={citationPreviewData.pageNumber}
                    iframeParams={`#page=${citationPreviewData.pageNumber}`}
                  />
                )}
              </DialogContent>
            )}
          </Dialog>
          <Toaster id={toasterId} position="top-right" richColors />
        </PortalContainerProvider>
      </div>
    </div>
  );
};
