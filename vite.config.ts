import react from "@vitejs/plugin-react";
import { cp, readFile } from "node:fs/promises";
import { createRequire } from "node:module";
import { dirname, resolve } from "node:path";
import { defineConfig, type Plugin } from "vite";

const require = createRequire(import.meta.url);

const WC_ROOT = dirname(
  require.resolve("@uipath/du-validation-station-wc/package.json"),
);

// Stylesheets the WC fetches (as raw CSS text) at runtime to adopt into its
// shadow root — resolved via `import.meta.url` next to its main bundle.
const WC_RUNTIME_CSS = ["styles.css", "fonts.css"];

// DEV: the WC does `fetch("styles.css").then(r => r.text())` and feeds the
// result to `CSSStyleSheet.replaceSync()` to populate its shadow root (this is
// how `.material-icons { font-family }` etc. get inside the shadow boundary).
// Vite's dev server, however, serves any `.css` request as a JS module wrapper,
// so the WC parses JS-as-CSS, adopts an empty sheet, and every `<mat-icon>`
// falls back to a system font (broken icons). Intercept the WC's raw `fetch()`
// (identified by `Sec-Fetch-Dest: empty`) and return the real CSS, while
// letting genuine ES-module imports (`Sec-Fetch-Dest: script`) fall through to
// Vite so light-DOM injection still works.
function serveDuValidationStationRawCss(): Plugin {
  const pattern = new RegExp(
    `/@uipath/du-validation-station-wc/(${WC_RUNTIME_CSS.join("|")})$`,
  );
  return {
    name: "serve-du-validation-station-raw-css",
    apply: "serve",
    configureServer(server) {
      // Registered in `configureServer` (not its returned fn) so it runs
      // before Vite's internal CSS-transform middleware.
      server.middlewares.use((req, res, next) => {
        if (req.headers["sec-fetch-dest"] !== "empty") return next();
        const match = pattern.exec((req.url ?? "").split("?")[0]);
        if (!match) return next();
        readFile(resolve(WC_ROOT, match[1]), "utf8").then((css) => {
          res.setHeader("Content-Type", "text/css");
          res.end(css);
        }, next);
      });
    },
  };
}

// The validation-station WC self-resolves several runtime files via
// `import.meta.url` (next to its main bundle): `du-assets/` (PDF.js worker,
// ICU data, translations) and its stylesheets (`styles.css` — adopted into the
// shadow root — plus `fonts.css` and the `media/` fonts it references). In a
// production build that resolved URL points next to the emitted JS chunks, so
// these must be copied there or the fetches 404 at runtime (silent: no build
// error — PDFs fail to render and shadow-root icons fall back to a system
// font). See @uipath/du-validation-station-wc README → "Static assets" / "Fonts".
function copyDuValidationStationAssets(): Plugin {
  let assetsDir = "";
  return {
    name: "copy-du-validation-station-assets",
    apply: "build",
    configResolved(config) {
      assetsDir = resolve(
        config.root,
        config.build.outDir,
        config.build.assetsDir,
      );
    },
    async closeBundle() {
      await cp(resolve(WC_ROOT, "du-assets"), resolve(assetsDir, "du-assets"), {
        recursive: true,
      });
      await cp(resolve(WC_ROOT, "media"), resolve(assetsDir, "media"), {
        recursive: true,
      });
      for (const css of WC_RUNTIME_CSS) {
        await cp(resolve(WC_ROOT, css), resolve(assetsDir, css));
      }
    },
  };
}

// https://vite.dev/config/
// This config is used for both rolldown-vite (dev/build) and standard vite (tests)
export default defineConfig({
  plugins: [
    react({
      babel: {
        plugins: [["babel-plugin-react-compiler"]],
      },
    }),
    copyDuValidationStationAssets(),
    serveDuValidationStationRawCss(),
  ],
  resolve: {
    dedupe: ["react", "react-dom"],
  },
  optimizeDeps: {
    exclude: ["@uipath/du-validation-station-wc"],
  },
  build: {
    sourcemap: true,
  },
});
