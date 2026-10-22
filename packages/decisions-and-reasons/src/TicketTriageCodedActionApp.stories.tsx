import type { Meta, StoryObj } from "@storybook/react-vite";
import "./DecisionsAndReasons.scss";
import { TicketTriageCodedActionApp } from "./TicketTriageCodedActionApp";
import { FIXTURE_TICKET } from "./use-case-fixtures";

const meta = {
  title: "Components/TicketTriageCodedActionApp",
  component: TicketTriageCodedActionApp,
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component: `
A prop-driven triage of a support ticket. The process proposes a category, a priority and a routing team, each with a reason. The reviewer confirms each one or picks another option in one click, and a changed value offers one-tap reasons. Confirm and Send back are the outcomes and nothing is pre-selected. Every classification records whether the model or the reviewer set it.

## Usage

\`\`\`tsx
import { TicketTriageCodedActionApp } from '@uipath/ui-widgets-decisions-and-reasons/preview';

<TicketTriageCodedActionApp
  data={taskData}
  onChange={(payload) => service.setTaskData(payload)}
  onComplete={(outcome, payload) => service.completeTask(outcome, payload)}
/>
\`\`\`
`,
      },
    },
  },
  tags: ["autodocs"],
  args: {
    data: FIXTURE_TICKET,
    onComplete: async () => {},
  },
  argTypes: {
    data: { control: false },
    onComplete: { control: false },
    onChange: { control: false },
    readOnly: { control: "boolean" },
    reviewerId: { control: "text" },
  },
} satisfies Meta<typeof TicketTriageCodedActionApp>;

export default meta;
type Story = StoryObj<typeof meta>;

export const SupportTicket: Story = {};

export const ReadOnly: Story = {
  args: {
    readOnly: true,
    saved: {
      outcome: "Confirm",
      values: { priority: "High" },
      whys: { priority: { why: "Deadline is close", note: "" } },
    },
  },
};
