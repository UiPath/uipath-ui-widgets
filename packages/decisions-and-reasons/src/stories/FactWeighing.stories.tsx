import type { Meta, StoryObj } from "@storybook/react-vite";
import "../DecisionsAndReasons.scss";
import { FactWeighing } from "../components/FactWeighing/FactWeighing";
import { FIXTURE_FACTS } from "../fixtures/factWeighing";

const complete = async () => {};

const meta = {
  title: "Components/FactWeighing",
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "The reviewer weighs each fact on a five-point scale from fraud to legitimate, next to the agent's read, then decides and gives a reason.",
      },
    },
  },
  tags: ["autodocs"],
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const OrderFraudScreen: Story = {
  render: () => <FactWeighing {...FIXTURE_FACTS} onComplete={complete} />,
};
