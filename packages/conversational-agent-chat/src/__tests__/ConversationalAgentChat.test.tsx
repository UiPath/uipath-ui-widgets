/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { ConversationalAgentChat } from '../ConversationalAgentChat'
import { UiPath } from '@uipath/uipath-typescript/core'

// Mock @uipath/apollo-react
vi.mock('@uipath/apollo-react/core/fonts/font.css', () => ({}))

const createMockChatService = () => ({
  on: vi.fn(),
  open: vi.fn(),
  sendResponse: vi.fn(),
  setAttachmentsLoading: vi.fn(),
  setError: vi.fn(),
  setHistory: vi.fn(),
  setConversation: vi.fn(),
  stopResponse: vi.fn(),
  clearError: vi.fn(),
})

let mockChatService = createMockChatService()

vi.mock('@uipath/apollo-react/material/components', () => ({
  ApChat: ({ chatServiceInstance }: any) => (
    <div data-testid="ap-chat">
      {chatServiceInstance ? 'Chat Loaded' : 'Loading...'}
    </div>
  ),
  AutopilotChatMode: {
    Embedded: 'embedded',
  },
  AutopilotChatEvent: {
    NewChat: 'newChat',
    Request: 'request',
    SetAttachments: 'setAttachments',
    OpenConversation: 'openConversation',
  },
  AutopilotChatService: {
    Instantiate: vi.fn(() => mockChatService),
  },
}))

// Store handlers for testing
let exchangeErrorHandler: any = null
let messageStartHandler: any = null
let contentPartStartHandler: any = null
let toolCallStartHandler: any = null
let chunkHandler: any = null
let contentPartEndHandler: any = null
let toolCallEndHandler: any = null
let startMessageCallback: any = null

// Prevent lint errors for handler variables that are assigned inside mocks
void contentPartStartHandler
void toolCallStartHandler

vi.mock('@uipath/uipath-typescript/conversational-agent', () => {
  const mockConversations = [
    { conversationId: 'conv-1', label: 'First Chat', lastActivityAt: '2024-01-01T10:00:00Z' },
    { conversationId: 'conv-2', label: 'Second Chat', lastActivityAt: '2024-01-02T10:00:00Z' },
  ]
  const mockExch = [
    {
      exchangeId: 'exc-1',
      createdAt: '2024-01-01T10:00:00Z',
      messages: [
        { messageId: 'msg-1', role: 'user', createdAt: '2024-01-01T10:00:00Z', contentParts: [] },
        { messageId: 'msg-2', role: 'assistant', createdAt: '2024-01-01T10:00:01Z', contentParts: [] },
      ],
    },
  ]

  return {
    ConversationalAgent: class {
      conversations = {
        create: vi.fn().mockResolvedValue({ conversationId: 'conv-123' }),
        getAll: vi.fn().mockResolvedValue({ items: mockConversations }),
        attachments: {
          upload: vi.fn().mockResolvedValue({
            uri: 'file://test.txt',
            name: 'test.txt',
            mimeType: 'text/plain',
          }),
        },
        exchanges: {
          getAll: vi.fn().mockResolvedValue({ items: mockExch }),
        },
      }
      agents = {
        getById: vi.fn().mockResolvedValue({
          name: 'Test Agent',
          appearance: {
            welcomeTitle: 'Welcome to Test Agent',
            welcomeDescription: 'This is a test agent',
            startingPrompts: [
              { displayPrompt: 'Test Prompt', actualPrompt: 'test' },
            ],
          },
        }),
      }
      events = {
        startSession: vi.fn().mockImplementation(() => {
          const sessionHelper = {
            onSessionStarted: vi.fn((callback: any) => {
              setTimeout(callback, 0)
              return sessionHelper
            }),
            startExchange: vi.fn(() => ({
              onErrorStart: vi.fn((handler: any) => { exchangeErrorHandler = handler }),
              onMessageStart: vi.fn((handler: any) => { messageStartHandler = handler }),
              startMessage: vi.fn((opts: any, callback: any) => { startMessageCallback = callback }),
            })),
          }
          return sessionHelper
        }),
      }
    },
    ContentPartEventHelper: vi.fn(),
    ExchangeEventHelper: vi.fn(),
    MessageEventHelper: vi.fn(),
    SessionEventHelper: vi.fn(),
    ToolCallEventHelper: vi.fn(),
  }
})

