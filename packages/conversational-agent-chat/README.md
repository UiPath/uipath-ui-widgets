# Conversational Agent Chat Widget

A React component that provides a conversational AI chat interface powered by UiPath Conversational Agents. Built on top of UiPath Apollo React components, this widget enables seamless integration of AI-powered chat functionality into your applications.

## Features

- Real-time streaming responses from conversational agents
- File attachment support with drag and drop
- Tool call visualization and tracking
- Conversation history management
- Start new conversations or continue existing ones
- Built on Apollo React chat components
- Built with TypeScript for type safety

## Installation

```bash
npm install @uipath/ui-widgets-conversational-agent-chat
```

## Peer Dependencies

This package requires the following peer dependencies:

```bash
npm install react@^19.2.0 react-dom@^19.2.0 @uipath/uipath-typescript@^1.2.0
```

## Usage

> **Note:** Add either `light` or `dark` class to your HTML `<body>` element to enable proper theming.

```tsx
import { ConversationalAgentChat } from "@uipath/ui-widgets-conversational-agent-chat";
import "@uipath/ui-widgets-conversational-agent-chat/ConversationalAgentChat.css";
import { UiPath } from "@uipath/uipath-typescript/core";
import { useEffect, useState } from "react";

function App() {
  const [sdk, setSdk] = useState<UiPath | null>(null);

  useEffect(() => {
    const init = async () => {
      const uipath = new UiPath({
        baseUrl: "https://cloud.uipath.com",
        orgName: "your-org",
        tenantName: "your-tenant",
        secret: "your-secret",
      });
      await uipath.initialize();
      setSdk(uipath);
    };
    init();
  }, []);

  if (!sdk) return <div>Loading...</div>;

  return <ConversationalAgentChat sdk={sdk} agentId={123} folderId={456} />;
}
```

## API Reference

### Props

| Prop       | Type     | Required | Description                                      |
| ---------- | -------- | -------- | ------------------------------------------------ |
| `sdk`      | `UiPath` | Yes      | UiPath SDK instance for API communication        |
| `agentId`  | `number` | Yes      | The ID of the conversational agent release       |
| `folderId` | `number` | Yes      | The folder ID where conversations will be stored |

## Features in Detail

### Streaming Responses

The component supports real-time streaming of AI responses, providing a smooth conversational experience as the agent generates its reply.

### File Attachments

Users can attach files to their messages via drag and drop or file picker.

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
import "@uipath/ui-widgets-conversational-agent-chat/ConversationalAgentChat.css";
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
import type { ConversationalAgentChatProps } from "@uipath/ui-widgets-conversational-agent-chat";
```

## License

MIT
