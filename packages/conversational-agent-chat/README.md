# Conversational Agent Chat Widget

A React component that provides a conversational AI chat interface powered by UiPath Conversational Agents. Built on top of UiPath Apollo React components, this widget enables seamless integration of AI-powered chat functionality into your applications.

## Features

- Real-time streaming responses from conversational agents
- Tool call visualization and tracking
- Support for side-by-side and embedded chat modes
- Customizable welcome experience with suggestions
- Automatic conversation and session management
- Multi-conversation support with "New Chat" functionality
- Built with TypeScript for type safety

## Installation

```bash
npm install @uipath/ui-widgets-conversational-agent-chat
```

## Peer Dependencies

This package requires the following peer dependencies:

```bash
npm install react@^19.2.0 react-dom@^19.2.0 @uipath/uipath-typescript
```

## Usage

### Basic Example

```tsx
import { ConversationalAgentChat } from '@uipath/ui-widgets-conversational-agent-chat';
import '@uipath/ui-widgets-conversational-agent-chat/ConversationalAgentChat.css';
import { UiPath } from '@uipath/uipath-typescript/core';

function App() {
  const sdk = new UiPath({
    // Your UiPath SDK configuration
  });

  return (
    <ConversationalAgentChat
      sdk={sdk}
      agentId={123}
      folderId={456}
    />
  );
}
```

### Customized Example

```tsx
import { ConversationalAgentChat } from '@uipath/ui-widgets-conversational-agent-chat';
import '@uipath/ui-widgets-conversational-agent-chat/ConversationalAgentChat.css';
import { AutopilotChatMode } from '@uipath/apollo-react/material/components';

function App() {
  const sdk = new UiPath({
    // Your UiPath SDK configuration
  });

  return (
    <ConversationalAgentChat
      sdk={sdk}
      agentId={123}
      folderId={456}
      mode={AutopilotChatMode.SideBySide}
      title="Custom Chat Title"
      description="Ask me anything about your business data."
    />
  );
}
```

## API Reference

### Props

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `sdk` | `UiPath` | Yes | - | UiPath SDK instance for API communication |
| `agentId` | `number` | Yes | - | The ID of the conversational agent release to use |
| `folderId` | `number` | Yes | - | The folder ID where conversations will be stored |
| `mode` | `AutopilotChatMode` | No | `AutopilotChatMode.SideBySide` | Chat display mode (SideBySide or Embedded) |
| `title` | `string` | No | `'Welcome to UiPath Autopilot Chat!'` | Title displayed in the first-run experience |
| `description` | `string` | No | `'Ask me anything about your data or how to use this application.'` | Description shown in the first-run experience |

### Chat Modes

The component supports different display modes via the `mode` prop:

- `AutopilotChatMode.SideBySide` - Displays the chat in a side panel
- `AutopilotChatMode.Embedded` - Embeds the chat inline within your layout

## Features in Detail

### Streaming Responses

The component supports real-time streaming of AI responses, providing a smooth conversational experience as the agent generates its reply.

### Tool Call Tracking

When the conversational agent uses tools, the component automatically displays:
- Tool name and input parameters
- Execution status
- Output results
- Error handling

### Session Management

The widget automatically handles:
- Conversation creation and persistence
- Session initialization and maintenance
- Multiple conversation support via "New Chat"

## Styling

The component comes with default styles. Import the CSS file in your application:

```tsx
import '@uipath/ui-widgets-conversational-agent-chat/ConversationalAgentChat.css';
```

The chat interface supports both light and dark themes through the UiPath Apollo design system.

## Development

### Install Dependencies

```bash
npm install
```

### Build the Package

```bash
npm run build
```

### Run Tests

```bash
# Run tests once
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with UI
npm run test:ui

# Run tests with coverage
npm run test:coverage
```

## TypeScript Support

This package is written in TypeScript and includes type definitions. Import types as needed:

```tsx
import type { ConversationalAgentChatProps } from '@uipath/ui-widgets-conversational-agent-chat';
```

## License

MIT
