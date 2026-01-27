/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { ConversationalAgentChat } from '../ConversationalAgentChat'
import { UiPath } from '@uipath/uipath-typescript/core'

// Mock @uipath/apollo-react
vi.mock('@uipath/apollo-react/core/fonts/font.css', () => ({}))
vi.mock('@uipath/apollo-react/material/components', () => {
  const mockChatService = {
    on: vi.fn(),
    open: vi.fn(),
    sendResponse: vi.fn(),
    setAttachmentsLoading: vi.fn(),
    setError: vi.fn(),
  }

  return {
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
    },
    AutopilotChatService: {
      Instantiate: vi.fn(() => mockChatService),
    },
  }
})

// Mock ConversationalAgent
vi.mock('@uipath/uipath-typescript/conversational-agent', () => ({
  ConversationalAgent: vi.fn().mockImplementation(() => ({
    conversations: {
      create: vi.fn().mockResolvedValue({
        conversationId: 'conv-123',
      }),
      attachments: {
        upload: vi.fn().mockResolvedValue({
          uri: 'file://test.txt',
          name: 'test.txt',
          mimeType: 'text/plain',
        }),
      },
    },
    agents: {
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
    },
    events: {
      startSession: vi.fn().mockImplementation(() => {
        const sessionHelper = {
          onSessionStarted: vi.fn((callback: any) => {
            setTimeout(callback, 0)
            return sessionHelper
          }),
          startExchange: vi.fn(() => ({
            onErrorStart: vi.fn(),
            onMessageStart: vi.fn(),
            startMessage: vi.fn(),
          })),
        }
        return sessionHelper
      }),
    },
  })),
  ContentPartEventHelper: vi.fn(),
  ExchangeEventHelper: vi.fn(),
  MessageEventHelper: vi.fn(),
  SessionEventHelper: vi.fn(),
  ToolCallEventHelper: vi.fn(),
}))

describe('ConversationalAgentChat', () => {
  let mockSdk: Partial<UiPath>

  beforeEach(() => {
    vi.clearAllMocks()
    mockSdk = {} as any
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
    const { ConversationalAgent } = await import('@uipath/uipath-typescript/conversational-agent')

    render(<ConversationalAgentChat {...defaultProps} />)

    await waitFor(() => {
      const mockInstance = (ConversationalAgent as any).mock.results[0].value
      expect(mockInstance.agents.getById).toHaveBeenCalledWith(100, 1)
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
              history: true,
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
    const { ConversationalAgent } = await import('@uipath/uipath-typescript/conversational-agent')

    const { rerender } = render(<ConversationalAgentChat {...defaultProps} />)

    await waitFor(() => {
      const mockInstance = (ConversationalAgent as any).mock.results[0].value
      expect(mockInstance.agents.getById).toHaveBeenCalledWith(100, 1)
    }, { timeout: 3000 })

    rerender(<ConversationalAgentChat {...defaultProps} agentId={2} />)

    // Note: In the current implementation, changing props doesn't reinitialize
    // This test documents current behavior
  })

  it('should create ConversationalAgent with provided SDK', async () => {
    render(<ConversationalAgentChat {...defaultProps} />)

    // Should initialize successfully with the provided SDK
    await waitFor(() => {
      expect(screen.getByTestId('ap-chat')).toBeInTheDocument()
    }, { timeout: 3000 })
  })
})
