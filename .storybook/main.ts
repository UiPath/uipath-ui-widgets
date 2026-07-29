import type { StorybookConfig } from "@storybook/react-vite";
import tailwindcssPlugin from "@tailwindcss/postcss";
import autoprefixer from "autoprefixer";
import { dirname } from "path";
import { fileURLToPath } from "url";

/**
 * This function is used to resolve the absolute path of a package.
 * It is needed in projects that use Yarn PnP or are set up within a monorepo.
 */
function getAbsolutePath(value: string) {
  return dirname(fileURLToPath(import.meta.resolve(`${value}/package.json`)));
}

const config: StorybookConfig = {
  stories: [
    "../packages/multi-file-upload/src/*.stories.tsx",
    "../packages/conversational-agent-chat/src/*.stories.tsx",
    "../packages/datatable/src/*.stories.tsx",
    "../packages/validation-station/src/*.stories.tsx",
    "../packages/external-auth/src/*.stories.tsx",
  ],
  addons: [getAbsolutePath("@storybook/addon-docs")],
  framework: getAbsolutePath("@storybook/react-vite"),
  // Serves `public/du-vs-wc` (the staged Validation Station web component) at
  // the same `/du-vs-wc` path the samples app uses.
  staticDirs: ["../public"],
  viteFinal(config) {
    config.css = {
      ...config.css,
      postcss: {
        plugins: [tailwindcssPlugin, autoprefixer],
      },
    };
    return config;
  },
};
export default config;
