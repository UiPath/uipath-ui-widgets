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
pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  "./pdf.worker.min.mjs",
  import.meta.url,
).toString();
