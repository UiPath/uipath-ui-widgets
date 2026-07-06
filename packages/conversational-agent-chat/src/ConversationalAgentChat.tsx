import {
  ApChat,
  AutopilotChatActionPayload,
  AutopilotChatCustomHeaderAction,
  AutopilotChatEvent,
  AutopilotChatFileInfo,
  AutopilotChatMessage,
  AutopilotChatMode,
  AutopilotChatService,
  type SupportedLocale,
} from "@uipath/apollo-react/material/components";
import { FontVariantToken } from "@uipath/apollo-core";
import i18next from "i18next";
import { Alert, AlertDescription, Button } from "@uipath/apollo-wind";
import {
  ContentPartChunkEvent,
  ContentPartStream,
  ConversationalAgent,
  ConversationCreateResponse,
  ErrorStartHandlerArgs,
  ExchangeGetResponse,
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
  JSONObject,
  JSONValue,
  ToolCallConfirmationValue,
} from "@uipath/uipath-typescript/conversational-agent";
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { createRoot, type Root } from "react-dom/client";
import { useTranslation } from "react-i18next";
import { InputsPage } from "./components/InputsPage";
import type { InputSchema } from "./components/AgentSchemaForm/types";
import { FeedbackDialog } from "./components/FeedbackDialog";
import { Loader } from "./components/Loader";
import { SettingsDialog } from "./components/SettingsDialog";
import type { ToolConfirmationLabels } from "./components/ToolConfirmation";
import {
  createToolConfirmationRenderer,
  type ToolConfirmationRenderer,
} from "./components/ToolConfirmationRenderer";
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
  mapCitationSource,
  mapExchangesToChatMessages,
  normalizeInput,
  sortEvaluationSets,
} from "./utils";
import { trackTelemetry } from "./utils/telemetryUtils";
import { initI18n } from "./i18n";
import { resolveAgent as fetchAgentRelease } from "./utils/resolveAgent";

initI18n();

const TOOL_CONFIRMATION_WIDGET_ID_PREFIX = "confirmation-";
type ConversationCreateOptionsArg = Parameters<
  ConversationalAgent["conversations"]["create"]
