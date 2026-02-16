import {
  ApChat,
  AutopilotChatEvent,
  AutopilotChatFileInfo,
  AutopilotChatMessage,
  AutopilotChatMode,
  AutopilotChatService,
} from "@uipath/apollo-react/material/components";
import { Alert, AlertDescription, Button } from "@uipath/apollo-wind";
import {
  ContentPartChunkEvent,
  ContentPartEventHelper,
  Conversation,
  ConversationalAgent,
  ConversationCreateResponse,
  ErrorStartHandlerArgs,
  ExchangeEventHelper,
  ExchangeWithHelpers,
  MessageEventHelper,
  SessionEventHelper,
  ToolCallEndEvent,
  ToolCallEventHelper,
} from "@uipath/uipath-typescript/conversational-agent";
import { useCallback, useEffect, useRef, useState } from "react";
import "./ConversationalAgentChat.css";
import {
  AttachFileOutput,
  ConversationalAgentChatProps,
  MessageWidget,
} from "./types";
import {
  convertAttachmentToFile,
  createFileKey,
  getConversationHistoryDisplayItems,
  mapExchangesToChatMessages,
  normalizeInput,
} from "./utils";

export const ConversationalAgentChat = ({
  sdk,
  agentId,
  folderId,
}: ConversationalAgentChatProps) => {
  const agentService = useRef(new ConversationalAgent(sdk));
  const currentConversation = useRef<ConversationCreateResponse | null>(null);
  const initializedFor = useRef<string | null>(null);
  const session = useRef<SessionEventHelper | null>(null);
  const pastConversations = useRef<Conversation[]>([]);
  const uploadedAttachments = useRef(new Map<string, AttachFileOutput>());
  const [chatService, setChatService] = useState<AutopilotChatService>();
  const [error, setError] = useState<string | null>(null);

  const setupExchangeHandlers = useCallback(
    (exchange: ExchangeEventHelper) => {
      if (!chatService) return;

      exchange.onErrorStart((error: ErrorStartHandlerArgs) => {
        console.error("[Events] Exchange error:", error);
      });

      exchange.onMessageStart((message: MessageEventHelper) => {
        if (message.startEvent.role === "assistant") {
          message.onContentPartStart((contentPart: ContentPartEventHelper) => {
            if (contentPart.startEvent.mimeType.startsWith("text/")) {
              let fullResponse = "";

              contentPart.onChunk((chunk: ContentPartChunkEvent) => {
                fullResponse += chunk.data;
                chatService.sendResponse({
                  id: contentPart.message.messageId,
                  content: chunk.data,
                  created_at: contentPart.message.startEvent.timestamp,
                  widget: MessageWidget.AI,
                  stream: true,
                  done: false,
                });
              });

              contentPart.onContentPartEnd(() => {
                chatService.sendResponse({
                  id: contentPart.message.messageId,
                  content: fullResponse,
                  created_at: contentPart.message.startEvent.timestamp,
                  widget: MessageWidget.AI,
                  stream: false,
                  done: true,
                });
              });
            }
          });

          message.onToolCallStart((toolCall: ToolCallEventHelper) => {
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
    },
    [chatService],
  );

  const getConversation =
    useCallback(async (): Promise<ConversationCreateResponse> => {
      if (currentConversation.current) {
        return currentConversation.current;
      }
      const newConversation = await agentService.current.conversations.create({
        agentReleaseId: agentId,
        folderId,
      });
      currentConversation.current = newConversation;
      return newConversation;
    }, [agentId, folderId]);

  const getSessionHelper =
    useCallback(async (): Promise<SessionEventHelper> => {
      if (session.current) {
        return session.current;
      }
      const conversation = await getConversation();
      const sessionHelper = agentService.current.events.startSession({
        conversationId: conversation.conversationId,
        echo: false,
      });
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
  }, []);

  const onSendMessage = useCallback(
    async (data: AutopilotChatMessage) => {
      const sessionHelper = await getSessionHelper();
      const exchange = sessionHelper.startExchange();
      setupExchangeHandlers(exchange);
      exchange.startMessage({}, async (message) => {
        await message.sendContentPart({
          mimeType: "text/plain",
          data: data.content,
        });
        for (const attachment of data.attachments || []) {
          const key = createFileKey(attachment);
          const attachmentOutput = uploadedAttachments.current.get(key);
          if (attachmentOutput) {
            await message.sendContentPart({
              name: attachmentOutput.name,
              mimeType: attachmentOutput.mimeType,
              externalValue: {
                uri: attachmentOutput.uri,
              },
            });
          }
        }
      });
    },
    [getSessionHelper, setupExchangeHandlers],
  );

  const processAttachmentsInBatch = useCallback(
    async (attachmentBatch: AutopilotChatFileInfo[]) => {
      if (!chatService) return;

      const batchPromises = attachmentBatch.map(async (attachment) => {
        try {
          const file = convertAttachmentToFile(attachment);
          const conversation = await getConversation();
          const attachmentOutput =
            await agentService.current.conversations.attachments.upload(
              conversation.conversationId,
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
          }
        }
      }
    },
    [chatService, processAttachmentsInBatch],
  );

  const fetchExchanges = useCallback(
    async (conversationId: string): Promise<ExchangeWithHelpers[]> => {
      const allExchanges = (
        await agentService.current.conversations.exchanges.getAll(
          conversationId,
        )
      ).items;
      allExchanges.sort(
        (a, b) =>
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
      );
      return allExchanges;
    },
    [],
  );

  const onClickOpenConversation = useCallback(
    async (id: string) => {
      if (!chatService) return;

      chatService.stopResponse();
      chatService.clearError();
      const selectedConversation = pastConversations.current.find(
        (c) => c.conversationId === id,
      );
      if (!selectedConversation) return;

      currentConversation.current = selectedConversation;
      session.current = null;

      const allExchanges = await fetchExchanges(
        selectedConversation.conversationId,
      );
      chatService.setConversation(mapExchangesToChatMessages(allExchanges));
    },
    [chatService, fetchExchanges],
  );

  const initChat = useCallback(async () => {
    const initKey = `${agentId}-${folderId}`;
    try {
      initializedFor.current = initKey;

      const agentRelease = await agentService.current.agents.getById(
        folderId,
        agentId,
      );
      const chatServiceInstance = AutopilotChatService.Instantiate({
        config: {
          mode: AutopilotChatMode.Embedded,
          firstRunExperience: {
            title:
              agentRelease.appearance?.welcomeTitle ||
              `Welcome to ${agentRelease.name}!`,
            description: agentRelease.appearance?.welcomeDescription || "",
            suggestions: (agentRelease.appearance?.startingPrompts || []).map(
              (prompt) => ({
                label: prompt.displayPrompt,
                prompt: prompt.actualPrompt,
              }),
            ),
          },
          overrideLabels: {
            title: agentRelease.name,
            footerDisclaimer:
              "Agent can make mistakes. Please double check the responses.",
          },
          disabledFeatures: {
            fullScreen: true,
            preview: true,
            close: true,
          },
        },
      });
      setChatService(chatServiceInstance);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to initialize chat";
      setError(message);
      initializedFor.current = null;
    }
  }, [agentId, folderId]);

  const handleReload = useCallback(() => {
    initializedFor.current = null;
    setError(null);
    setChatService(undefined);
    initChat();
  }, [initChat]);

  // Initialize chat service on mount and when agentId/folderId changes
  useEffect(() => {
    const initKey = `${agentId}-${folderId}`;
    if (initializedFor.current !== initKey) {
      initChat();
    }
  }, [agentId, folderId, initChat]);

  // Register event handlers after chatService is available
  useEffect(() => {
    if (!chatService) return;

    const registerEvents = async () => {
      try {
        pastConversations.current = (
          await agentService.current.conversations.getAll()
        ).items;
        chatService.setHistory(
          getConversationHistoryDisplayItems(pastConversations.current),
        );
        chatService.on(AutopilotChatEvent.NewChat, onNewChat);
        chatService.on(AutopilotChatEvent.Request, onSendMessage);
        chatService.on(AutopilotChatEvent.SetAttachments, onSetAttachments);
        chatService.on(
          AutopilotChatEvent.OpenConversation,
          onClickOpenConversation,
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
  }, [
    chatService,
    onClickOpenConversation,
    onNewChat,
    onSendMessage,
    onSetAttachments,
  ]);

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
        <ApChat chatServiceInstance={chatService} locale="en" theme="light" />
      )}
    </div>
  );
};
