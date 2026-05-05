import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const here = dirname(fileURLToPath(import.meta.url));
const pkgPath = resolve(here, "..", "package.json");
const versionFile = resolve(here, "..", "src", "version.ts");

const { version } = JSON.parse(readFileSync(pkgPath, "utf8"));
const next = `// Generated from package.json by scripts/sync-version.mjs. Do not edit by hand.\nexport const version = ${JSON.stringify(version)};\n`;

let current = "";
try {
  current = readFileSync(versionFile, "utf8");
} catch {
  // first run — file doesn't exist yet
}

if (current !== next) {
  writeFileSync(versionFile, next);
  console.log(`sync-version: wrote ${version} to src/version.ts`);
} else {
  console.log(`sync-version: src/version.ts already at ${version}`);
}
