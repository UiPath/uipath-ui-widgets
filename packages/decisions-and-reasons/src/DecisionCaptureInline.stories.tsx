import type { Meta, StoryObj } from "@storybook/react-vite";
import "./DecisionsAndReasons.scss";
import { DecisionCaptureInline } from "./DecisionCaptureInline";
import { MockDecisionSource } from "./mock-data-source";

const meta = {
  title: "Components/DecisionCaptureInline",
  component: DecisionCaptureInline,
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component: `
The compact-inline flavor: one line with the proposed outcome and confidence, plus a disclosure that opens the decision, reasons, rationale, lesson and action button in place. Meant to sit inside a host page, such as a task banner.

## Usage

\`\`\`tsx
import { DecisionCaptureInline } from '@uipath/ui-widgets-decisions-and-reasons';
import "@uipath/ui-widgets-decisions-and-reasons/DecisionsAndReasons.css";

<DecisionCaptureInline
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
    readOnly: { control: "boolean" },
    source: { control: false },
  },
} satisfies Meta<typeof DecisionCaptureInline>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    taskId: "task-fixture-1",
    source: new MockDecisionSource(),
    onComplete: (outcome, data) => console.log("completeTask", outcome, data),
  },
};

export const InATaskBanner: Story = {
  args: Default.args,
  decorators: [
    (Story) => (
      <div className="mx-auto max-w-xl rounded-lg border border-[var(--ap-wind-border)] p-4">
        <div className="mb-3 text-sm font-semibold">
          Triage a help-channel post — Task #101927624
        </div>
        <Story />
      </div>
    ),
  ],
  parameters: {
    docs: {
      description: {
        story: "Sitting inside a host task banner.",
      },
    },
  },
};
