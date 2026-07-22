#!/usr/bin/env node
// ─────────────────────────────────────────────────────────────────────────────
// uipath-vs-wc copy-assets [dest]
//
// Copies the DU Validation Station web-component bundle into a static folder your
// bundler serves. This is the ANY-BUNDLER path: point it at whatever directory
// your framework serves at the site root — Vite/Next/CRA `public`, Angular
// `src/assets`, SvelteKit `static`, Astro `public`, etc. — then set
// `configureValidationStationWc({ baseUrl })` to the matching URL path.
//
// Because that static folder is served in dev AND emitted to the build output by
// every one of those frameworks, this single command covers dev + prod without a
// bundler-specific plugin. Wire it as a `predev`/`prebuild` script and gitignore
// the destination.
// ─────────────────────────────────────────────────────────────────────────────

import { copyValidationStationWcAssets } from "./wcAssets.js";

async function main(): Promise<void> {
  const [cmd, dest = "public/du-vs-wc"] = process.argv.slice(2);
  if (cmd !== "copy-assets") {
    console.error(
      "usage: uipath-vs-wc copy-assets [dest]   (default dest: public/du-vs-wc)",
    );
    process.exitCode = 1;
    return;
  }
  const copied = await copyValidationStationWcAssets(dest);
  console.log(
    copied
      ? `[validation-station] copied WC assets → ${dest}`
      : `[validation-station] WC assets already up to date in ${dest}`,
  );
}

main().catch((err: unknown) => {
  console.error("[validation-station]", err);
  process.exitCode = 1;
});
