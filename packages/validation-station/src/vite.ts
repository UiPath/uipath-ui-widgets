// ─────────────────────────────────────────────────────────────────────────────
// Official Vite plugin for self-hosting the DU Validation Station web component.
//
// The widget loads the WC at a runtime-computed URL (see loadValidationStationWc)
// and never bundles it, so that bundle's files must be served by your app under a
// known path. This plugin does that with zero hand-written config:
//   • DEV   — serves the WC files from node_modules under `basePath`.
//   • BUILD — copies the WC bundle into `<outDir>/<basePath>` (via the shared,
//             bundler-neutral copyValidationStationWcAssets).
//
// This is Vite-specific sugar over the bundler-neutral core in `./wcAssets`. On
// any other bundler, run `uipath-vs-wc copy-assets` (or call
// copyValidationStationWcAssets) into a served static folder instead. See the
// README "Hello world" for consumer usage.
// ─────────────────────────────────────────────────────────────────────────────

import { readFile } from "node:fs/promises";
import { extname, isAbsolute, relative, resolve, sep } from "node:path";
import type { Plugin } from "vite";
import { DU_VS_WC_BASE } from "./constants.js";
import { copyValidationStationWcAssets, wcPackageRoot } from "./wcAssets.js";

const MIME: Record<string, string> = {
  ".js": "text/javascript",
  ".mjs": "text/javascript",
  ".css": "text/css",
  ".json": "application/json",
  ".woff2": "font/woff2",
  ".woff": "font/woff",
  ".wasm": "application/wasm",
  ".map": "application/json",
};

export interface ValidationStationAssetsOptions {
  /**
   * URL path the WC bundle is served under. MUST match the `baseUrl` passed to
   * `configureValidationStationWc()`. Defaults to {@link DU_VS_WC_BASE}.
   */
  basePath?: string;
}

export function validationStationAssets(
  options: ValidationStationAssetsOptions = {},
): Plugin {
  const raw = options.basePath ?? DU_VS_WC_BASE;
  const basePath = raw.endsWith("/") ? raw : `${raw}/`;
  let outDir = "";

  return {
    name: "uipath-validation-station-assets",

    configResolved(config) {
      outDir = resolve(config.root, config.build.outDir);
    },

    // DEV: serve WC files from node_modules. Registered in the configureServer
    // body (not a returned handler) so it runs before Vite's own middleware and
    // short-circuits these requests with the real files + correct MIME types.
    configureServer(server) {
      const root = wcPackageRoot();
      server.middlewares.use((req, res, next) => {
        const url = (req.url ?? "").split("?")[0];
        if (!url.startsWith(basePath)) return next();
        // Decode first (canonicalize %2e%2e etc.) then resolve, so encoded
        // traversal is normalized before the containment check sees it.
        const requestPath = decodeURIComponent(url.slice(basePath.length));
        const file = resolve(root, requestPath);
        // Containment check: the resolved file must stay strictly inside the WC
        // root. Uses path.relative rather than a `${root}/` prefix test, which is
        // POSIX-only — on Windows resolve() yields backslashes and the prefix
        // never matches, 404-ing every legitimate file. A `..` segment (or an
        // absolute rel, i.e. a different Windows drive) means the path escaped.
        const rel = relative(root, file);
        if (
          rel === "" ||
          rel === ".." ||
          rel.startsWith(`..${sep}`) ||
          isAbsolute(rel)
        ) {
          return next();
        }
        readFile(file).then(
          (buf) => {
            res.setHeader(
              "Content-Type",
              MIME[extname(file)] ?? "application/octet-stream",
            );
            res.end(buf);
          },
          // Missing file / directory read → fall through to Vite's 404.
          () => next(),
        );
      });
    },

    // BUILD: copy the WC bundle into <outDir>/<basePath> via the shared core.
    async closeBundle() {
      await copyValidationStationWcAssets(
        resolve(outDir, basePath.replace(/^\/+|\/+$/g, "")),
      );
    },
  };
}
