import type { Meta, StoryObj } from "@storybook/react-vite";
import { userEvent, waitFor, within } from "storybook/test";
import "./DecisionsAndReasons.scss";
import { DecisionCapture } from "./DecisionCapture";
import { MockDecisionSource } from "./mock-data-source";

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
A HITL decision-capture widget for the decision part of a Coded Action App: the proposed outcome, the reasons with a weight each, a rationale, a lesson for next time, and a "What changed" rail with one action button. The completion callback reports the clicked outcome name, so the host calls completeTask(outcome, data).

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
    readOnly: { control: "boolean" },
    source: { control: false },
  },
} satisfies Meta<typeof DecisionCapture>;

export default meta;
type Story = StoryObj<typeof meta>;

const base = {
  taskId: "task-fixture-1",
  source: new MockDecisionSource(),
  onComplete: logCompletion,
};

export const Untouched: Story = {
  args: base,
  parameters: {
    docs: {
      description: {
        story:
          "Nothing picked. The proposed outcome is badged, never pre-selected, and one click on Agree completes with it.",
      },
    },
  },
};

const makeChanges = async (canvasElement: HTMLElement) => {
  const canvas = within(canvasElement);
  await userEvent.click(await canvas.findByRole("button", { name: /^Close/ }));
  await userEvent.click(
    canvas.getByRole("button", {
      name: /Weight of Packaging team owns the topic/,
    }),
  );
  await userEvent.click(
    await within(document.body).findByRole("menuitem", {
      name: "Not relevant",
    }),
  );
  await userEvent.click(await canvas.findByRole("radio", { name: "Wrong" }));
  await userEvent.click(
    canvas.getByRole("button", { name: "Link-only cross-post" }),
  );
  await userEvent.click(
    canvas.getByRole("button", { name: "No question to answer" }),
  );
  await userEvent.click(
    canvas.getByRole("button", { name: /^When a post in a help channel/ }),
  );
};

export const Changed: Story = {
  args: base,
  play: async ({ canvasElement }) => {
    await makeChanges(canvasElement);
  },
  parameters: {
    docs: {
      description: {
        story:
          "Route overridden to Close, one reason marked not relevant with a why, two rationale chips and a lesson. The rail lists each change and the button reads Record decision.",
      },
    },
  },
};

export const Filed: Story = {
  args: base,
  play: async ({ canvasElement }) => {
    await makeChanges(canvasElement);
    const canvas = within(canvasElement);
    await userEvent.click(
      await canvas.findByRole("button", { name: /^Record decision/ }),
    );
    await waitFor(() => canvas.getByText("Close recorded"));
  },
  parameters: {
    docs: {
      description: {
        story: "After completion the screen shows the filed state read-only.",
      },
    },
  },
};
