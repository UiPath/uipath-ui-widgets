import { pdfjs } from "react-pdf";

// pdf.js parses documents on a Web Worker (a separate thread) so heavy
// parsing never freezes the host app's UI. The worker is a separate file the
// browser fetches at runtime, so pdf.js must be told where it lives.
//
// We deliberately do NOT use a CDN (the common tutorial shortcut): coded apps
// run on *.uipath.host behind enterprise CSP/firewalls where a cross-origin
// worker fetch is blocked, and runtime-loading the engine from a third party
// defeats the "UiPath owns the dependency" purpose of this widget.
//
// The worker file SHIPS INSIDE THIS PACKAGE (copied into dist/ at build time
// from our exact-pinned pdfjs-dist — see scripts/copy-worker.mjs) and is
// referenced relative to this module:
//  - production bundlers (Vite / webpack 5) recognize the standards-based
//    `new URL(relative, import.meta.url)` pattern even inside dependencies
//    and emit the worker into the app's build output (same-origin, hashed);
//  - dev servers that don't rewrite it (e.g. Vite dev serving a pre-built
//    dependency) still resolve to the real file inside node_modules, which
//    they serve directly — no consumer configuration needed;
//  - the worker bytes are always OUR pinned pdfjs-dist version, immune to a
//    different pdfjs-dist being hoisted elsewhere in the consumer's tree.
//
// Escape hatch: a consumer with an exotic setup can still override this by
// assigning `pdfjs.GlobalWorkerOptions.workerSrc` after importing the widget.
//
// Keep the URL in its own `const`. Assigning `new URL(...)` straight to
// `workerSrc` is miscompiled by Vite 8 when the app sets `base: './'` (which
// every coded app does): the build emits the worker but rewrites the
// statement to `workerSrc = new URL(workerSrc, import.meta.url)`, so pdf.js
// falls back to `./pdf.worker.mjs`, which does not exist, and no PDF renders.
const workerUrl = new URL("./pdf.worker.min.mjs", import.meta.url);
pdfjs.GlobalWorkerOptions.workerSrc = workerUrl.toString();
