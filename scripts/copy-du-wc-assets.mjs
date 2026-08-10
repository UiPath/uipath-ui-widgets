#!/usr/bin/env node
// Stages the DU Validation Station web component into `public/du-vs-wc` so the
// samples app can serve it from its own origin. `configureValidationStationWc`
// then loads it from there at runtime via @uipath/du-utils.
//
// Hosting the bundle as static assets (rather than importing it) is what keeps
// it out of Vite's module graph: files under `public/` are served verbatim in
// dev and copied to `dist/` preserving layout, so the component's own
// `import.meta.url` resolution finds `du-assets/`, `media/`, `styles.css`, and
// `fonts.css` as siblings of `main.js` with no bundler plugins involved.
//
// Paths are fixed — resolved from the installed package and a literal
// destination — so nothing here is caller-controlled.
import { cp, readFile, rm, writeFile } from "node:fs/promises";
import { createRequire } from "node:module";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const require = createRequire(import.meta.url);
const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");

const wcManifest =
  require.resolve("@uipath/du-validation-station-wc/package.json");
const wcRoot = dirname(wcManifest);
const destination = resolve(repoRoot, "public/du-vs-wc");
// Records which version is staged so repeat `npm run dev` doesn't re-copy ~74 MB.
const stamp = resolve(destination, ".version");

const { version } = JSON.parse(await readFile(wcManifest, "utf8"));
const staged = await readFile(stamp, "utf8").catch(() => null);

if (staged === version) {
  console.log(`du-vs-wc ${version} already staged in public/du-vs-wc.`);
  process.exit(0);
}

// Full replace rather than merge: a version bump renames the hashed chunks, and
// leaving the old ones behind would silently grow the directory every upgrade.
await rm(destination, { recursive: true, force: true });
await cp(wcRoot, destination, { recursive: true });
await writeFile(stamp, version);

console.log(`Staged du-vs-wc ${version} → public/du-vs-wc.`);
