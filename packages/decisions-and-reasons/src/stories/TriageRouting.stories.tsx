import type { Meta, StoryObj } from "@storybook/react-vite";
import "../DecisionsAndReasons.scss";
import { TriageRouting } from "../components/TriageRouting/TriageRouting";
import { FIXTURE_TRIAGE } from "../fixtures/triageRouting";

const complete = async () => {};

const meta = {
  title: "Components/TriageRouting",
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "The reviewer confirms or changes the labels the agent picked: one row per label with option chips and the agent's reason, and Confirm or Send back.",
      },
    },
  },
  tags: ["autodocs"],
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const SupportTicket: Story = {
  render: () => <TriageRouting {...FIXTURE_TRIAGE} onComplete={complete} />,
};
