# Conversational Agent Chat - Architecture

## Overview

The Conversational Agent Chat widget provides a real-time AI chat interface built on UiPath Apollo React components and the `@uipath/uipath-typescript` SDK.

## Component Structure

### Main Component

- **ConversationalAgentChat** (`ConversationalAgentChat.tsx`) - Top-level component that orchestrates chat initialization, message streaming, file attachments, conversation history, and feedback. Uses ref-based state for non-re-render tracking (session, exchange, attachments) and useState for UI state.

### Sub-Components

- **FeedbackDialog** (`components/FeedbackDialog.tsx`) - Dialog for submitting positive/negative feedback with optional comments on agent responses.

## Data Flow

```
User Input (Text/File)
    ↓
ConversationalAgentChat
    ├→ Lazy-initialize Session (cached per conversation)
    ├→ Start Exchange
    └→ setupExchangeHandlers()
        ├→ onMessageStart → onContentPartStart → onChunk (stream) → onContentPartEnd
        ├→ onToolCallStart → onToolCallEnd
        ├→ onErrorStart → Error UI + Telemetry
        └→ onExchangeEnd → Stop loading
```

## Streaming Architecture

1. **Session Lifecycle** - `getSessionHelper()` creates/reuses a `SessionStream` tied to the current conversation with `{ echo: false }`.
2. **Exchange Flow** - Each message triggers `startExchange()` with handlers attached via `setupExchangeHandlers()`.
3. **Chunk Streaming** - Text chunks are sent to the UI immediately with `stream: true`, final complete response with `stream: false, done: true`.
4. **Tool Calls** - Displayed using `MessageWidget.ApolloAgentsToolCall` with input parameters, status, and results.

## Conversation Management

- **Create** - Lazy-created on first message via `agentService.conversations.create(agentId, folderId)`.
- **History** - Loaded paginated (20 per page, descending by `lastActivityTime`) with cursor-based pagination.
- **Switch** - Past conversations loaded by fetching all exchanges and mapping to chat messages.
- **Delete** - Removed via API, clears current conversation if active.
- **New Chat** - Resets all references (conversation, session, exchange).

## File Attachments

1. Files deduplicated using composite key: `{name}-{size}-{type}`.
2. Uploaded in batches of 3 via `agentService.conversations.uploadAttachment()`.
3. Supports binary, base64, and text content formats.
4. Cached in `uploadedAttachments` Map, referenced in messages via external URI.

## Feedback System

1. User clicks thumbs up/down → stored in `pendingFeedback` ref.
2. `FeedbackDialog` opens for optional comment.
3. Submitted via `conversation.exchanges.createFeedback()` with `FeedbackRating.Positive` or `Negative`.

## Event System

All user actions flow through `AutopilotChatService` events:

| Event                | Handler                       |
| -------------------- | ----------------------------- |
| `NewChat`            | `onNewChat()`                 |
| `Request`            | `onSendMessage()`             |
| `SetAttachments`     | `onSetAttachments()`          |
| `OpenConversation`   | `onClickOpenConversation()`   |
| `DeleteConversation` | `onClickDeleteConversation()` |
| `HistoryLoadMore`    | `onHistoryLoadMore()`         |
| `Feedback`           | `onFeedback()`                |
| `StopResponse`       | `onStopResponse()`            |

## Utilities

- **utils.ts** - `createFileKey()`, `normalizeInput()`, `convertAttachmentToFile()`, `getConversationHistoryDisplayItems()`, `mapExchangesToChatMessages()`
- **utils/telemetryUtils.ts** - `trackTelemetry()` wraps SDK telemetry client with application metadata.

## Telemetry

| Event                  | Trigger                  |
| ---------------------- | ------------------------ |
| `CAC.SendMessage`      | Message sent or error    |
| `CAC.NewChat`          | New chat started         |
| `CAC.OpenConversation` | Past conversation opened |
| `CAC.FileAttached`     | Files uploaded           |
| `CAC.Feedback`         | Feedback submitted       |

## Key Dependencies

- `@uipath/apollo-react` - Chat UI components (`ApChat`, `AutopilotChatService`)
- `@uipath/apollo-wind` - Design system components (Alert, Button, Dialog)
- `@uipath/uipath-typescript` - SDK for conversational agent API
- React 19.2.0+

## Testing

Tests in `src/__tests__/` using Vitest with Testing Library:

- **ConversationalAgentChat.test.tsx** - Component integration tests covering streaming, attachments, history, feedback, error handling.
- **utils.test.ts** - Unit tests for all utility functions.
