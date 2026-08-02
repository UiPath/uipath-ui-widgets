import { describe, it, expect } from "vitest";
import reactPdfPackage from "react-pdf/package.json";
import pdfjsPackage from "pdfjs-dist/package.json";
import ourPackage from "../../package.json";

/**
 * The pdf.js engine is split in two: the API half (imported via react-pdf)
 * and the worker file (resolved from OUR "pdfjs-dist" dependency by the
 * consumer's bundler — see pdfWorker.ts). If the two resolve to different
 * pdfjs-dist versions, the viewer dies at runtime with
 * "API version X does not match Worker version Y".
 *
 * react-pdf exact-pins its pdfjs-dist for this reason; we must pin the same
 * version. This test fails whenever react-pdf is bumped without re-syncing
 * our pdfjs-dist pin.
 */
describe("pdfjs-dist version sync", () => {
  it("our pdfjs-dist pin matches react-pdf's exact pin", () => {
    const reactPdfPin = reactPdfPackage.dependencies["pdfjs-dist"];
    expect(ourPackage.dependencies["pdfjs-dist"]).toBe(reactPdfPin);
  });

  it("the resolved pdfjs-dist copy matches react-pdf's pin", () => {
    const reactPdfPin = reactPdfPackage.dependencies["pdfjs-dist"];
    expect(pdfjsPackage.version).toBe(reactPdfPin);
  });

  // The worker ships inside the package: pdfWorker.ts references
  // "./pdf.worker.min.mjs" and the build copies it into dist/ (with its own
  // version check — see scripts/copy-worker.mjs). If the copy step is dropped
  // from the build, the published package 404s its own worker.
  it("the build pipeline copies the packaged worker into dist", () => {
    expect(ourPackage.scripts.build).toContain("copy-worker");
    expect(ourPackage.exports["./pdf.worker.min.mjs"]).toBe(
      "./dist/pdf.worker.min.mjs",
    );
  });
});
