import type { Meta, StoryObj } from "@storybook/react-vite";
import { UiPath } from "@uipath/uipath-typescript/core";
import { useEffect, useState } from "react";
import { ConversationalAgentChat } from "./ConversationalAgentChat";
import "./ConversationalAgentChat.scss";
import type { ConversationalAgentChatProps } from "./types";

interface ConversationalAgentChatStoryArgs extends Omit<
  ConversationalAgentChatProps,
  "sdk"
> {
  baseUrl: string;
  orgName: string;
  tenantName: string;
  secret: string;
}

const ConversationalAgentChatWithSdk = ({
  baseUrl,
  orgName,
  tenantName,
  secret,
  ...chatProps
}: ConversationalAgentChatStoryArgs) => {
  const [state, setState] = useState<{
    sdk: UiPath | null;
    error: string | null;
  }>({ sdk: null, error: null });

  useEffect(() => {
    if (!baseUrl || !orgName || !tenantName || !secret) {
      return;
    }

    let cancelled = false;
    const initSdk = async () => {
      try {
        const normalizedBaseUrl = baseUrl.match(/^https?:\/\//)
          ? baseUrl
          : `https://${baseUrl}`;
        const uipath = new UiPath({
          baseUrl: normalizedBaseUrl,
          orgName,
          tenantName,
          secret,
        });
        await uipath.initialize();
        if (!cancelled) {
          setState({ sdk: uipath, error: null });
        }
      } catch (err) {
        if (!cancelled) {
          setState({
            sdk: null,
            error:
              err instanceof Error ? err.message : "Failed to initialize SDK",
          });
        }
      }
    };

    initSdk();
    return () => {
      cancelled = true;
    };
  }, [baseUrl, orgName, tenantName, secret]);

  const { sdk, error } = state;

  if (!baseUrl || !orgName || !tenantName || !secret) {
    return (
      <div style={{ padding: 24, color: "#666" }}>
        Please provide baseUrl, orgName, tenantName, and secret in the controls
        panel below.
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: 24, color: "#d32f2f" }}>
        SDK initialization failed: {error}
      </div>
    );
  }

  if (!sdk) {
    return <div style={{ padding: 24 }}>Initializing SDK...</div>;
  }

  return <ConversationalAgentChat sdk={sdk} {...chatProps} />;
};

const meta = {
  title: "Components/ConversationalAgentChat",
  component: ConversationalAgentChatWithSdk,
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

> **Note:** Add either \`light\` or \`dark\` class to your HTML \`<body>\` element to enable proper theming.

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

  await sdk.initialize();

  return (
    <ConversationalAgentChat
      sdk={sdk}
      agentId={123}
      folderId={456}
      locale="en"
      theme="light"
      readOnly={false}
      overrideLabels={{
        title: "My Agent",
        footerDisclaimer: "Custom disclaimer",
        inputPlaceholder: "Ask me anything...",
      }}
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
    baseUrl: {
      description: "UiPath API base URL",
      control: "text",
      table: { category: "SDK Configuration" },
    },
    orgName: {
      description: "UiPath organization name",
      control: "text",
      table: { category: "SDK Configuration" },
    },
    tenantName: {
      description: "UiPath tenant name",
      control: "text",
      table: { category: "SDK Configuration" },
    },
    secret: {
      description: "UiPath API secret for authentication",
      control: "text",
      table: { category: "SDK Configuration" },
    },
    agentId: {
      description: "ID of the conversational agent to use",
      control: "number",
    },
    folderId: {
      description: "ID of the folder containing the agent",
      control: "number",
    },
    locale: {
      description: "Locale for the chat UI",
      control: "select",
      options: [
        "en",
        "es",
        "pt",
        "de",
        "fr",
        "ja",
        "ko",
        "ru",
        "tr",
        "zh-CN",
        "zh-TW",
        "pt-BR",
        "es-MX",
      ],
    },
    theme: {
      description: "Visual theme for the chat UI",
      control: "select",
      options: ["light", "dark", "light-hc", "dark-hc"],
    },
    readOnly: {
      description: "When true, disables user input",
      control: "boolean",
    },
    overrideLabels: {
      description:
        "Override default labels for title, footer disclaimer, and input placeholder",
      control: "object",
    },
  },
  args: {
    baseUrl: "cloud.uipath.com",
    orgName: "",
    tenantName: "",
    secret: "",
    agentId: 0,
    folderId: 0,
    locale: "en",
    theme: "light",
    readOnly: false,
    overrideLabels: undefined,
  },
} satisfies Meta<typeof ConversationalAgentChatWithSdk>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "Default conversational agent chat. Fill in the SDK configuration, agent ID, and folder ID in the controls panel to start chatting.",
      },
    },
  },
};

export const DarkTheme: Story = {
  args: {
    theme: "dark",
  },
  parameters: {
    docs: {
      description: {
        story: "Chat widget using the dark theme.",
      },
    },
  },
};

export const Japanese: Story = {
  args: {
    locale: "ja",
  },
  parameters: {
    docs: {
      description: {
        story: "Chat widget with Japanese locale.",
      },
    },
  },
};

export const ReadOnly: Story = {
  args: {
    readOnly: true,
  },
  parameters: {
    docs: {
      description: {
        story: "Chat widget in read-only mode with user input disabled.",
      },
    },
  },
};

export const CustomLabels: Story = {
  args: {
    overrideLabels: {
      title: "Support Assistant",
      footerDisclaimer: "Responses are AI-generated and may be inaccurate.",
      inputPlaceholder: "Describe your issue...",
    },
  },
  parameters: {
    docs: {
      description: {
        story:
          "Chat widget with custom title, footer disclaimer, and input placeholder.",
      },
    },
  },
};
