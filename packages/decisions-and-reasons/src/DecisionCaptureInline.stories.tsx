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
The compact-inline flavor: one line with the recommended decision and confidence, plus a disclosure that expands the values, reasons, rationale, instruction and outcome buttons in place. No floating card — meant to sit inside a host page, such as a task banner.

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
    source: { control: false },
    apAnalysis: { control: false },
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
          Warranty claim review — Task #4821
        </div>
        <Story />
      </div>
    ),
  ],
  parameters: {
    docs: {
      description: {
        story:
          "Sitting inside a host task banner, with no floating card of its own.",
      },
    },
  },
};
