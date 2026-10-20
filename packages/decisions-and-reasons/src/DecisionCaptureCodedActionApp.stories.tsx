import type { Meta, StoryObj } from "@storybook/react-vite";
import "./DecisionsAndReasons.scss";
import { DecisionCaptureCodedActionApp } from "./DecisionCaptureCodedActionApp";
import { FIXTURE_CLAIM } from "./claim-review-fixture";

const meta = {
  title: "Components/DecisionCaptureCodedActionApp",
  component: DecisionCaptureCodedActionApp,
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component: `
A prop-driven decision capture for a task where a process proposes a decision and reasons. One column: context, reasons with a weight menu, the decision (nothing pre-selected), final details that follow the decision, Next time with a scope, and What changed. The record of how the decision was reached goes to the payload; the \`showRecord\` prop shows it as a collapsed drawer for demos.

## Features

- Reasons with a four-step weight menu and an optional "why" when a reason is set to Not relevant
- Reviewer-added reasons, recorded as Added from the reviewer
- Decision with nothing pre-selected and final details that follow the chosen outcome
- Next time rules with a scope and conditions
- What changed summary and a payload that carries the record, the change log and the time on task
- Read-only mode for a saved decision
- Inline error when \`onComplete\` rejects, with the task left open

## Installation

\`\`\`bash
npm install @uipath/ui-widgets-decisions-and-reasons
\`\`\`

## Usage

> **Note:** Add either \`light\` or \`dark\` class to your HTML \`<body>\` element to enable proper theming.

\`\`\`tsx
import { DecisionCaptureCodedActionApp } from '@uipath/ui-widgets-decisions-and-reasons/preview';
import "@uipath/ui-widgets-decisions-and-reasons/DecisionsAndReasons.css";

<DecisionCaptureCodedActionApp
  data={taskData}
  onChange={(payload) => service.setTaskData(payload)}
  onComplete={(decision, payload) => service.completeTask(decision, payload)}
/>
\`\`\`

## Requirements

- React 19.2.0+
- React DOM 19.2.0+
`,
      },
    },
  },
  tags: ["autodocs"],
  args: {
    data: FIXTURE_CLAIM,
    onComplete: async () => {},
  },
  argTypes: {
    data: {
      description:
        "The task data: claim context, reasons, final details and Next time rules.",
      control: false,
    },
    onComplete: {
      description:
        "Called with the clicked outcome name and the payload. A rejection shows an inline error and leaves the task open.",
      control: false,
    },
    onChange: {
      description:
        "Called as the reviewer changes something, so the host can save the task data.",
      control: false,
    },
    readOnly: {
      description: "Renders the saved values and never completes.",
      control: "boolean",
    },
    showRecord: {
      description:
        "Shows the record as a collapsed drawer. Default false, for demos only.",
      control: "boolean",
    },
    reviewerId: {
      description: "Written into the record when the host provides one.",
      control: "text",
    },
  },
} satisfies Meta<typeof DecisionCaptureCodedActionApp>;

export default meta;
type Story = StoryObj<typeof meta>;

export const WarrantyClaim: Story = {};

export const WithRecord: Story = {
  args: { showRecord: true, reviewerId: "reviewer@example.com" },
  parameters: {
    docs: {
      description: {
        story:
          "Shows the record of how the decision was reached as a collapsed drawer. The same record is always returned in the payload.",
      },
    },
  },
};

export const ReadOnly: Story = {
  args: {
    readOnly: true,
    data: { ...FIXTURE_CLAIM, decision: "ApprovePartial" },
  },
};

export const ApprovedInFull: Story = {
  args: {
    readOnly: true,
    data: { ...FIXTURE_CLAIM, decision: "Approve" },
  },
  parameters: {
    docs: {
      description: { story: "A saved decision: Approve in full." },
    },
  },
};

export const ApprovedPartial: Story = {
  args: {
    readOnly: true,
    data: { ...FIXTURE_CLAIM, decision: "ApprovePartial" },
  },
  parameters: {
    docs: {
      description: { story: "A saved decision: Approve partial." },
    },
  },
};

export const Denied: Story = {
  args: {
    readOnly: true,
    data: { ...FIXTURE_CLAIM, decision: "Deny" },
  },
  parameters: {
    docs: {
      description: { story: "A saved decision: Deny." },
    },
  },
};
