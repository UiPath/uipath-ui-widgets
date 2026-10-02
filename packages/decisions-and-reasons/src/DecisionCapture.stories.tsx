import type { Meta, StoryObj } from "@storybook/react-vite";
import "./DecisionsAndReasons.scss";
import { DecisionCapture } from "./DecisionCapture";
import { MockDecisionSource, FIXTURE_DECISION } from "./mock-data-source";
import { AutopilotDecisionAnalysis } from "./models";

const agentAnalysis: AutopilotDecisionAnalysis = {
  confidenceScore: 92,
  rationaleSuggestion:
    "Claim falls within the 12-month warranty window and matches a known defect batch.",
};

const meta = {
  title: "Components/DecisionCapture",
  component: DecisionCapture,
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component: `
A HITL decision-capture widget: the agent's recommended resolution, its evidence, amount, rationale, and resolution options, in one panel with a Decision tab and a live Signals tab.

## Installation

\`\`\`bash
npm install @uipath/ui-widgets-decisions-and-reasons
\`\`\`

## Usage

\`\`\`tsx
import { DecisionCapture } from '@uipath/ui-widgets-decisions-and-reasons';
import "@uipath/ui-widgets-decisions-and-reasons/DecisionsAndReasons.css";

<DecisionCapture
  taskId="task-123"
  capturedBy="human:jane@example.com"
  onSubmitted={(submission) => console.log(submission)}
/>
\`\`\`
`,
      },
    },
  },
  tags: ["autodocs"],
  argTypes: {
    taskId: { control: "text" },
    capturedBy: { control: "text" },
    maxReasons: { control: "number" },
    embedded: { control: "boolean" },
    showSignals: { control: "boolean" },
    source: { control: false },
    apAnalysis: { control: false },
  },
} satisfies Meta<typeof DecisionCapture>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    taskId: "task-fixture-1",
    capturedBy: "human:reviewer@example.com",
    source: new MockDecisionSource(),
  },
};

export const WithoutSignalsTab: Story = {
  args: {
    ...Default.args,
    showSignals: false,
  },
};

export const Embedded: Story = {
  args: {
    ...Default.args,
    embedded: true,
  },
  parameters: {
    docs: {
      description: {
        story: "Drops the card frame for a host that already draws one.",
      },
    },
  },
};

export const WithAgentAnalysis: Story = {
  args: {
    ...Default.args,
    apAnalysis: agentAnalysis,
  },
  parameters: {
    docs: {
      description: {
        story:
          "An agent's live analysis bumps the confidence score and prefills the rationale while it is empty.",
      },
    },
  },
};

export const NoAmount: Story = {
  args: {
    taskId: "task-no-amount",
    capturedBy: "human:reviewer@example.com",
    source: new MockDecisionSource({
      ...FIXTURE_DECISION,
      taskId: "task-no-amount",
      amount: { total: 0, refund: 0, paidByCustomer: 0, ceiling: 0 },
    }),
  },
  parameters: {
    docs: {
      description: {
        story: "The amount card only renders when the task has an amount.",
      },
    },
  },
};
