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
  InterruptType,
  MessageStream,
  SessionStream,
  SortOrder,
  ToolCallEndEvent,
  ToolCallStream,
} from "@uipath/uipath-typescript/conversational-agent";
import type { ToolCallConfirmationValue } from "@uipath/uipath-typescript/conversational-agent";
import type {
  AgentGetResponse,
  AgentGetByIdResponse,
} from "@uipath/uipath-typescript/conversational-agent";
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { useTranslation } from "react-i18next";
import { InputsPage } from "./components/InputsPage";
import type { InputSchema } from "./components/AgentSchemaForm/types";
import { FeedbackDialog } from "./components/FeedbackDialog";
import { renderToolConfirmation } from "./components/ToolConfirmationRenderer";
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
  mapExchangesToChatMessages,
  normalizeInput,
  sortEvaluationSets,
} from "./utils";
import { trackTelemetry } from "./utils/telemetryUtils";
import { initI18n } from "./i18n";

initI18n();

// Map widget Locale to Apollo supported locale to allow for locales not supported by Apollo
function toApolloSupportedLocale(widgetLocale: Locale): SupportedLocale {
  return widgetLocale === "keys" ? "en" : (widgetLocale as SupportedLocale);
}

/**
 * Mutates a message's meta in the chat service's conversation array. Needed to support tool confirmation status
 * when user approves or cancels a tool call. Fragile: relies on getConversation() returning references,
 * not copies. TODO: use update message API if exposed by apollo chat service in the future.
 */
function updateMessageMeta(
  chatService: AutopilotChatService,
  messageId: string,
  patch: Record<string, unknown>,
) {
  const msg = chatService
    .getConversation()
    ?.find((m: AutopilotChatMessage) => m.id === messageId);
  if (msg?.meta) Object.assign(msg.meta, patch);
}


