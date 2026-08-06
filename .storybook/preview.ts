import type { Preview } from "@storybook/react-vite";

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
  },
  decorators: [
    (Story) => {
      if (typeof document !== "undefined") {
        document.body.classList.add("light");
      }
      return Story();
    },
  ],
};

export default preview;
