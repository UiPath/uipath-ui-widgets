/**
 * Copies the pdf.js worker into dist/ so the published package ships it.
 *
 * The widget references the worker as `new URL("./pdf.worker.min.mjs",
 * import.meta.url)` — a file that lives NEXT TO the compiled pdfWorker.js.
 * Shipping our own copy (from the exact-pinned pdfjs-dist this package
 * depends on) means:
 *  - consumer dev servers can fetch it directly from node_modules (no
 *    bundler rewriting needed — fixes the Vite-dev 404), and
 *  - the worker bytes are always the pinned version, never whatever
 *    pdfjs-dist the consumer's node_modules tree happens to hoist.
 */
import { copyFileSync, statSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const require = createRequire(import.meta.url);
const packageDir = join(dirname(fileURLToPath(import.meta.url)), "..");

const pinnedVersion = require(join(packageDir, "package.json")).dependencies[
  "pdfjs-dist"
];
const resolvedVersion = require("pdfjs-dist/package.json").version;
if (resolvedVersion !== pinnedVersion) {
  throw new Error(
    `copy-worker: resolved pdfjs-dist@${resolvedVersion} does not match the ` +
      `pinned ${pinnedVersion} — the copied worker would mismatch the API half.`,
  );
}

const workerSource = require.resolve("pdfjs-dist/build/pdf.worker.min.mjs");
const workerTarget = join(packageDir, "dist", "pdf.worker.min.mjs");
copyFileSync(workerSource, workerTarget);
console.log(
  `copy-worker: pdf.worker.min.mjs@${resolvedVersion} → dist/ ` +
    `(${statSync(workerTarget).size} bytes)`,
);
