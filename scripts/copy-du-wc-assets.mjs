#!/usr/bin/env node
// Stages the DU web components — Validation Station, Classification Station
// and the document viewer — into `public/du-vs-wc`, `public/du-cs-wc` and
// `public/du-dv-wc` so the samples app and Storybook can serve them from their
// own origin. Each widget's `configure…Wc` then loads its bundle from there at
// runtime via @uipath/du-utils.
//
// Hosting the bundles as static assets (rather than importing them) is what
// keeps them out of Vite's module graph: files under `public/` are served
// verbatim in dev and copied to `dist/` preserving layout, so each component's
// own `import.meta.url` resolution finds `du-assets/`, `media/`, `styles.css`,
// and `fonts.css` as siblings of `main.js` with no bundler plugins involved.
//
// Paths are fixed — resolved from the installed packages and literal
// destinations — so nothing here is caller-controlled.
import { cp, readFile, rm, writeFile } from "node:fs/promises";
import { createRequire } from "node:module";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const require = createRequire(import.meta.url);
const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");

const components = [
  { pkg: "@uipath/du-validation-station-wc", dir: "du-vs-wc" },
  { pkg: "@uipath/du-classification-station-wc", dir: "du-cs-wc" },
  { pkg: "@uipath/du-document-viewer-wc", dir: "du-dv-wc" },
];

for (const { pkg, dir } of components) {
  const wcManifest = require.resolve(`${pkg}/package.json`);
  const wcRoot = dirname(wcManifest);
  const destination = resolve(repoRoot, "public", dir);
  // Records which version is staged so a repeat `npm run dev` doesn't re-copy
  // tens of megabytes.
  const stamp = resolve(destination, ".version");

  const { version } = JSON.parse(await readFile(wcManifest, "utf8"));
  const staged = await readFile(stamp, "utf8").catch(() => null);

  if (staged === version) {
    console.log(`${dir} ${version} already staged in public/${dir}.`);
    continue;
  }

  // Full replace rather than merge: a version bump renames the hashed chunks,
  // and leaving the old ones behind would silently grow the directory every
  // upgrade.
  await rm(destination, { recursive: true, force: true });
  await cp(wcRoot, destination, { recursive: true });
  await writeFile(stamp, version);

  console.log(`Staged ${dir} ${version} → public/${dir}.`);
}
