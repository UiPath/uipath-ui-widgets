#!/usr/bin/env node
// Verify that every key referenced via t("...") in cas source exists in
// en/index.json, and warn about orphan keys. Zero deps.

import { readFile, readdir } from "node:fs/promises";
import { join, extname } from "node:path";

const SRC_ROOT = "packages/conversational-agent-chat/src";
const EN_LOCALE =
  "packages/conversational-agent-chat/src/i18n/locales/en/index.json";
const IGNORE_DIRS = new Set(["__tests__", "node_modules", "dist"]);
// Matches t("key") / t('key') / t(`key`). The backtick branch rejects `$`
// so interpolated template literals (dynamic keys) fall through and are not
// recorded — those can't be statically verified anyway.
const KEY_RE = /(?<![\w.])t\(\s*(?:["']([^"'\n]+)["']|`([^`$\n]+)`)/g;

async function* walk(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  for (const e of entries) {
    if (IGNORE_DIRS.has(e.name)) continue;
    const full = join(dir, e.name);
    if (e.isDirectory()) {
      yield* walk(full);
    } else if (e.isFile()) {
      const ext = extname(e.name);
      if (
        (ext === ".ts" || ext === ".tsx") &&
        !/\.(stories|test)\.(ts|tsx)$/.test(e.name)
      ) {
        yield full;
      }
    }
  }
}

async function main() {
  const localeRaw = await readFile(EN_LOCALE, "utf8");
  const locale = JSON.parse(localeRaw);
  const defined = new Set(Object.keys(locale));

  const referenced = new Set();
  const whereReferenced = new Map();

  for await (const file of walk(SRC_ROOT)) {
    const src = await readFile(file, "utf8");
    KEY_RE.lastIndex = 0;
    let m;
    while ((m = KEY_RE.exec(src)) !== null) {
      const key = m[1] ?? m[2];
      referenced.add(key);
      if (!whereReferenced.has(key)) whereReferenced.set(key, file);
    }
  }

  const missing = [...referenced].filter((k) => !defined.has(k)).sort();
  const orphan = [...defined].filter((k) => !referenced.has(k)).sort();

  let exitCode = 0;

  if (missing.length) {
    console.error(
      `\ni18n: ${missing.length} key(s) used in t(...) but missing from ${EN_LOCALE}:`,
    );
    for (const k of missing) {
      console.error(`  - ${k}   (first seen in ${whereReferenced.get(k)})`);
    }
    console.error(
      "\nAdd each key to en/index.json with an English translation, then re-run.\n",
    );
    exitCode = 1;
  }

  if (orphan.length) {
    console.warn(
      `\ni18n: ${orphan.length} key(s) defined in en/index.json but no longer referenced:`,
    );
    for (const k of orphan) console.warn(`  - ${k}`);
    console.warn("Consider removing them.\n");
  }

  if (!exitCode && !orphan.length) {
    console.log(
      `i18n: ${referenced.size} key(s) referenced, all present in en/index.json.`,
    );
  } else if (!exitCode) {
    console.log(
      `i18n: ${referenced.size} key(s) referenced, all present in en/index.json (see orphan warnings above).`,
    );
  }

  process.exit(exitCode);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
