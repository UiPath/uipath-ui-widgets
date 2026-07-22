// ─────────────────────────────────────────────────────────────────────────────
// Bundler-neutral provisioning for the DU Validation Station web component.
//
// The widget loads the WC at runtime from a served URL (see loadValidationStationWc).
// This module is the single, bundler-agnostic way to get the WC's files to that
// served location: it copies the bundle out of node_modules into a folder your
// host serves. The `uipath-vs-wc` CLI and the bundler plugins are thin wrappers
// over it, and you can call it directly from any bundler config that lets you run
// Node code (webpack/rspack plugin hook, a build script, a Rollup plugin, etc.).
//
// Node-only (uses `node:fs`); never imported by the browser entry.
// ─────────────────────────────────────────────────────────────────────────────

import { cp, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { createRequire } from "node:module";
import { dirname, resolve } from "node:path";

const require = createRequire(import.meta.url);

/** Absolute path to the installed `@uipath/du-validation-station-wc` package. */
export function wcPackageRoot(): string {
  return dirname(
    require.resolve("@uipath/du-validation-station-wc/package.json"),
  );
}

// Package metadata that must not ship to the served location.
const SKIP = new Set([
  "package.json",
  "README.md",
  "CHANGELOG.md",
  "types.d.ts",
]);

/**
 * Copy the WC bundle (main.js + chunks + du-assets/ + media/ + stylesheets) into
 * `dest`. Idempotent: it records the WC version in `dest/.wc-version` and copies
 * again only when that changes, so it's cheap to run on every `predev`/`prebuild`.
 *
 * @returns `true` if it copied, `false` if `dest` was already up to date.
 */
export async function copyValidationStationWcAssets(
  dest: string,
): Promise<boolean> {
  const root = wcPackageRoot();
  const { version } = JSON.parse(
    await readFile(resolve(root, "package.json"), "utf8"),
  ) as { version: string };

  const marker = resolve(dest, ".wc-version");
  try {
    if ((await readFile(marker, "utf8")).trim() === version) return false;
  } catch {
    // no marker (or unreadable) → (re)copy
  }

  // Clear stale files (content-hashed chunks from an older version) before copying.
  await rm(dest, { recursive: true, force: true });
  await mkdir(dest, { recursive: true });
  await cp(root, dest, {
    recursive: true,
    filter: (src) => {
      const rel = src.slice(root.length + 1);
      return rel === "" || (!rel.startsWith("node_modules") && !SKIP.has(rel));
    },
  });
  await writeFile(marker, version);
  return true;
}
