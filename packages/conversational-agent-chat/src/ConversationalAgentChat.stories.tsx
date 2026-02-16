import type { Meta, StoryObj } from "@storybook/react-vite";
import { UiPath } from "@uipath/uipath-typescript/core";
import { ConversationalAgentChat } from "./ConversationalAgentChat";
import "./ConversationalAgentChat.css";

const mockSdk = new UiPath({
  baseUrl: "https://mock.uipath.com",
  orgName: "storybook-org",
  tenantName: "storybook-tenant",
  secret: "dummy-secret",
});

const meta = {
  title: "Components/ConversationalAgentChat",
  component: ConversationalAgentChat,
  decorators: [
    (Story) => (
      <div style={{ height: "600px" }}>
        <Story />
      </div>
    ),
  ],
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component: `
A React chat widget for interacting with UiPath Conversational AI agents.

## Features

- Real-time streaming responses
- File attachment support with drag and drop
- Tool call visualization
- Conversation history management
- Start new conversations or continue existing ones
- Built on Apollo React chat components

## Installation

\`\`\`bash
npm install @uipath/ui-widgets-conversational-agent-chat
\`\`\`

## Usage

\`\`\`tsx
import { ConversationalAgentChat } from '@uipath/ui-widgets-conversational-agent-chat';
import "@uipath/ui-widgets-conversational-agent-chat/ConversationalAgentChat.css";
import { UiPath } from '@uipath/uipath-typescript/core';

function App() {
  const sdk = new UiPath({
    baseUrl: 'https://cloud.uipath.com',
    orgName: 'your-org',
    tenantName: 'your-tenant',
    secret: 'your-secret'
  });

  return (
    <ConversationalAgentChat
      sdk={sdk}
      agentId={123}
      folderId={456}
    />
  );
}
\`\`\`

## Requirements

- React 19.2.0+
- React DOM 19.2.0+
- @uipath/uipath-typescript
- @uipath/apollo-react
- @uipath/apollo-wind`,
      },
    },
  },
  tags: ["autodocs"],
  argTypes: {
    sdk: {
      description: "UiPath SDK instance",
      control: false,
      table: {
        type: { summary: "UiPath" },
      },
    },
    agentId: {
      description: "ID of the conversational agent to use",
      control: "number",
      table: {
        type: { summary: "number" },
      },
    },
    folderId: {
      description: "ID of the folder containing the agent",
      control: "number",
      table: {
        type: { summary: "number" },
      },
    },
  },
} satisfies Meta<typeof ConversationalAgentChat>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    sdk: mockSdk,
    agentId: 1,
    folderId: 100,
  },
  parameters: {
    docs: {
      description: {
        story:
          "Default conversational agent chat with standard welcome message and starting prompts.",
      },
    },
  },
};
