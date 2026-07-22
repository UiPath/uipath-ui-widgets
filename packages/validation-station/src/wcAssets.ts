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

import { cp, mkdir, readFile, readdir, rm, writeFile } from "node:fs/promises";
import { createRequire } from "node:module";
import { dirname, isAbsolute, parse, relative, resolve } from "node:path";

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

// Name of the version marker written into `dest`; also the signal that a
// directory was created by this tool and is therefore ours to clear.
const MARKER = ".wc-version";

// This function does `rm -rf dest`, so a bad `dest` (".", "/", "~", the project
// root) could delete much more than intended. Reject destinations that would be
// catastrophic before touching the filesystem.
function assertSafeDest(absDest: string): void {
  if (absDest === parse(absDest).root) {
    throw new Error(
      `[validation-station] refusing to write WC assets to the filesystem root "${absDest}".`,
    );
  }
  // `dest` must not be the current working directory or an ancestor of it —
  // clearing such a path would wipe the project (or more). `relative(dest, cwd)`
  // is "" when equal and has no leading ".." when cwd sits inside dest.
  const toCwd = relative(absDest, process.cwd());
  if (toCwd === "" || (!toCwd.startsWith("..") && !isAbsolute(toCwd))) {
    throw new Error(
      `[validation-station] refusing to write WC assets to "${absDest}": it is the ` +
        `current directory or a parent of it, and clearing it would delete your project. ` +
        `Point copy-assets at a dedicated subfolder like public/du-vs-wc.`,
    );
  }
}

/**
 * Copy the WC bundle (main.js + chunks + du-assets/ + media/ + stylesheets) into
 * `dest`. Idempotent: it records the WC version in `dest/.wc-version` and copies
 * again only when that changes, so it's cheap to run on every `predev`/`prebuild`.
 *
 * `dest` is resolved to an absolute path and guarded: it refuses catastrophic
 * targets (filesystem root, the cwd, an ancestor of the cwd) and refuses to
 * clear a non-empty directory it did not create (one without a `.wc-version`
 * marker), so it never deletes files that aren't its own.
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

  const absDest = resolve(dest);
  assertSafeDest(absDest);

  const marker = resolve(absDest, MARKER);
  try {
    if ((await readFile(marker, "utf8")).trim() === version) return false;
  } catch {
    // no marker (or unreadable) → (re)copy
  }

  // Only clear a directory we own. If `dest` exists, is non-empty, and has no
  // marker, it wasn't created by this tool (e.g. a shared `public/`) — refuse
  // rather than `rm -rf` someone else's files.
  let existing: string[] = [];
  try {
    existing = await readdir(absDest);
  } catch {
    // dest doesn't exist yet → nothing to clear
  }
  if (existing.length > 0 && !existing.includes(MARKER)) {
    throw new Error(
      `[validation-station] refusing to overwrite "${absDest}": it is non-empty and was ` +
        `not created by this tool (no ${MARKER} marker). Point copy-assets at a dedicated ` +
        `folder like public/du-vs-wc.`,
    );
  }

  // Clear stale files (content-hashed chunks from an older version) before copying.
  await rm(absDest, { recursive: true, force: true });
  await mkdir(absDest, { recursive: true });
  await cp(root, absDest, {
    recursive: true,
    filter: (src) => {
      const rel = src.slice(root.length + 1);
      return rel === "" || (!rel.startsWith("node_modules") && !SKIP.has(rel));
    },
  });
  await writeFile(marker, version);
  return true;
}
