import type { Meta, StoryObj } from "@storybook/react-vite";
import "../DecisionsAndReasons.scss";
import { DraftEditing } from "../components/DraftEditing/DraftEditing";
import { FIXTURE_DRAFT } from "../fixtures/draftEditing";

const complete = async () => {};

const meta = {
  title: "Components/DraftEditing",
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "The reviewer accepts, edits or rewrites text the agent wrote. The draft sits in an editable area with the original kept, an indicator says whether it is kept, lightly edited or rewritten, reason chips say why it was edited, and the outcomes are Send, Revise and Reject.",
      },
    },
  },
  tags: ["autodocs"],
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const HelpChannelReply: Story = {
  render: () => <DraftEditing {...FIXTURE_DRAFT} onComplete={complete} />,
};

export const ReadOnly: Story = {
  render: () => (
    <DraftEditing
      {...FIXTURE_DRAFT}
      readOnly
      saved={{ outcome: "Send" }}
      onComplete={complete}
    />
  ),
};
