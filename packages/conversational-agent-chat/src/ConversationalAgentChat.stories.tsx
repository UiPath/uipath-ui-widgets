import type { Meta, StoryObj } from '@storybook/react';
import { UiPath } from '@uipath/uipath-typescript/core';
import { ConversationalAgentChat } from './ConversationalAgentChat';
import './ConversationalAgentChat.css';

const mockSdk = new UiPath({
  baseUrl: 'https://mock.uipath.com',
  orgName: 'storybook-org',
  tenantName: 'storybook-tenant',
  secret: 'dummy-secret'
});

const meta = {
  title: 'Components/ConversationalAgentChat',
  component: ConversationalAgentChat,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: 'A conversational agent chat component that integrates with UiPath Conversational AI agents. This component provides a chat interface for interacting with AI agents, supporting file attachments, streaming responses, and tool calls.'
      }
    }
  },
  tags: ['autodocs'],
  argTypes: {
    sdk: {
      description: 'UiPath SDK instance',
      control: false,
      table: {
        type: { summary: 'UiPath' }
      }
    },
    agentId: {
      description: 'ID of the conversational agent to use',
      control: 'number',
      table: {
        type: { summary: 'number' }
      }
    },
    folderId: {
      description: 'ID of the folder containing the agent',
      control: 'number',
      table: {
        type: { summary: 'number' }
      }
    }
  }
} satisfies Meta<typeof ConversationalAgentChat>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    sdk: mockSdk,
    agentId: 1,
    folderId: 100
  },
  parameters: {
    docs: {
      description: {
        story: 'Default conversational agent chat with standard welcome message and starting prompts.'
      }
    }
  }
};