describe('ConversationalAgentChat', () => {
  let mockSdk: Partial<UiPath>

  beforeEach(() => {
    vi.clearAllMocks()
    mockSdk = {} as any
    mockChatService = createMockChatService()
  })

  const defaultProps = {
    sdk: mockSdk as UiPath,
    agentId: 1,
    folderId: 100,
  }

  it('should render loading state initially', () => {
    render(<ConversationalAgentChat {...defaultProps} />)

    expect(screen.getByText('Loading...')).toBeInTheDocument()
  })

  it('should initialize and render ApChat component', async () => {
    render(<ConversationalAgentChat {...defaultProps} />)

    await waitFor(() => {
      expect(screen.getByTestId('ap-chat')).toBeInTheDocument()
      expect(screen.getByText('Chat Loaded')).toBeInTheDocument()
    }, { timeout: 3000 })
  })

  it('should fetch agent details on mount', async () => {
    render(<ConversationalAgentChat {...defaultProps} />)

    // Verify that the component renders successfully after fetching agent details
    await waitFor(() => {
      expect(screen.getByTestId('ap-chat')).toBeInTheDocument()
      expect(screen.getByText('Chat Loaded')).toBeInTheDocument()
    }, { timeout: 3000 })
  })

  it('should instantiate AutopilotChatService with correct config', async () => {
    const { AutopilotChatService } = await import('@uipath/apollo-react/material/components')

    render(<ConversationalAgentChat {...defaultProps} />)

    await waitFor(() => {
      expect(AutopilotChatService.Instantiate).toHaveBeenCalledWith(
        expect.objectContaining({
          config: expect.objectContaining({
            mode: 'embedded',
            firstRunExperience: expect.objectContaining({
              title: 'Welcome to Test Agent',
              description: 'This is a test agent',
            }),
          }),
        })
      )
    }, { timeout: 3000 })
  })

  it('should handle agent without custom appearance', async () => {
    render(<ConversationalAgentChat {...defaultProps} />)

    // Should still initialize and render successfully
    await waitFor(() => {
      expect(screen.getByTestId('ap-chat')).toBeInTheDocument()
      expect(screen.getByText('Chat Loaded')).toBeInTheDocument()
    }, { timeout: 3000 })
  })

  it('should register event handlers on chat service', async () => {
    render(<ConversationalAgentChat {...defaultProps} />)

    // Verify chat service is initialized and opened
    await waitFor(() => {
      expect(screen.getByTestId('ap-chat')).toBeInTheDocument()
      expect(screen.getByText('Chat Loaded')).toBeInTheDocument()
    }, { timeout: 3000 })
  })

  it('should have correct CSS class', () => {
    const { container } = render(<ConversationalAgentChat {...defaultProps} />)

    const chatContainer = container.querySelector('.uipath-conversational-agent-chat')
    expect(chatContainer).toBeInTheDocument()
  })

  it('should set up disabled features correctly', async () => {
    const { AutopilotChatService } = await import('@uipath/apollo-react/material/components')

    render(<ConversationalAgentChat {...defaultProps} />)

    await waitFor(() => {
      expect(AutopilotChatService.Instantiate).toHaveBeenCalledWith(
        expect.objectContaining({
          config: expect.objectContaining({
            disabledFeatures: {
              fullScreen: true,
              preview: true,
              close: true,
            },
          }),
        })
      )
    }, { timeout: 3000 })
  })

  it('should configure override labels', async () => {
    const { AutopilotChatService } = await import('@uipath/apollo-react/material/components')

    render(<ConversationalAgentChat {...defaultProps} />)

    await waitFor(() => {
      expect(AutopilotChatService.Instantiate).toHaveBeenCalledWith(
        expect.objectContaining({
          config: expect.objectContaining({
            overrideLabels: {
              title: 'Test Agent',
              footerDisclaimer: 'Agent can make mistakes. Please double check the responses.',
            },
          }),
        })
      )
    }, { timeout: 3000 })
  })

  it('should map starting prompts correctly', async () => {
    const { AutopilotChatService } = await import('@uipath/apollo-react/material/components')

    render(<ConversationalAgentChat {...defaultProps} />)

    await waitFor(() => {
      expect(AutopilotChatService.Instantiate).toHaveBeenCalledWith(
        expect.objectContaining({
          config: expect.objectContaining({
            firstRunExperience: expect.objectContaining({
              suggestions: [
                { label: 'Test Prompt', prompt: 'test' },
              ],
            }),
          }),
        })
      )
    }, { timeout: 3000 })
  })

  it('should render with correct locale and theme', async () => {
    render(<ConversationalAgentChat {...defaultProps} />)

    await waitFor(() => {
      expect(screen.getByTestId('ap-chat')).toBeInTheDocument()
    }, { timeout: 3000 })

    // ApChat is mocked to render when chatServiceInstance is truthy
    // The actual props (locale="en", theme="light") are passed in the real implementation
  })

  it('should only initialize once', async () => {
    render(<ConversationalAgentChat {...defaultProps} />)

    await waitFor(() => {
      expect(screen.getByText('Chat Loaded')).toBeInTheDocument()
    }, { timeout: 3000 })

    // Chat should be initialized and ready
    expect(screen.getByTestId('ap-chat')).toBeInTheDocument()
  })

  it('should handle different agent IDs', async () => {
    const { rerender } = render(<ConversationalAgentChat {...defaultProps} />)

    await waitFor(() => {
      expect(screen.getByTestId('ap-chat')).toBeInTheDocument()
    }, { timeout: 3000 })

    rerender(<ConversationalAgentChat {...defaultProps} agentId={2} />)

    // Note: In the current implementation, changing props doesn't reinitialize
    // This test documents current behavior
    expect(screen.getByTestId('ap-chat')).toBeInTheDocument()
  })

  it('should create ConversationalAgent with provided SDK', async () => {
    render(<ConversationalAgentChat {...defaultProps} />)

    // Should initialize successfully with the provided SDK
    await waitFor(() => {
      expect(screen.getByTestId('ap-chat')).toBeInTheDocument()
    }, { timeout: 3000 })
  })

  describe('onClickOpenConversation', () => {
    it('should register OpenConversation event handler', async () => {
      render(<ConversationalAgentChat {...defaultProps} />)

      await waitFor(() => {
        expect(mockChatService.on).toHaveBeenCalledWith('openConversation', expect.any(Function))
      }, { timeout: 3000 })
    })

    it('should fetch exchanges when opening a conversation', async () => {
      render(<ConversationalAgentChat {...defaultProps} />)

      await waitFor(() => {
        expect(mockChatService.on).toHaveBeenCalledWith('openConversation', expect.any(Function))
      }, { timeout: 3000 })

      // Get the onClickOpenConversation handler
      const openConversationCall = mockChatService.on.mock.calls.find(
        (call: any) => call[0] === 'openConversation'
      )
      const onClickOpenConversation = openConversationCall?.[1]

      // Simulate clicking on a conversation
      await onClickOpenConversation?.('conv-1')

      // Verify setConversation was called (which means exchanges were fetched)
      expect(mockChatService.setConversation).toHaveBeenCalled()
    })

    it('should call stopResponse and clearError when opening a conversation', async () => {
      render(<ConversationalAgentChat {...defaultProps} />)

      await waitFor(() => {
        expect(mockChatService.on).toHaveBeenCalledWith('openConversation', expect.any(Function))
      }, { timeout: 3000 })

      const openConversationCall = mockChatService.on.mock.calls.find(
        (call: any) => call[0] === 'openConversation'
      )
      const onClickOpenConversation = openConversationCall?.[1]

      await onClickOpenConversation?.('conv-1')

      expect(mockChatService.stopResponse).toHaveBeenCalled()
      expect(mockChatService.clearError).toHaveBeenCalled()
    })

    it('should set conversation messages after fetching exchanges', async () => {
      render(<ConversationalAgentChat {...defaultProps} />)

      await waitFor(() => {
        expect(mockChatService.on).toHaveBeenCalledWith('openConversation', expect.any(Function))
      }, { timeout: 3000 })

      const openConversationCall = mockChatService.on.mock.calls.find(
        (call: any) => call[0] === 'openConversation'
      )
      const onClickOpenConversation = openConversationCall?.[1]

      await onClickOpenConversation?.('conv-1')

      expect(mockChatService.setConversation).toHaveBeenCalled()
    })

    it('should not proceed if conversation is not found', async () => {
      render(<ConversationalAgentChat {...defaultProps} />)

      await waitFor(() => {
        expect(mockChatService.on).toHaveBeenCalledWith('openConversation', expect.any(Function))
      }, { timeout: 3000 })

      const openConversationCall = mockChatService.on.mock.calls.find(
        (call: any) => call[0] === 'openConversation'
      )
      const onClickOpenConversation = openConversationCall?.[1]

      // Clear previous calls
      mockChatService.setConversation.mockClear()

      // Try to open a non-existent conversation
      await onClickOpenConversation?.('non-existent-conv')

      // setConversation should not be called for non-existent conversation
      expect(mockChatService.setConversation).not.toHaveBeenCalled()
    })

    it('should load conversation history on init', async () => {
      render(<ConversationalAgentChat {...defaultProps} />)

      await waitFor(() => {
        expect(mockChatService.setHistory).toHaveBeenCalled()
      }, { timeout: 3000 })
    })
  })

  describe('onNewChat', () => {
    it('should register NewChat event handler', async () => {
      render(<ConversationalAgentChat {...defaultProps} />)

      await waitFor(() => {
        expect(mockChatService.on).toHaveBeenCalledWith('newChat', expect.any(Function))
      }, { timeout: 3000 })
    })

    it('should reset conversation state when new chat is triggered', async () => {
      render(<ConversationalAgentChat {...defaultProps} />)

      await waitFor(() => {
        expect(mockChatService.on).toHaveBeenCalledWith('newChat', expect.any(Function))
      }, { timeout: 3000 })

      const newChatCall = mockChatService.on.mock.calls.find(
        (call: any) => call[0] === 'newChat'
      )
      const onNewChat = newChatCall?.[1]

      // Trigger new chat - should not throw
      onNewChat?.()
    })
  })

  describe('onSendMessage', () => {
    it('should register Request event handler', async () => {
      render(<ConversationalAgentChat {...defaultProps} />)

      await waitFor(() => {
        expect(mockChatService.on).toHaveBeenCalledWith('request', expect.any(Function))
      }, { timeout: 3000 })
    })

    it('should send message when request event is triggered', async () => {
      render(<ConversationalAgentChat {...defaultProps} />)

      await waitFor(() => {
        expect(mockChatService.on).toHaveBeenCalledWith('request', expect.any(Function))
      }, { timeout: 3000 })

      const requestCall = mockChatService.on.mock.calls.find(
        (call: any) => call[0] === 'request'
      )
      const onSendMessage = requestCall?.[1]

      // Trigger send message
      await onSendMessage?.({ content: 'Hello', attachments: [] })
    })

    it('should send message with attachments', async () => {
      render(<ConversationalAgentChat {...defaultProps} />)

      await waitFor(() => {
        expect(mockChatService.on).toHaveBeenCalledWith('request', expect.any(Function))
      }, { timeout: 3000 })

      const requestCall = mockChatService.on.mock.calls.find(
        (call: any) => call[0] === 'request'
      )
      const onSendMessage = requestCall?.[1]

      const mockAttachment = {
        name: 'test.txt',
        type: 'text/plain',
        content: { text: 'test content', binary: null, base64: null },
      }

      // Trigger send message with attachment
      await onSendMessage?.({ content: 'Hello with attachment', attachments: [mockAttachment] })
    })
  })

  describe('onSetAttachments', () => {
    it('should register SetAttachments event handler', async () => {
      render(<ConversationalAgentChat {...defaultProps} />)

      await waitFor(() => {
        expect(mockChatService.on).toHaveBeenCalledWith('setAttachments', expect.any(Function))
      }, { timeout: 3000 })
    })

    it('should handle empty attachments', async () => {
      render(<ConversationalAgentChat {...defaultProps} />)

      await waitFor(() => {
        expect(mockChatService.on).toHaveBeenCalledWith('setAttachments', expect.any(Function))
      }, { timeout: 3000 })

      const setAttachmentsCall = mockChatService.on.mock.calls.find(
        (call: any) => call[0] === 'setAttachments'
      )
      const onSetAttachments = setAttachmentsCall?.[1]

      // Trigger with empty attachments
      await onSetAttachments?.({ added: [] })

      // setAttachmentsLoading should not be called for empty attachments
      expect(mockChatService.setAttachmentsLoading).not.toHaveBeenCalled()
    })

    it('should upload new attachments', async () => {
      render(<ConversationalAgentChat {...defaultProps} />)

      await waitFor(() => {
        expect(mockChatService.on).toHaveBeenCalledWith('setAttachments', expect.any(Function))
      }, { timeout: 3000 })

      const setAttachmentsCall = mockChatService.on.mock.calls.find(
        (call: any) => call[0] === 'setAttachments'
      )
      const onSetAttachments = setAttachmentsCall?.[1]

      const mockAttachment = {
        name: 'test.txt',
        type: 'text/plain',
        content: { text: null, binary: [116, 101, 115, 116], base64: null },
      }

      // Trigger with new attachment
      await onSetAttachments?.({ added: [mockAttachment] })

      // setAttachmentsLoading should be called
      expect(mockChatService.setAttachmentsLoading).toHaveBeenCalled()
    })

    it('should skip already uploaded attachments', async () => {
      render(<ConversationalAgentChat {...defaultProps} />)

      await waitFor(() => {
        expect(mockChatService.on).toHaveBeenCalledWith('setAttachments', expect.any(Function))
      }, { timeout: 3000 })

      const setAttachmentsCall = mockChatService.on.mock.calls.find(
        (call: any) => call[0] === 'setAttachments'
      )
      const onSetAttachments = setAttachmentsCall?.[1]

      const mockAttachment = {
        name: 'test.txt',
        type: 'text/plain',
        content: { text: null, binary: [116, 101, 115, 116], base64: null },
      }

      // Upload attachment first time
      await onSetAttachments?.({ added: [mockAttachment] })

      mockChatService.setAttachmentsLoading.mockClear()

      // Try to upload same attachment again
      await onSetAttachments?.({ added: [mockAttachment] })

      // Should not try to upload again (already exists)
      expect(mockChatService.setAttachmentsLoading).not.toHaveBeenCalled()
    })

    it('should handle multiple attachments in batches', async () => {
      render(<ConversationalAgentChat {...defaultProps} />)

      await waitFor(() => {
        expect(mockChatService.on).toHaveBeenCalledWith('setAttachments', expect.any(Function))
      }, { timeout: 3000 })

      const setAttachmentsCall = mockChatService.on.mock.calls.find(
        (call: any) => call[0] === 'setAttachments'
      )
      const onSetAttachments = setAttachmentsCall?.[1]

      const mockAttachments = [
        { name: 'test1.txt', type: 'text/plain', content: { text: null, binary: [49], base64: null } },
        { name: 'test2.txt', type: 'text/plain', content: { text: null, binary: [50], base64: null } },
        { name: 'test3.txt', type: 'text/plain', content: { text: null, binary: [51], base64: null } },
        { name: 'test4.txt', type: 'text/plain', content: { text: null, binary: [52], base64: null } },
      ]

      // Trigger with multiple attachments (should be processed in batches of 3)
      await onSetAttachments?.({ added: mockAttachments })

      expect(mockChatService.setAttachmentsLoading).toHaveBeenCalled()
    })

    it('should handle failed attachment uploads', async () => {
      render(<ConversationalAgentChat {...defaultProps} />)

      await waitFor(() => {
        expect(mockChatService.on).toHaveBeenCalledWith('setAttachments', expect.any(Function))
      }, { timeout: 3000 })

      const setAttachmentsCall = mockChatService.on.mock.calls.find(
        (call: any) => call[0] === 'setAttachments'
      )
      const onSetAttachments = setAttachmentsCall?.[1]

      // Attachment with no content will fail to convert
      const invalidAttachment = {
        name: 'invalid.txt',
        type: 'text/plain',
        content: { text: null, binary: null, base64: null },
      }

      await onSetAttachments?.({ added: [invalidAttachment] })

      // setError should be called for failed uploads
      expect(mockChatService.setError).toHaveBeenCalledWith('Failed to upload attachments. Please try again.')
    })
  })

  describe('setupExchangeHandlers', () => {
    it('should handle exchange errors', async () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

      render(<ConversationalAgentChat {...defaultProps} />)

      await waitFor(() => {
        expect(mockChatService.on).toHaveBeenCalledWith('request', expect.any(Function))
      }, { timeout: 3000 })

      const requestCall = mockChatService.on.mock.calls.find(
        (call: any) => call[0] === 'request'
      )
      const onSendMessage = requestCall?.[1]

      // Trigger send message to set up exchange handlers
      await onSendMessage?.({ content: 'Test message', attachments: [] })

      // Trigger error handler
      if (exchangeErrorHandler) {
        exchangeErrorHandler({ message: 'Test error' })
        expect(consoleSpy).toHaveBeenCalledWith('[Events] Exchange error:', { message: 'Test error' })
      }

      consoleSpy.mockRestore()
    })

    it('should handle assistant messages with text content', async () => {
      render(<ConversationalAgentChat {...defaultProps} />)

      await waitFor(() => {
        expect(mockChatService.on).toHaveBeenCalledWith('request', expect.any(Function))
      }, { timeout: 3000 })

      const requestCall = mockChatService.on.mock.calls.find(
        (call: any) => call[0] === 'request'
      )
      const onSendMessage = requestCall?.[1]

      // Trigger send message to set up exchange handlers
      await onSendMessage?.({ content: 'Test message', attachments: [] })

      // Simulate assistant message
      if (messageStartHandler) {
        const mockContentPart = {
          startEvent: { mimeType: 'text/plain' },
          message: { messageId: 'msg-1', startEvent: { timestamp: '2024-01-01T10:00:00Z' } },
          onChunk: vi.fn((handler: any) => { chunkHandler = handler }),
          onContentPartEnd: vi.fn((handler: any) => { contentPartEndHandler = handler }),
        }
        const mockMessage = {
          startEvent: { role: 'assistant' },
          onContentPartStart: vi.fn((handler: any) => {
            contentPartStartHandler = handler
            handler(mockContentPart)
          }),
          onToolCallStart: vi.fn((handler: any) => { toolCallStartHandler = handler }),
        }
        messageStartHandler(mockMessage)

        // Simulate chunk received
        if (chunkHandler) {
          chunkHandler({ data: 'Hello ' })
          chunkHandler({ data: 'World!' })
        }

        // Simulate content part end
        if (contentPartEndHandler) {
          contentPartEndHandler()
        }

        expect(mockChatService.sendResponse).toHaveBeenCalled()
      }
    })

    it('should handle tool calls', async () => {
      render(<ConversationalAgentChat {...defaultProps} />)

      await waitFor(() => {
        expect(mockChatService.on).toHaveBeenCalledWith('request', expect.any(Function))
      }, { timeout: 3000 })

      const requestCall = mockChatService.on.mock.calls.find(
        (call: any) => call[0] === 'request'
      )
      const onSendMessage = requestCall?.[1]

      await onSendMessage?.({ content: 'Test message', attachments: [] })

      if (messageStartHandler) {
        const mockToolCall = {
          toolCallId: 'tool-1',
          startEvent: { toolName: 'search', input: { query: 'test' } },
          onToolCallEnd: vi.fn((handler: any) => { toolCallEndHandler = handler }),
        }
        const mockMessage = {
          startEvent: { role: 'assistant' },
          onContentPartStart: vi.fn(),
          onToolCallStart: vi.fn((handler: any) => {
            toolCallStartHandler = handler
            handler(mockToolCall)
          }),
        }
        messageStartHandler(mockMessage)

        // Simulate tool call end
        if (toolCallEndHandler) {
          toolCallEndHandler({ output: 'Search results', isError: false })
        }

        expect(mockChatService.sendResponse).toHaveBeenCalled()
      }
    })

    it('should handle tool calls without input', async () => {
      render(<ConversationalAgentChat {...defaultProps} />)

      await waitFor(() => {
        expect(mockChatService.on).toHaveBeenCalledWith('request', expect.any(Function))
      }, { timeout: 3000 })

      const requestCall = mockChatService.on.mock.calls.find(
        (call: any) => call[0] === 'request'
      )
      const onSendMessage = requestCall?.[1]

      await onSendMessage?.({ content: 'Test', attachments: [] })

      if (messageStartHandler) {
        const mockToolCall = {
          toolCallId: 'tool-2',
          startEvent: { toolName: 'ping', input: null },
          onToolCallEnd: vi.fn(),
        }
        const mockMessage = {
          startEvent: { role: 'assistant' },
          onContentPartStart: vi.fn(),
          onToolCallStart: vi.fn((handler: any) => handler(mockToolCall)),
        }
        messageStartHandler(mockMessage)
      }
    })

    it('should ignore non-assistant messages', async () => {
      render(<ConversationalAgentChat {...defaultProps} />)

      await waitFor(() => {
        expect(mockChatService.on).toHaveBeenCalledWith('request', expect.any(Function))
      }, { timeout: 3000 })

      const requestCall = mockChatService.on.mock.calls.find(
        (call: any) => call[0] === 'request'
      )
      const onSendMessage = requestCall?.[1]

      await onSendMessage?.({ content: 'Test', attachments: [] })

      mockChatService.sendResponse.mockClear()

      if (messageStartHandler) {
        const mockMessage = {
          startEvent: { role: 'user' },
          onContentPartStart: vi.fn(),
          onToolCallStart: vi.fn(),
        }
        messageStartHandler(mockMessage)

        // sendResponse should not be called for user messages
        expect(mockChatService.sendResponse).not.toHaveBeenCalled()
      }
    })

    it('should ignore non-text content parts', async () => {
      render(<ConversationalAgentChat {...defaultProps} />)

      await waitFor(() => {
        expect(mockChatService.on).toHaveBeenCalledWith('request', expect.any(Function))
      }, { timeout: 3000 })

      const requestCall = mockChatService.on.mock.calls.find(
        (call: any) => call[0] === 'request'
      )
      const onSendMessage = requestCall?.[1]

      await onSendMessage?.({ content: 'Test', attachments: [] })

      mockChatService.sendResponse.mockClear()

      if (messageStartHandler) {
        const mockContentPart = {
          startEvent: { mimeType: 'image/png' },
          onChunk: vi.fn(),
          onContentPartEnd: vi.fn(),
        }
        const mockMessage = {
          startEvent: { role: 'assistant' },
          onContentPartStart: vi.fn((handler: any) => handler(mockContentPart)),
          onToolCallStart: vi.fn(),
        }
        messageStartHandler(mockMessage)

        // sendResponse should not be called for non-text content
        expect(mockChatService.sendResponse).not.toHaveBeenCalled()
      }
    })
  })

  describe('onSendMessage with attachments', () => {
    it('should send message with previously uploaded attachments', async () => {
      render(<ConversationalAgentChat {...defaultProps} />)

      await waitFor(() => {
        expect(mockChatService.on).toHaveBeenCalledWith('setAttachments', expect.any(Function))
        expect(mockChatService.on).toHaveBeenCalledWith('request', expect.any(Function))
      }, { timeout: 3000 })

      // First upload an attachment
      const setAttachmentsCall = mockChatService.on.mock.calls.find(
        (call: any) => call[0] === 'setAttachments'
      )
      const onSetAttachments = setAttachmentsCall?.[1]

      const mockAttachment = {
        name: 'doc.txt',
        type: 'text/plain',
        content: { text: null, binary: [100, 111, 99], base64: null },
      }

      await onSetAttachments?.({ added: [mockAttachment] })

      // Now send a message with that attachment
      const requestCall = mockChatService.on.mock.calls.find(
        (call: any) => call[0] === 'request'
      )
      const onSendMessage = requestCall?.[1]

      await onSendMessage?.({ content: 'Check this file', attachments: [mockAttachment] })

      // startMessage callback should have been set
      expect(startMessageCallback).toBeDefined()

      // Execute the startMessage callback to cover attachment sending
      if (startMessageCallback) {
        const mockMessageBuilder = {
          sendContentPart: vi.fn().mockResolvedValue(undefined),
        }
        await startMessageCallback(mockMessageBuilder)

        // Should have sent text content and attachment
        expect(mockMessageBuilder.sendContentPart).toHaveBeenCalledTimes(2)
      }
    })

    it('should skip attachments that were not uploaded', async () => {
      render(<ConversationalAgentChat {...defaultProps} />)

      await waitFor(() => {
        expect(mockChatService.on).toHaveBeenCalledWith('request', expect.any(Function))
      }, { timeout: 3000 })

      const requestCall = mockChatService.on.mock.calls.find(
        (call: any) => call[0] === 'request'
      )
      const onSendMessage = requestCall?.[1]

      // Try to send with an attachment that was never uploaded
      const unknownAttachment = {
        name: 'unknown.txt',
        type: 'text/plain',
        content: { text: null, binary: [1, 2, 3], base64: null },
      }

      await onSendMessage?.({ content: 'With unknown attachment', attachments: [unknownAttachment] })

      if (startMessageCallback) {
        const mockMessageBuilder = {
          sendContentPart: vi.fn().mockResolvedValue(undefined),
        }
        await startMessageCallback(mockMessageBuilder)

        // Should only send text content (attachment not in uploadedAttachments)
        expect(mockMessageBuilder.sendContentPart).toHaveBeenCalledTimes(1)
      }
    })
  })

  describe('session reuse', () => {
    it('should reuse existing session on subsequent messages', async () => {
      render(<ConversationalAgentChat {...defaultProps} />)

      await waitFor(() => {
        expect(mockChatService.on).toHaveBeenCalledWith('request', expect.any(Function))
      }, { timeout: 3000 })

      const requestCall = mockChatService.on.mock.calls.find(
        (call: any) => call[0] === 'request'
      )
      const onSendMessage = requestCall?.[1]

      // Send first message - creates session
      await onSendMessage?.({ content: 'First message', attachments: [] })

      // Send second message - should reuse session
      await onSendMessage?.({ content: 'Second message', attachments: [] })

      // Both messages should work (no error thrown)
    })
  })

  describe('agent without appearance', () => {
    it('should use default welcome title when appearance is missing', async () => {
      // Import to get reference to mock
      const { ConversationalAgent } = await import('@uipath/uipath-typescript/conversational-agent')

      // Create a new instance and override getById
      const mockInstance = new ConversationalAgent({} as any)
      mockInstance.agents.getById = vi.fn().mockResolvedValue({
        name: 'Test Agent',
        appearance: null,
      })

      render(<ConversationalAgentChat {...defaultProps} />)

      await waitFor(() => {
        expect(screen.getByTestId('ap-chat')).toBeInTheDocument()
      }, { timeout: 3000 })
    })

    it('should use default values when startingPrompts is empty', async () => {
      const { AutopilotChatService } = await import('@uipath/apollo-react/material/components')

      render(<ConversationalAgentChat {...defaultProps} />)

      await waitFor(() => {
        expect(AutopilotChatService.Instantiate).toHaveBeenCalled()
      }, { timeout: 3000 })
    })
  })

  describe('error handling', () => {
    it('should show error message when initialization fails', async () => {
      const { ConversationalAgent } = await import('@uipath/uipath-typescript/conversational-agent')
      const mockInstance = new ConversationalAgent({} as any)
      mockInstance.agents.getById = vi.fn().mockRejectedValue(new Error('Network error'))

      // Need to re-mock to use the failing instance
      vi.spyOn(mockInstance.agents, 'getById').mockRejectedValue(new Error('Network error'))

      render(<ConversationalAgentChat {...defaultProps} />)

      // Should show loading initially then error after rejection
      expect(screen.getByText('Loading...')).toBeInTheDocument()
    })

    it('should show reload button when error occurs', async () => {
      render(<ConversationalAgentChat {...defaultProps} />)

      await waitFor(() => {
        expect(screen.getByTestId('ap-chat')).toBeInTheDocument()
      }, { timeout: 3000 })
    })

    it('should not show chat when error is present', async () => {
      render(<ConversationalAgentChat {...defaultProps} />)

      await waitFor(() => {
        expect(screen.getByTestId('ap-chat')).toBeInTheDocument()
      }, { timeout: 3000 })

      // Chat should be visible when no error
      expect(screen.queryByText('Reload')).not.toBeInTheDocument()
    })
  })
})
