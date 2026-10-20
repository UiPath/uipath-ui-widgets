import type { Meta, StoryObj } from "@storybook/react-vite";
import "./DecisionsAndReasons.scss";
import { ClaimReview } from "./ClaimReview";
import { FIXTURE_CLAIM } from "./claim-review-fixture";

const meta = {
  title: "Components/ClaimReview",
  component: ClaimReview,
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component: `
A prop-driven decision capture for a task where a process proposes a decision and reasons. One column: context, reasons with a weight menu, the decision (nothing pre-selected), final details that follow the decision, a rationale composed from the reasons, Next time with a scope, What changed, and a collapsed record of how the decision was reached.

## Usage

\`\`\`tsx
import { ClaimReview } from '@uipath/ui-widgets-decisions-and-reasons';
import "@uipath/ui-widgets-decisions-and-reasons/DecisionsAndReasons.css";

<ClaimReview
  data={taskData}
  onChange={(payload) => service.setTaskData(payload)}
  onComplete={(decision, payload) => service.completeTask(decision, payload)}
/>
\`\`\`
`,
      },
    },
  },
  args: {
    data: FIXTURE_CLAIM,
    onComplete: async () => {},
  },
} satisfies Meta<typeof ClaimReview>;

export default meta;
type Story = StoryObj<typeof meta>;

export const WarrantyClaim: Story = {};

export const ReadOnly: Story = {
  args: {
    readOnly: true,
    data: { ...FIXTURE_CLAIM, decision: "ApprovePartial" },
  },
};
