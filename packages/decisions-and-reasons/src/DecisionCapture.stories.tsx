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

const logCompletion = (outcome: string, data: unknown) =>
  console.log("completeTask", outcome, data);

const meta = {
  title: "Components/DecisionCapture",
  component: DecisionCapture,
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component: `
A HITL decision-capture widget: the agent's proposed values and reasons, a rationale, an instruction for next time, and one button per outcome. The completion callback reports the clicked outcome name, so the host calls completeTask(outcome, data).

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
  onComplete={(outcome, data) => completeTask(outcome, data)}
/>
\`\`\`
`,
      },
    },
  },
  tags: ["autodocs"],
  argTypes: {
    taskId: { control: "text" },
    embedded: { control: "boolean" },
    source: { control: false },
    apAnalysis: { control: false },
  },
} satisfies Meta<typeof DecisionCapture>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    taskId: "task-fixture-1",
    source: new MockDecisionSource(),
    onComplete: logCompletion,
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

export const NoUseCaseFields: Story = {
  args: {
    taskId: "task-no-fields",
    source: new MockDecisionSource({
      ...FIXTURE_DECISION,
      taskId: "task-no-fields",
      fields: [],
    }),
    onComplete: logCompletion,
  },
  parameters: {
    docs: {
      description: {
        story:
          "The use-case fields section only renders when the task has fields.",
      },
    },
  },
};
