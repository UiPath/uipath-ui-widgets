import {
  ApChat,
  AutopilotChatActionPayload,
  AutopilotChatCustomHeaderAction,
  AutopilotChatEvent,
  AutopilotChatFileInfo,
  AutopilotChatMessage,
  AutopilotChatMode,
  AutopilotChatService,
} from "@uipath/apollo-react/material/components";
import { i18n } from "@lingui/core";
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
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { FeedbackDialog } from "./components/FeedbackDialog";
import "./ConversationalAgentChat.css";
import {
  AttachFileOutput,
  ConversationalAgentChatProps,
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

const DEFAULT_FOOTER_DISCLAIMER =
  "Agent can make mistakes. Please double check the responses.";
const DEFAULT_INPUT_PLACEHOLDER = "Talk with your agent...";

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
  const agentService = useRef(new ConversationalAgent(sdk));
  const currentConversation = useRef<ConversationCreateResponse | null>(null);
  const initializedFor = useRef<string | null>(null);
  // Refs for values used in initChat that shouldn't trigger re-initialization
  const localeRef = useRef(locale);
  localeRef.current = locale;
  const themeRef = useRef(theme);
  themeRef.current = theme;
  const overrideLabelsRef = useRef(overrideLabels);
  overrideLabelsRef.current = overrideLabels;
  const disabledFeaturesRef = useRef(disabledFeatures);
  disabledFeaturesRef.current = disabledFeatures;
  const firstRunExperienceRef = useRef(firstRunExperience);
  firstRunExperienceRef.current = firstRunExperience;
  const initialConversationConsumed = useRef(false);
  const session = useRef<SessionStream | null>(null);
  const pastConversations = useRef<ConversationCreateResponse[]>([]);
  const uploadedAttachments = useRef(new Map<string, AttachFileOutput>());
  const conversationsCursor = useRef<{ value: string } | undefined>(undefined);
  const [chatService, setChatService] = useState<AutopilotChatService>();
  const [error, setError] = useState<string | null>(null);
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
        chatService.setError(
          error.message || "Something went wrong. Please try again.",
        );
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

          message.onToolCallStart((toolCall: ToolCallStream) => {
            const startEvent = toolCall.startEvent;
            const startTimeIso = new Date().toISOString();
            const toolInput = startEvent.input
              ? normalizeInput(startEvent.input)
              : {};
            chatService.sendResponse({
              id: toolCall.toolCallId,
              content: `Performing ${startEvent.toolName}`,
              created_at: startTimeIso,
              widget: MessageWidget.ApolloAgentsToolCall,
              meta: {
                toolName: startEvent.toolName,
                input: toolInput,
                startTime: startTimeIso,
              },
            });

            toolCall.onToolCallEnd((endEvent: ToolCallEndEvent) => {
              const endTimeIso = new Date().toISOString();
              chatService.sendResponse({
                id: toolCall.toolCallId,
                content: `Performing ${startEvent.toolName}`,
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
    [chatService],
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
      if (!agentId || !folderId) {
        throw new Error(
          "Either conversationId or agentId and folderId must be provided",
        );
      }
      const newConversation = await agentService.current.conversations.create(
        agentId,
        folderId,
      );
      currentConversation.current = newConversation;
      return newConversation;
    }, [agentId, folderId, existingConversationId]);

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
      getConversationHistoryDisplayItems(result.items),
      !result.hasNextPage,
    );
  }, [chatService]);

  const onClickDeleteConversation = useCallback(
    async (id: string) => {
      if (!chatService) return;
      await agentService.current.conversations.deleteById(id);
      pastConversations.current = pastConversations.current.filter(
        (c) => c.id !== id,
      );
      chatService.setHistory(
        getConversationHistoryDisplayItems(pastConversations.current),
      );
      if (currentConversation.current?.id === id) {
        onNewChat();
      }
    },
    [chatService, onNewChat],
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
        chatService?.setError(`Failed to send message: ${errorMessage}`);
      }
    },
    [chatService, getSessionHelper, setupExchangeHandlers],
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
            chatService.setError(
              "Failed to upload attachments. Please try again.",
            );
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
    [chatService, processAttachmentsInBatch],
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
        chatService.setError(`Failed to open conversation: ${errorMessage}`);
      }
    },
    [chatService, fetchExchanges],
  );

  const initChat = useCallback(async () => {
    const initKey = `${agentId}-${folderId}-${existingConversationId ?? ""}`;
    try {
      initializedFor.current = initKey;

      const agentRelease =
        agentId && folderId
          ? await agentService.current.getById(agentId, folderId)
          : undefined;

      const agentName = agentRelease?.name ?? "";

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
              (agentName ? `Welcome to ${agentName}!` : ""),
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
          locale: localeRef.current,
          theme: themeRef.current,
          readOnly,
          firstRunExperience: firstRunExperienceConfig,
          overrideLabels: {
            title: overrideLabelsRef.current?.title ?? agentName,
            footerDisclaimer:
              overrideLabelsRef.current?.footerDisclaimer ??
              DEFAULT_FOOTER_DISCLAIMER,
            inputPlaceholder:
              overrideLabelsRef.current?.inputPlaceholder ??
              DEFAULT_INPUT_PLACEHOLDER,
          },
          paginatedHistory: true,
          disabledFeatures: {
            fullScreen: true,
            preview: true,
            close: true,
            ...(!agentId || !folderId ? { newChat: true, history: true } : {}),
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
        err instanceof Error ? err.message : "Failed to initialize chat";
      setError(message);
      initializedFor.current = null;
    }
  }, [
    agentId,
    folderId,
    existingConversationId,
    readOnly,
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

  // Initialize chat service on mount and when agentId/folderId changes
  useEffect(() => {
    const initKey = `${agentId}-${folderId}-${existingConversationId ?? ""}`;
    if (initializedFor.current !== initKey) {
      initChat();
    }
  }, [agentId, folderId, existingConversationId, initChat]);

  // Update locale/theme on the existing service. Locale must be set
  // synchronously (not in an effect) so that when ApChat remounts via
  // key={locale}, its LocaleProvider reads the correct value from
  // chatService.getLocale() on first render.
  // Sync locale to the service and Lingui before ApChat remounts via
  // key={locale}. Uses useLayoutEffect so the values are set before the
  // browser paints. We set _locale directly instead of calling
  // setLocale()/activate() because those publish events that trigger
  // setState in other components.
  useLayoutEffect(() => {
    if (chatService && chatService.getLocale() !== locale) {
      /* eslint-disable @typescript-eslint/no-explicit-any, react-hooks/immutability */
      // Mutating internal properties directly to avoid triggering event-bus
      // side effects (setState in other components). The key={locale} on
      // ApChat ensures a clean remount that reads these values.
      (chatService as any)._locale = locale;
      (i18n as any)._locale = locale;
      /* eslint-enable @typescript-eslint/no-explicit-any, react-hooks/immutability */
    }
  }, [chatService, locale]);

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
        if (agentId && folderId) {
          const result = await agentService.current.conversations.getAll({
            sort: SortOrder.Descending,
            pageSize: 20,
          });
          // only register handlers if the component is still mounted
          if (cancelled) return;
          conversationsCursor.current = result.nextCursor;
          pastConversations.current = result.items;
          chatService.setHistory(
            getConversationHistoryDisplayItems(pastConversations.current),
            !result.hasNextPage,
          );
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
          chatService.on(AutopilotChatEvent.Feedback, onFeedback),
          chatService.on(AutopilotChatEvent.StopResponse, onStopResponse),
        );
      } catch (err) {
        const message =
          err instanceof Error
            ? err.message
            : "Failed to load conversation history";
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
      {error && (
        <div className="info-container">
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
          <Button variant={"outline"} onClick={handleReload}>
            Reload
          </Button>
        </div>
      )}

      {!error && !chatService && (
        <div className="info-container">
          <Alert>
            <AlertDescription>Loading...</AlertDescription>
          </Alert>
        </div>
      )}

      {!error && chatService && (
        <ApChat
          key={locale}
          chatServiceInstance={chatService}
          locale={locale}
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
