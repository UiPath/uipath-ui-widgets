import path from "path";
import type { UserConfig } from "vitest/config";

const runtime = path.resolve(__dirname, "react18/node_modules");
const testingLibrary = path.resolve(
  __dirname,
  "../node_modules/@testing-library/react/dist/@testing-library",
);

/**
 * With `REACT18=1`, runs a package's tests against React 18 instead of the
 * workspace's React 19: `react` and `react-dom` (and their subpaths) resolve to
 * `test/react18`, and Testing Library is loaded from its ESM build and inlined
 * so it imports the same copy.
 * Run `npm ci --prefix test/react18` first.
 */
export function react18Overrides(): Pick<UserConfig, "resolve" | "test"> {
  if (!process.env.REACT18) return {};
  return {
    resolve: {
      alias: [
        // The CommonJS build would `require` the workspace's React 19.
        {
          find: /^@testing-library\/react$/,
          replacement: `${testingLibrary}/react.esm.js`,
        },
        {
          find: /^@testing-library\/react\/pure$/,
          replacement: `${testingLibrary}/react.pure.esm.js`,
        },
        { find: /^react$/, replacement: `${runtime}/react` },
        { find: /^react\/(.*)$/, replacement: `${runtime}/react/$1` },
        { find: /^react-dom$/, replacement: `${runtime}/react-dom` },
        { find: /^react-dom\/(.*)$/, replacement: `${runtime}/react-dom/$1` },
      ],
    },
    test: {
      server: { deps: { inline: [/@testing-library\/react/] } },
    },
  };
}
