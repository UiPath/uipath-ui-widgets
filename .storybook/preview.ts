import type { Preview } from "@storybook/react-vite";
import { configureValidationStationWc } from "@uipath/ui-widgets-validation-station";

// Mirrors samples/main.tsx — served from `public/du-vs-wc`, exposed to Storybook
// via `staticDirs` in main.ts and staged by the `prestorybook` script.
configureValidationStationWc({
  deploymentUrl: "/du-vs-wc",
  includeFonts: true,
}).catch((error: unknown) => {
  console.error("Failed to load the Validation Station web component:", error);
});

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
