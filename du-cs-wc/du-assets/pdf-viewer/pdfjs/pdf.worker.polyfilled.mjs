// INVARIANT: static imports only, in this order — a dynamic import would let the worker start
// dispatching queued messages before pdfjs registers its handler.
import './pdf-worker-polyfills.mjs';
import './pdf.worker.min.mjs';