>[2];

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
  theme = "light",
  readOnly = false,
  overrideLabels,
  firstRunExperience,
  disabledFeatures,
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
  // must change language before useTranslation is called to avoid stale translations
  if (i18next.language !== locale) {
    i18next.changeLanguage(locale);
  }
  const { t } = useTranslation();
  const agentService = useRef(
    new ConversationalAgent(sdk, {
      ...(externalUserId ? { externalUserId } : {}),
      surfaceName,
      surfaceVersion,
    }),
  );
  const currentConversation = useRef<ConversationCreateResponse | null>(null);
  const initializedFor = useRef<string | null>(null);
  const themeRef = useRef(theme);
  const overrideLabelsRef = useRef(overrideLabels);
  const disabledFeaturesRef = useRef(disabledFeatures);
  const firstRunExperienceRef = useRef(firstRunExperience);
  const initialConversationConsumed = useRef(false);
  const resolvedAgent = useRef<AgentGetByIdResponse | null>(null);
  const folderIdRef = useRef<number | undefined>(folderId);
  const toolConfirmationLabelsRef = useRef<ToolConfirmationLabels | null>(null);
  // Per-instance so unmounting one widget doesn't tear down another's React roots.
  const toolConfirmationRenderer = useMemo<ToolConfirmationRenderer>(
    () => createToolConfirmationRenderer(),
    [],
  );
  // useLayoutEffect is ok here because the work is minimal enough that the cost is essentially zero
  // needed because React 19 doesn't support ref writes on render

  useLayoutEffect(() => {
    themeRef.current = theme;
    overrideLabelsRef.current = overrideLabels;
    disabledFeaturesRef.current = disabledFeatures;
    firstRunExperienceRef.current = firstRunExperience;
    folderIdRef.current = folderId;
    onEvaluationSetClickedRef.current = onEvaluationSetClicked;
    onUserMessageSentRef.current = onUserMessageSent;
    toolConfirmationLabelsRef.current = {
      cancel: t("cancel"),
      confirm: t("tool_confirmation_confirm"),
      statusCancelled: t("tool_confirmation_status_cancelled"),
      statusConfirmed: t("tool_confirmation_status_confirmed"),
    };
  }, [
    theme,
    overrideLabels,
    disabledFeatures,
    firstRunExperience,
    onEvaluationSetClicked,
    onUserMessageSent,
    folderId,
    t,
  ]);
  // Rebuild the SDK service when sdk or externalUserId change. Skip the first run because the
  // useRef initializer above already built it with the initial values. The chat is re-initialized
  // via initKey (which includes externalUserId) so dependent refs (session, currentConversation,
  // activeExchange) are reset by onNewChat / initChat downstream.
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
  const pastConversations = useRef<ConversationCreateResponse[]>([]);
  const uploadedAttachments = useRef(new Map<string, AttachFileOutput>());
  const conversationsCursor = useRef<{ value: string } | undefined>(undefined);
  const agentIdRef = useRef<number | undefined>(undefined);
  const agentKeyRef = useRef<string | undefined>(undefined);
  const toolDisplayModeRef = useRef<string | undefined>(undefined);
  const searchTextRef = useRef<string>("");

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
  const [hasMessages, setHasMessages] = useState(false);
  const onEvaluationSetClickedRef = useRef(onEvaluationSetClicked);
  const onUserMessageSentRef = useRef(onUserMessageSent);
  const chatServiceRef = useRef<AutopilotChatService | null>(null);
  const settingsRootRef = useRef<Root | null>(null);
  // Last-applied agent inputs for the active conversation. Pre-populates the
  // settings inputs form when reopened; cleared on New Chat.
  const storedAgentInputs = useRef<Record<string, unknown>>({});
  // Mirrors `inputSchemaState` so the imperative `renderSettings` closure always
  // sees the current schema without re-instantiating the chat service.
  const inputSchemaStateRef = useRef<InputSchema | null>(null);
  useLayoutEffect(() => {
    inputSchemaStateRef.current = inputSchemaState;
  }, [inputSchemaState]);

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
              meta: {
                toolName: pending.toolName,
                input: pending.toolInput,
                startTime: pending.startTimeIso,
                displayMode: toolDisplayModeRef.current,
              },
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

            pendingToolCalls.set(toolCall.toolCallId, {
              toolName: startEvent.toolName,
              toolInput,
              startTimeIso,
              spinnerSent: false,
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
                  toolCall.sendToolCallConfirm({ approved: false });
                },
              });
            } else {
              // No confirmation needed — show spinner immediately.
              sendToolCallSpinner(toolCall.toolCallId);
            }

            toolCall.onToolCallEnd((endEvent: ToolCallEndEvent) => {
              const pending = pendingToolCalls.get(toolCall.toolCallId);
              if (pending?.spinnerSent) {
                const endTimeIso = new Date().toISOString();
                chatService.sendResponse({
                  id: toolCall.toolCallId,
                  content: t("performing_action_message", {
                    action: startEvent.toolName,
                  }),
                  created_at: endTimeIso,
                  widget: MessageWidget.ApolloAgentsToolCall,
                  meta: {
                    toolName: startEvent.toolName,
                    input: toolInput,
                    startTime: startTimeIso,
                    output: endEvent.output,
                    endTime: endTimeIso,
                    isError: endEvent.isError,
                    displayMode: toolDisplayModeRef.current,
                  },
                });
              }
              pendingToolCalls.delete(toolCall.toolCallId);
            });
          });
        }
      });

      exchange.onExchangeEnd(() => {
        activeExchange.current = null;
        chatService.sendOutputStreamEvent({ turnComplete: true });
        chatService.setShowLoading(false);
        chatService.setWaiting(false);
        setHasMessages(true);
      });
    },
    [chatService, t],
  );

  const resolveAgent = useCallback(async (): Promise<
    AgentGetByIdResponse | undefined
  > => {
    let effectiveAgentId = agentId;
    let effectiveFolderId = folderIdRef.current;
    // When the host passes only existingConversationId, derive the agent from
    // the conversation so the header title + FRE still render for empty replays.
    if (effectiveAgentId == null && existingConversationId) {
      if (
        !currentConversation.current &&
        !initialConversationConsumed.current
      ) {
        const existing = await agentService.current.conversations.getById(
          existingConversationId,
        );
        currentConversation.current = existing;
        initialConversationConsumed.current = true;
      }
      const conv = currentConversation.current;
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
    resolvedAgent.current = release;
    folderIdRef.current = release.folderId;
    return release;
  }, [agentId, existingConversationId, sdk, externalUserId]);

  const setConversationHistory = useCallback(
    (next: ConversationCreateResponse[], allLoaded?: boolean) => {
      pastConversations.current = next;
      if (!chatService) return;
      chatService.setHistory(
        getConversationHistoryDisplayItems(next, t("new_chat")),
        allLoaded,
      );
    },
    [chatService, t],
  );

  const getConversation =
    useCallback(async (): Promise<ConversationCreateResponse> => {
      if (currentConversation.current) {
        return currentConversation.current;
      }
      // Only load the existing conversation on first call to getConversation
      if (existingConversationId && !initialConversationConsumed.current) {
        const existing = await agentService.current.conversations.getById(
          existingConversationId,
        );
        currentConversation.current = existing;
        initialConversationConsumed.current = true;
        return existing;
      }
      const agent = await resolveAgent();
      if (!agent) {
        throw new Error(t("error_missing_conversation_params"));
      }
      const newConversation = await agent.conversations.create(
        jobStartOverrides ? { jobStartOverrides } : undefined,
      );
      currentConversation.current = newConversation;
      // Show the new conversation in the sidebar immediately so its label
      // (auto-generated by the service after the first exchange) can refresh
      // in place via onLabelUpdated rather than waiting for a history reload.
      setConversationHistory([newConversation, ...pastConversations.current]);
      return newConversation;
    }, [
      existingConversationId,
      jobStartOverrides,
      resolveAgent,
      setConversationHistory,
      t,
    ]);

  const getSessionHelper = useCallback(async (): Promise<SessionStream> => {
    if (session.current) {
      return session.current;
    }
    const conversation = await getConversation();
    const sessionHelper = agentService.current.conversations.startSession(
      conversation.id,
      { echo: false },
    );
    // Refresh the sidebar label when the service auto-generates one (or the
    // label is updated via the API). Bind to this session's conversation id
    // so a stale event from an orphaned session can't mislabel the active one.
    sessionHelper.onLabelUpdated(({ label }) => {
      setConversationHistory(
        pastConversations.current.map((c) =>
          c.id === conversation.id ? { ...c, label } : c,
        ),
      );
    });
    return new Promise((resolve) => {
      sessionHelper.onSessionStarted(() => {
        session.current = sessionHelper;
        resolve(sessionHelper);
      });
    });
  }, [getConversation, setConversationHistory]);

  const onNewChat = useCallback(() => {
    currentConversation.current = null;
    session.current = null;
    activeExchange.current = null;
    storedAgentInputs.current = {};
    setHasMessages(false);
    // Re-show the InputsPage with a cleared form when the agent's schema has
    // required inputs. Bumping the counter forces an unmount/remount via the
    // key on <InputsPage>, which resets internal form state.
    if ((inputSchemaState?.required?.length ?? 0) > 0) {
      setInputsInstance((n) => n + 1);
      setShowInputPage(true);
    }
    trackTelemetry(TelemetryEvent.NewChat, TelemetryStatus.Success);
  }, [inputSchemaState]);

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
    setConversationHistory(result.items, !result.hasNextPage);
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
      if (currentConversation.current?.id === id) {
        onNewChat();
      }
    },
    [chatService, onNewChat, setConversationHistory],
  );

  const onSendMessage = useCallback(
    async (data: AutopilotChatMessage) => {
      try {
        // required for debug-mode hosts that need to gate agent execution on the first user message
        onUserMessageSentRef.current?.({ content: data.content });
        const sessionHelper = await getSessionHelper();
        const exchange = sessionHelper.startExchange();
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
        const errorMessage = err instanceof Error ? err.message : String(err);
        trackTelemetry(TelemetryEvent.SendMessage, TelemetryStatus.Error, {
          error: errorMessage,
        });
        chatService?.setError(t("error_send_message", { errorMessage }));
      }
    },
    [chatService, getSessionHelper, setupExchangeHandlers, t],
  );

  const processAttachmentsInBatch = useCallback(
    async (attachmentBatch: AutopilotChatFileInfo[]) => {
      if (!chatService) return;

      const batchPromises = attachmentBatch.map(async (attachment) => {
        try {
          const file = convertAttachmentToFile(attachment);
          const conversation = await getConversation();
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
    [chatService, getConversation],
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

  const fetchExchanges = useCallback(
    async (conversationId: string): Promise<ExchangeGetResponse[]> => {
      const conversation =
        await agentService.current.conversations.getById(conversationId);
      const allExchanges = (await conversation.exchanges.getAll()).items;
      allExchanges.sort(
        (a: ExchangeGetResponse, b: ExchangeGetResponse) =>
          new Date(a.createdTime).getTime() - new Date(b.createdTime).getTime(),
      );
      return allExchanges;
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

        currentConversation.current = selectedConversation;
        session.current = null;

        const allExchanges = await fetchExchanges(selectedConversation.id);
        const messages = mapExchangesToChatMessages(allExchanges);
        chatService.setConversation(messages);
        setHasMessages(messages.length > 0);
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
    [chatService, fetchExchanges, t],
  );

  const initChat = useCallback(async () => {
    const initKey = `${agentId}-${folderId}-${existingConversationId ?? ""}-${externalUserId ?? ""}`;
    try {
      initializedFor.current = initKey;

      const agentRelease = await resolveAgent();
      agentIdRef.current = agentRelease?.id;
      agentKeyRef.current = agentRelease?.releaseKey;
      toolDisplayModeRef.current = (
        agentRelease?.appearance as { displayMode?: string } | undefined
      )?.displayMode;
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
      const hasRequiredInputs = (inputSchema?.required?.length ?? 0) > 0;
      // Persist the schema regardless of `hasRequiredInputs` so the settings
      // panel can render optional-input editing.
      setInputSchemaState(inputSchema ?? null);
      if (hasRequiredInputs && (!existingConversationId || isDebugMode)) {
        setAgentNameState(agentName);
        setShowInputPage(true);
      }

      // If the agent provides any first-run appearance data, show only what
      // the agent provides. The `firstRunExperience` prop is a fallback used
      // when the agent has no welcome title, description, or starting
      // prompts at all — it must not be mixed with partial agent data.
      const appearance = agentRelease?.appearance;
      const agentSuggestions = (appearance?.startingPrompts ?? []).map(
        (prompt) => ({
          label: prompt.displayPrompt,
          prompt: prompt.actualPrompt,
        }),
      );
      const agentHasFre =
        !!appearance?.welcomeTitle ||
        !!appearance?.welcomeDescription ||
        agentSuggestions.length > 0;
      const hostFallback = firstRunExperienceRef.current;
      const firstRunExperienceConfig = agentHasFre
        ? {
            title: appearance?.welcomeTitle ?? "",
            description: appearance?.welcomeDescription ?? "",
            suggestions: agentSuggestions,
          }
        : {
            title: hostFallback?.title ?? "",
            description: hostFallback?.description ?? "",
            suggestions: hostFallback?.suggestions ?? [],
          };

      // Persists agent inputs against the active conversation via
      // updateConversation. Server-side this applies to all subsequent
      // messages; we don't prepend per send.
      const handleApplySettingsInputs = async (
        inputs: Record<string, unknown>,
      ) => {
        const conversationId = currentConversation.current?.id;
        if (!conversationId) {
          throw new Error(t("error_missing_conversation_params"));
        }
        await agentService.current.conversations.updateById(conversationId, {
          agentInput: { inline: inputs as JSONObject },
        });
        storedAgentInputs.current = inputs;
      };

      // TODO: if Apollo adds more renderer slots (footer, first-run, etc.),
      // extract this mount/unmount plumbing into a `useApolloRenderer` hook.
      const renderSettings = (element: HTMLElement) => {
        // Apollo clears `element.innerHTML` before every call to the renderer.
        // Reusing a React root would leave its virtual DOM out of sync with the
        // wiped real DOM, so we unmount and recreate on every invocation.
        if (settingsRootRef.current) {
          settingsRootRef.current.unmount();
          settingsRootRef.current = null;
        }
        const root = createRoot(element);
        settingsRootRef.current = root;
        const profileResetKey =
          agentId != null && folderId != null
            ? `${agentId}-${folderId}`
            : "no-agent";
        const conversationId = currentConversation.current?.id ?? "no-conv";
        const inputsResetKey = `${profileResetKey}-${conversationId}`;
        root.render(
          <SettingsDialog
            profileResetKey={profileResetKey}
            conversationalAgent={agentService.current}
            onClose={() => chatServiceRef.current?.toggleSettings(false)}
            inputSchema={inputSchemaStateRef.current}
            initialInputs={storedAgentInputs.current}
            onApplyInputs={handleApplySettingsInputs}
            inputsResetKey={inputsResetKey}
          />,
        );
      };

      const chatServiceInstance = AutopilotChatService.Instantiate({
        instanceName: `agent-${agentId}-${folderId}`,
        config: {
          mode: AutopilotChatMode.Embedded,
          locale: toApolloSupportedLocale(locale),
          theme: themeRef.current,
          readOnly,
          firstRunExperience: firstRunExperienceConfig,
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
          settingsRenderer: renderSettings,
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
            ...(!agentId ? { newChat: true, history: true } : {}),
            ...disabledFeaturesRef.current,
          },
        },
      });

      chatServiceRef.current = chatServiceInstance;

      if (existingConversationId) {
        const conversation = await getConversation();
        const allExchanges = await fetchExchanges(conversation.id);
        chatServiceInstance.setConversation(
          mapExchangesToChatMessages(allExchanges),
        );
      } else {
        // AutopilotChatService is a singleton, so it may still hold the
        // previous agent's messages. Reset before showing the new agent.
        chatServiceInstance.setConversation([]);
      }

      setChatService(chatServiceInstance);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : t("error_initialize_chat");
      setError(message);
      initializedFor.current = null;
    }
  }, [
    agentId,
    folderId,
    existingConversationId,
    externalUserId,
    inputSchemaProp,
    isDebugMode,
    locale,
    readOnly,
    resolveAgent,
    getConversation,
    fetchExchanges,
    t,
  ]);

  const handleReload = useCallback(() => {
    initializedFor.current = null;
    setError(null);
    setChatService(undefined);
    initChat();
  }, [initChat]);

  const onStopResponse = useCallback(() => {
    if (!chatService) return;
    if (activeExchange.current) {
      activeExchange.current.sendExchangeEnd();
      activeExchange.current = null;
    }
    chatService.sendOutputStreamEvent({ turnComplete: true });
    chatService.setShowLoading(false);
    chatService.setWaiting(false);
  }, [chatService]);

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
      currentConversation.current?.exchanges?.createFeedback(exchangeId, {
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
    };
  }, []);

  useEffect(() => {
    chatService?.setTheme(theme);
  }, [chatService, theme]);

  // Close the SDK session on unmount so the WebSocket doesn't linger.
  useEffect(() => {
    return () => {
      try {
        activeExchange.current?.sendExchangeEnd();
      } catch {
        /* exchange already ended */
      }
      try {
        session.current?.sendSessionEnd();
      } catch {
        /* session already closed */
      }
      activeExchange.current = null;
      session.current = null;
    };
  }, []);

  // Release React state held by the imperative tool-confirmation roots.
  useEffect(() => {
    return () => {
      toolConfirmationRenderer.unmountAll();
    };
  }, [toolConfirmationRenderer]);

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
          chatService.on(AutopilotChatEvent.HistoryLoadMore, onHistoryLoadMore),
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
    onFeedback,
    onHistoryLoadMore,
    onHistorySearch,
    onNewChat,
    onSendMessage,
    onSetAttachments,
    onStopResponse,
    t,
    toolConfirmationRenderer,
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
              const agent = await resolveAgent();
              if (!agent) {
                throw new Error(t("error_missing_conversation_params"));
              }
              const conversation = await agent.conversations.create({
                ...(jobStartOverrides ? { jobStartOverrides } : {}),
                agentInput: { inline: inputs as JSONObject },
              } as ConversationCreateOptionsArg);
              currentConversation.current = conversation;
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
        <ApChat
          key={locale}
          chatServiceInstance={chatService}
          locale={toApolloSupportedLocale(locale)}
          theme={theme}
          enableInternalThemeProvider
        />
      )}

      <FeedbackDialog
        open={feedbackDialogOpen}
        isPositive={feedbackIsPositive}
        onOpenChange={setFeedbackDialogOpen}
        onSubmit={onFeedbackSubmit}
        onCancel={onFeedbackCancel}
      />
    </div>
  );
};