export const ConversationalAgentChat = ({
  sdk,
  agentId,
  folderId,
  existingConversationId,
  locale = "en",
  theme = "light",
  readOnly = false,
  overrideLabels,
  firstRunExperience,
  disabledFeatures,
  isDebugMode = false,
  evaluationSets,
  addToEvalButtonLabel,
  onEvaluationSetClicked,
}: ConversationalAgentChatProps) => {
  // must change language before useTranslation is called to avoid stale translations
  if (i18next.language !== locale) {
    i18next.changeLanguage(locale);
  }
  const { t } = useTranslation();
  const agentService = useRef(new ConversationalAgent(sdk));
  const currentConversation = useRef<ConversationCreateResponse | null>(null);
  const initializedFor = useRef<string | null>(null);
  const themeRef = useRef(theme);
  const overrideLabelsRef = useRef(overrideLabels);
  const disabledFeaturesRef = useRef(disabledFeatures);
  const firstRunExperienceRef = useRef(firstRunExperience);
  // useLayoutEffect is ok here because the work is minimal enough that the cost is essentially zero
  // needed because React 19 doesn't support ref writes on render
  useLayoutEffect(() => {
    themeRef.current = theme;
    overrideLabelsRef.current = overrideLabels;
    disabledFeaturesRef.current = disabledFeatures;
    firstRunExperienceRef.current = firstRunExperience;
  }, [theme, overrideLabels, disabledFeatures, firstRunExperience]);
  const initialConversationConsumed = useRef(false);
  const resolvedAgent = useRef<AgentGetResponse | null>(null);
  const session = useRef<SessionStream | null>(null);
  const pastConversations = useRef<ConversationCreateResponse[]>([]);
  const uploadedAttachments = useRef(new Map<string, AttachFileOutput>());
  const conversationsCursor = useRef<{ value: string } | undefined>(undefined);
  const [chatService, setChatService] = useState<AutopilotChatService>();
  const [error, setError] = useState<string | null>(null);
  const [inputSchemaState, setInputSchemaState] = useState<InputSchema | null>(
    null,
  );
  const [showInputPage, setShowInputPage] = useState(false);
  const [agentNameState, setAgentNameState] = useState("");
  const activeExchange = useRef<ExchangeStream | null>(null);
  const [feedbackDialogOpen, setFeedbackDialogOpen] = useState(false);
  const pendingFeedback = useRef<AutopilotChatActionPayload | null>(null);
  const [hasMessages, setHasMessages] = useState(false);
  const onEvaluationSetClickedRef = useRef(onEvaluationSetClicked);
  onEvaluationSetClickedRef.current = onEvaluationSetClicked;

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

          message.onContentPartStart((contentPart: ContentPartStream) => {
            if (contentPart.startEvent.mimeType.startsWith("text/")) {
              let fullResponse = "";

              contentPart.onChunk((chunk: ContentPartChunkEvent) => {
                fullResponse += chunk.data;
                chatService.sendResponse({
                  id: messageId,
                  content: chunk.data,
                  created_at: messageTimestamp,
                  widget: MessageWidget.AI,
                  stream: true,
                  done: false,
                });
              });

              contentPart.onContentPartEnd(() => {
                chatService.sendResponse({
                  id: messageId,
                  content: fullResponse,
                  created_at: messageTimestamp,
                  widget: MessageWidget.AI,
                  stream: false,
                  done: true,
                });
              });
            }
          });

          // Track tool calls so we can defer the spinner when an interrupt arrives
          const pendingToolCalls = new Map<
            string,
            {
              toolCall: ToolCallStream;
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
              content: t("performing_action_message", { action: pending.toolName }),
              created_at: pending.startTimeIso,
              widget: MessageWidget.ApolloAgentsToolCall,
              meta: {
                toolName: pending.toolName,
                input: pending.toolInput,
                startTime: pending.startTimeIso,
              },
            });
          };

          message.onToolCallStart((toolCall: ToolCallStream) => {
            const startEvent = toolCall.startEvent;
            const startTimeIso = new Date().toISOString();
            const toolInput = startEvent.input
              ? normalizeInput(startEvent.input)
              : {};

            pendingToolCalls.set(toolCall.toolCallId, {
              toolCall,
              toolName: startEvent.toolName,
              toolInput,
              startTimeIso,
              spinnerSent: false,
            });

            // Show spinner immediately — if an interrupt arrives, the
            // confirmation form replaces it and the spinner is deferred
            // until the user confirms.
            sendToolCallSpinner(toolCall.toolCallId);

            toolCall.onToolCallEnd((endEvent: ToolCallEndEvent) => {
              const pending = pendingToolCalls.get(toolCall.toolCallId);
              if (pending?.spinnerSent) {
                const endTimeIso = new Date().toISOString();
                chatService.sendResponse({
                  id: toolCall.toolCallId,
                  content: t("performing_action_message", { action: startEvent.toolName }),
                  created_at: endTimeIso,
                  widget: MessageWidget.ApolloAgentsToolCall,
                  meta: {
                    toolName: startEvent.toolName,
                    input: toolInput,
                    startTime: startTimeIso,
                    output: endEvent.output,
                    endTime: endTimeIso,
                    isError: endEvent.isError,
                  },
                });
              }
              pendingToolCalls.delete(toolCall.toolCallId);
            });
          });

          message.onInterruptStart(({ interruptId, startEvent }) => {
            if (startEvent.type === InterruptType.ToolCallConfirmation) {
              const confirmationData =
                startEvent.value as ToolCallConfirmationValue;
              const widgetMessageId = `confirmation-${confirmationData.toolCallId}`;

              // Hide the spinner — it will be re-sent after the user confirms
              const pending = pendingToolCalls.get(confirmationData.toolCallId);
              if (pending) pending.spinnerSent = false;

              chatService.sendResponse({
                id: widgetMessageId,
                content: "Tool confirmation required",
                created_at: new Date().toISOString(),
                widget: MessageWidget.ToolConfirmation,
                stream: false,
                done: true,
                meta: {
                  confirmationData,
                  isCompleted: false,
                  wasRejected: false,
                  onApprove: (endValue: { input?: unknown }) => {
                    updateMessageMeta(chatService, widgetMessageId, {
                      isCompleted: true,
                    });
                    sendToolCallSpinner(confirmationData.toolCallId);
                    message.sendInterruptEnd(interruptId, {
                      type: InterruptType.ToolCallConfirmation,
                      value: { approved: true, input: endValue.input },
                    });
                  },
                  onCancel: () => {
                    updateMessageMeta(chatService, widgetMessageId, {
                      isCompleted: true,
                      wasRejected: true,
                    });
                    message.sendInterruptEnd(interruptId, {
                      type: InterruptType.ToolCallConfirmation,
                      value: { approved: false },
                    });
                  },
                },
              });
            }
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
    AgentGetResponse | AgentGetByIdResponse | undefined
  > => {
    if (!agentId) return undefined;
    if (resolvedAgent.current?.id === agentId) return resolvedAgent.current;
    if (folderId) {
      // folderId was passed — use getById directly (skips the getAll round-trip)
      const agent = await agentService.current.getById(agentId, folderId);
      resolvedAgent.current = agent;
      return agent;
    }
    // No folderId — resolve from getAll
    const agents = await agentService.current.getAll();
    const agent = agents.find((a) => a.id === agentId);
    if (agent) resolvedAgent.current = agent;
    return agent;
  }, [agentId, folderId]);

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
        throw new Error(
          "Either existingConversationId or agentId must be provided",
        );
      }
      const newConversation = await agent.conversations.create();
      currentConversation.current = newConversation;
      return newConversation;
    }, [existingConversationId, resolveAgent]);

  const getSessionHelper = useCallback(async (): Promise<SessionStream> => {
    if (session.current) {
      return session.current;
    }
    const conversation = await getConversation();
    const sessionHelper = agentService.current.conversations.startSession(
      conversation.id,
      { echo: false },
    );
    return new Promise((resolve) => {
      sessionHelper.onSessionStarted(() => {
        session.current = sessionHelper;
        resolve(sessionHelper);
      });
    });
  }, [getConversation]);

  const onNewChat = useCallback(() => {
    currentConversation.current = null;
    session.current = null;
    activeExchange.current = null;
    setHasMessages(false);
    trackTelemetry(TelemetryEvent.NewChat, TelemetryStatus.Success);
  }, []);

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
    });
    conversationsCursor.current = result.nextCursor;
    pastConversations.current = [...pastConversations.current, ...result.items];
    chatService.appendOlderHistoryItems(
      getConversationHistoryDisplayItems(result.items, t("new_chat")),
      !result.hasNextPage,
    );
  }, [chatService, t]);

  const onClickDeleteConversation = useCallback(
    async (id: string) => {
      if (!chatService) return;
      await agentService.current.conversations.deleteById(id);
      pastConversations.current = pastConversations.current.filter(
        (c) => c.id !== id,
      );
      chatService.setHistory(
        getConversationHistoryDisplayItems(pastConversations.current, t("new_chat")),
      );
      if (currentConversation.current?.id === id) {
        onNewChat();
      }
    },
    [chatService, onNewChat, t],
  );

  const onSendMessage = useCallback(
    async (data: AutopilotChatMessage) => {
      try {
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
    const initKey = `${agentId}-${existingConversationId ?? ""}`;
    try {
      initializedFor.current = initKey;

      const agent = await resolveAgent();
      // getById returns appearance data; if we resolved from getAll, do a follow-up call
      const agentRelease =
        agent && "appearance" in agent
          ? (agent as AgentGetByIdResponse)
          : agent
            ? await agentService.current.getById(agent.id, agent.folderId)
            : undefined;

      const agentName = agentRelease?.name ?? "";

      // Extract inputSchema (returned by API but not typed in SDK)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const inputSchema = (agentRelease as any)?.inputSchema as
        | InputSchema
        | undefined;

      // Show input page if there's an inputSchema with properties and this is a new conversation
      const hasRequiredInputs = (inputSchema?.required?.length ?? 0) > 0;
      if (hasRequiredInputs) {
        setInputSchemaState(inputSchema ?? null);
        setAgentNameState(agentName);
        setShowInputPage(true);
      }

      // All-or-nothing first-run experience configuration
      // If an override is passed use it, otherwise use the agent's default.
      // Finally, if the agent has no default, use fallbacks/empty values
      const firstRunExperienceConfig = firstRunExperienceRef.current
        ? {
            title: firstRunExperienceRef.current.title ?? "",
            description: firstRunExperienceRef.current.description ?? "",
            suggestions: firstRunExperienceRef.current.suggestions ?? [],
          }
        : {
            title:
              agentRelease?.appearance?.welcomeTitle ||
              (agentName ? t("welcome_to_agent", { agentName }) : ""),
            description: agentRelease?.appearance?.welcomeDescription || "",
            suggestions: (agentRelease?.appearance?.startingPrompts || []).map(
              (prompt) => ({
                label: prompt.displayPrompt,
                prompt: prompt.actualPrompt,
              }),
            ),
          };

      const chatServiceInstance = AutopilotChatService.Instantiate({
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
          disabledFeatures: {
            fullScreen: true,
            preview: true,
            close: true,
            ...(!agentId ? { newChat: true, history: true } : {}),
            ...disabledFeaturesRef.current,
          },
        },
      });

      if (existingConversationId) {
        const conversation = await getConversation();
        const allExchanges = await fetchExchanges(conversation.id);
        chatServiceInstance.setConversation(
          mapExchangesToChatMessages(allExchanges),
        );
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
    existingConversationId,
    locale,
    readOnly,
    t,
    resolveAgent,
    getConversation,
    fetchExchanges,
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
    setFeedbackDialogOpen(true);
  }, []);

  const onFeedbackSubmit = useCallback((comment: string) => {
    const data = pendingFeedback.current;
    if (data) {
      const rating = data.action.details?.isPositive
        ? FeedbackRating.Positive
        : FeedbackRating.Negative;
      currentConversation.current?.exchanges?.createFeedback(
        data.message.meta.exchangeId,
        {
          rating,
          comment,
        },
      );
      trackTelemetry(TelemetryEvent.Feedback, TelemetryStatus.Success, {
        rating,
      });
    }
    pendingFeedback.current = null;
    setFeedbackDialogOpen(false);
  }, []);

  const onFeedbackCancel = useCallback(() => {
    pendingFeedback.current = null;
    setFeedbackDialogOpen(false);
  }, []);

  // Initialize chat service on mount and when agentId changes
  useEffect(() => {
    const initKey = `${agentId}-${existingConversationId ?? ""}`;
    if (initializedFor.current !== initKey) {
      initChat();
    }
  }, [agentId, existingConversationId, initChat]);

  useEffect(() => {
    chatService?.setTheme(theme);
  }, [chatService, theme]);

  // Register event handlers after chatService is available
  useEffect(() => {
    if (!chatService) return;

    let cancelled = false;
    const unsubscribers: Array<() => void> = [];

    const registerEvents = async () => {
      try {
        if (agentId) {
          const result = await agentService.current.conversations.getAll({
            sort: SortOrder.Descending,
            pageSize: 20,
          });
          // only register handlers if the component is still mounted
          if (cancelled) return;
          conversationsCursor.current = result.nextCursor;
          pastConversations.current = result.items;
          chatService.setHistory(
            getConversationHistoryDisplayItems(pastConversations.current, t("new_chat")),
            !result.hasNextPage,
          );
        }
        if (cancelled) return;
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
          chatService.on(AutopilotChatEvent.Feedback, onFeedback),
          chatService.on(AutopilotChatEvent.StopResponse, onStopResponse),
        );
        chatService.injectMessageRenderer({
          name: MessageWidget.ToolConfirmation,
          render: (container, message) =>
            renderToolConfirmation(container, message),
        });
      } catch (err) {
        const message =
          err instanceof Error
            ? err.message
            : t("error_load_history");
        setError(message);
      }
    };

    registerEvents();

    return () => {
      cancelled = true;
      unsubscribers.forEach((unsub) => unsub());
    };
  }, [
    chatService,
    onClickDeleteConversation,
    onClickOpenConversation,
    onFeedback,
    onHistoryLoadMore,
    onNewChat,
    onSendMessage,
    onSetAttachments,
    onStopResponse,
    t,
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

    const label = addToEvalButtonLabel || "Add to Evaluation Set";
    const sortedSets = sortEvaluationSets(evaluationSets);
    const headerAction: AutopilotChatCustomHeaderAction = {
      id: "add-to-eval-button",
      name: label,
      description: label,
      disabled: !hasMessages,
      children: sortedSets.map((s) => ({
        id: `eval-${s.id}`,
        name: s.name,
        description: `Add to ${s.name}`,
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
  }, [chatService, isDebugMode, evaluationSets, addToEvalButtonLabel, hasMessages, onCustomHeaderActionClicked]);

  return (
    <div className="uipath-conversational-agent-chat">
      {!error && showInputPage && inputSchemaState && (
        <InputsPage
          key={agentId}
          agentName={agentNameState}
          inputSchema={inputSchemaState}
          onSubmit={() => {
            // TODO: Pass form data as agentInput to conversations.create() once
            // @uipath/uipath-typescript adds agentInput to ConversationCreateOptions.
            // The react-sdk sent this as: { agentInput: { inline: formData } }
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
          <Alert>
            <AlertDescription>{t("loading")}</AlertDescription>
          </Alert>
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
        onOpenChange={setFeedbackDialogOpen}
        onSubmit={onFeedbackSubmit}
        onCancel={onFeedbackCancel}
      />
    </div>
  );
};
