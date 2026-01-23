import '@uipath/apollo-react/core/fonts/font.css';
import { ApChat, AutopilotChatEvent, AutopilotChatFileInfo, AutopilotChatMessage, AutopilotChatMode, AutopilotChatService } from '@uipath/apollo-react/material/components';
import { ContentPartChunkEvent, ContentPartEventHelper, ConversationalAgent, ConversationCreateResponse, ErrorStartHandlerArgs, ExchangeEventHelper, MessageEventHelper, SessionEventHelper, ToolCallEndEvent, ToolCallEventHelper } from '@uipath/uipath-typescript/conversational-agent';
import { useCallback, useEffect, useRef, useState } from 'react';
import './ConversationalAgentChat.css';
import { AttachFileOutput, ConversationalAgentChatProps, MessageWidget } from './types';
import { convertAttachmentToFile, createFileKey, normalizeInput } from './utils';

export const ConversationalAgentChat = ({
  sdk,
  agentId,
  folderId
}: ConversationalAgentChatProps) => {
  const agentService = useRef(new ConversationalAgent(sdk));
  const conversation = useRef<ConversationCreateResponse>(null);
  const isInitializing = useRef(false);
  const session = useRef<SessionEventHelper>(null);
  const uploadedAttachments = useRef(new Map<string, AttachFileOutput>());
  const [chatService, setChatService] = useState<AutopilotChatService>();

  const setupExchangeHandlers = useCallback((exchange: ExchangeEventHelper) => {
    if (!chatService) return;

    exchange.onErrorStart((error: ErrorStartHandlerArgs) => {
      console.error('[Events] Exchange error:', error);
    });

    exchange.onMessageStart((message: MessageEventHelper) => {
      if (message.startEvent.role === 'assistant') {
        message.onContentPartStart((contentPart: ContentPartEventHelper) => {
          if (contentPart.startEvent.mimeType.startsWith('text/')) {
            let fullResponse = '';

            contentPart.onChunk((chunk: ContentPartChunkEvent) => {
              fullResponse += chunk.data;
              chatService.sendResponse({
                id: contentPart.message.messageId,
                content: chunk.data,
                created_at: contentPart.message.startEvent.timestamp,
                widget: MessageWidget.AI,
                stream: true,
                done: false
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
          const toolInput = startEvent.input ? normalizeInput(startEvent.input) : {};
    
          chatService.sendResponse({
            id: toolCall.toolCallId,
            content: `Performing ${startEvent.toolName}`,
            created_at: startTimeIso,
            widget: MessageWidget.ApolloAgentsToolCall,
            meta: {
              toolName: startEvent.toolName,
              input: toolInput,
              startTime: startTimeIso
            }
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
                isError: endEvent.isError
              }
            });
          })
      });
      }
    });
  }, [chatService]);

  const getConversation = useCallback(async (): Promise<ConversationCreateResponse> => {
    if (conversation.current) {
      return conversation.current;
    }
    const newConversation = await agentService.current.conversations.create({
      agentReleaseId: agentId,
      folderId
    });
    conversation.current = newConversation;
    return newConversation;
  }, [agentId, folderId])

  const getSessionHelper = useCallback(async (): Promise<SessionEventHelper> => {
    if (session.current) {
      return session.current;
    }
    const conversation = await getConversation();
    const sessionHelper = agentService.current.events.startSession({
      conversationId: conversation.conversationId,
      echo: false
    })
    return new Promise((resolve) => {
      sessionHelper.onSessionStarted(() => {
        session.current = sessionHelper;
        resolve(sessionHelper);
      });
    });
  }, [getConversation])

  const onNewChat = useCallback(() => {
    conversation.current = null;
    session.current = null;
  }, []);

  const onSendMessage = useCallback(async (data: AutopilotChatMessage) => {
    const sessionHelper = await getSessionHelper();
    const exchange = sessionHelper.startExchange();
    setupExchangeHandlers(exchange);
    exchange.startMessage({}, async message => {
      await message.sendContentPart({
        mimeType: 'text/plain',
        data: data.content
      });
      for (const attachment of data.attachments || []) {
        const key = createFileKey(attachment);
        const attachmentOutput = uploadedAttachments.current.get(key);
        if (attachmentOutput) {
          await message.sendContentPart({
            name: attachmentOutput.name,
            mimeType: attachmentOutput.mimeType,
            externalValue: {
              uri: attachmentOutput.uri
            }
          });
        }
      }
    });
  }, [getSessionHelper, setupExchangeHandlers]);

  const processAttachmentsInBatch = useCallback(async (attachmentBatch: AutopilotChatFileInfo[]) => {
    if (!chatService) return;

    const batchPromises = attachmentBatch.map(async (attachment) => {
      try {
        const file = convertAttachmentToFile(attachment);
        const conversation = await getConversation();
        const attachmentOutput = await agentService.current.conversations.attachments.upload(conversation.conversationId, file);
        const key = createFileKey(attachment);
        uploadedAttachments.current.set(key, attachmentOutput);
        return { attachment, success: true, error: null };
      } catch (error) {
        // Clear loading state on error
        chatService.setAttachmentsLoading(
          [ { ...attachment, loading: false } ]
        );
        return { attachment, success: false, error };
      }
    });

    return await Promise.all(batchPromises);
  }, [chatService, getConversation]);

  const onSetAttachments = useCallback(async ({ added }: { added: AutopilotChatFileInfo[] }) => {
    if (!chatService) return;

    if (added.length > 0) {
      // Filter out already uploaded files
      const newAttachments = added.filter(attachment => {
        const key = createFileKey(attachment);
        return !uploadedAttachments.current.has(key);
      });

      if (newAttachments.length > 0) {
        chatService.setAttachmentsLoading(
          newAttachments.map(attachment => ({
            ...attachment,
            loading: true
          }))
        );

        const BATCH_SIZE = 3;
        const results = [];

        for (let i = 0; i < newAttachments.length; i += BATCH_SIZE) {
          const batch = newAttachments.slice(i, i + BATCH_SIZE);
          const batchResults = await processAttachmentsInBatch(batch);
          results.push(...batchResults || []);
          chatService.setAttachmentsLoading(
            batch.map(attachment => ({
              ...attachment,
              loading: false
            }))
          );
        }

        // Handle any failed uploads
        const failedUploads = results.filter(result => !result.success);
        if (failedUploads.length > 0) {
          chatService.setError('Failed to upload attachments. Please try again.');
          for (const failedUpload of failedUploads) {
            const key = createFileKey(failedUpload.attachment);
            uploadedAttachments.current.delete(key);
          }
        }
      }
    }
  }, [chatService, processAttachmentsInBatch]);

  useEffect(() => {
    const initChat = async () => {
      isInitializing.current = true;

      const agentRelease = await agentService.current.agents.getById(folderId, agentId);
      setChatService(AutopilotChatService.Instantiate({
        config: {
          mode: AutopilotChatMode.Embedded,
          firstRunExperience: {
            title: agentRelease.appearance?.welcomeTitle || `Welcome to ${agentRelease.name}!`,
            description: agentRelease.appearance?.welcomeDescription || '',
            suggestions: (agentRelease.appearance?.startingPrompts || []).map(prompt => ({
              label: prompt.displayPrompt,
              prompt: prompt.actualPrompt
            }))
          },
          overrideLabels: {
            title: agentRelease.name,
            footerDisclaimer: 'Agent can make mistakes. Please double check the responses.'
          },
          disabledFeatures: {
            fullScreen: true,
            history: true,
            preview: true,
            close: true
          }
        }
      }));

      if (chatService) {
        chatService.on(AutopilotChatEvent.NewChat, onNewChat);
        chatService.on(AutopilotChatEvent.Request, onSendMessage);
        chatService.on(AutopilotChatEvent.SetAttachments, onSetAttachments);
        chatService.open();
      }
    }

    if (!isInitializing.current) {
      initChat();
    }
  }, [agentId, folderId, chatService, getSessionHelper, onNewChat, onSendMessage, onSetAttachments, setupExchangeHandlers]);

  return (
    <div className='uipath-conversational-agent-chat'>
      {!chatService && <span>Loading...</span>}

      {chatService && <ApChat
        chatServiceInstance={chatService}
        locale="en"
        theme="light"
      />}
    </div>
  )
};
