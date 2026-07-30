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
// `new URL(..., import.meta.url)` is the standards-based pattern that Vite and
// webpack 5 both recognize: the consumer's bundler copies the worker out of
// node_modules into the app's own build output (same-origin, version-pinned
// to the pdfjs-dist that react-pdf resolves).
pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.min.mjs",
  import.meta.url,
).toString();
