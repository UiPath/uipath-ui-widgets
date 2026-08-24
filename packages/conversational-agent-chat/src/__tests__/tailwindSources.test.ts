import { readFileSync, readdirSync, statSync, existsSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, join, relative, resolve } from "node:path";

import { describe, expect, it } from "vitest";

/**
 * Guardrail for the targeted `@source` globs in ConversationalAgentChat.scss
 * (JAR-10167). The stylesheet scans only the apollo-wind modules this package
 * transitively imports; if a new apollo-wind component is imported without
 * extending the globs, its utility classes silently vanish from the compiled
 * CSS. This test recomputes the import closure and checks glob coverage.
 */

const pkgDir = resolve(__dirname, "../..");
const srcDir = resolve(pkgDir, "src");
const scss = readFileSync(
  resolve(srcDir, "ConversationalAgentChat.scss"),
  "utf8",
);

const windDist = (() => {
  try {
    // apollo-wind's exports map has no "./package.json"; resolve the entry
    // point (dist/index.cjs) and take its directory.
    const require = createRequire(import.meta.url);
    return dirname(require.resolve("@uipath/apollo-wind"));
  } catch {
    return null;
  }
})();

const walk = (dir: string, out: string[] = []): string[] => {
  for (const entry of readdirSync(dir)) {
    const p = join(dir, entry);
    if (statSync(p).isDirectory()) {
      if (entry !== "node_modules" && entry !== "__tests__") walk(p, out);
    } else if (
      /\.(ts|tsx)$/.test(entry) &&
      !/\.(test|stories)\.tsx?$/.test(entry)
    ) {
      out.push(p);
    }
  }
  return out;
};

/** Named imports from `@uipath/apollo-wind` across the package sources. */
const importedNames = (): Set<string> => {
  const names = new Set<string>();
  const importRe =
    /import\s*(?:type\s*)?\{([^}]*)\}\s*from\s*["']@uipath\/apollo-wind["']/gs;
  for (const file of walk(srcDir)) {
    const src = readFileSync(file, "utf8");
    for (const match of src.matchAll(importRe)) {
      for (const raw of match[1].split(",")) {
        const name = raw
          .replace(/\/\/.*$/, "")
          .trim()
          .split(/\s+as\s+/)[0]
          .trim();
        if (name) names.add(name);
      }
    }
  }
  return names;
};

/** Transitive closure of apollo-wind dist modules behind those names. */
const moduleClosure = (dist: string, names: Set<string>): string[] => {
  const index = readFileSync(join(dist, "index.js"), "utf8");
  const resolveSpec = (from: string, spec: string): string | null => {
    const base = resolve(dirname(from), spec);
    for (const candidate of [base, `${base}.js`, join(base, "index.js")]) {
      if (existsSync(candidate) && statSync(candidate).isFile())
        return candidate;
    }
    return null;
  };

  const stack: string[] = [];
  const importRe = /import\s*\{([^}]*)\}\s*from\s*["'](\.[^"']+)["']/gs;
  for (const match of index.matchAll(importRe)) {
    const exported = match[1].split(",").map((s) =>
      s
        .trim()
        .split(/\s+as\s+/)
        .pop(),
    );
    if (exported.some((n) => n && names.has(n))) {
      const file = resolveSpec(join(dist, "index.js"), match[2]);
      if (file) stack.push(file);
    }
  }

  const seen = new Set<string>();
  const relImportRe = /(?:import|export)[^"'\n]*from\s*["'](\.[^"']+)["']/g;
  while (stack.length > 0) {
    const file = stack.pop();
    if (!file || seen.has(file)) continue;
    seen.add(file);
    const src = readFileSync(file, "utf8");
    for (const match of src.matchAll(relImportRe)) {
      const dep = resolveSpec(file, match[1]);
      if (dep && !seen.has(dep)) stack.push(dep);
    }
  }
  return [...seen].map((f) => relative(dist, f)).sort();
};

/** The scss's apollo-wind @source globs, brace-expanded, as dist-relative regexes. */
const sourceGlobMatchers = (): RegExp[] => {
  const matchers: RegExp[] = [];
  const sourceRe = /@source\s+"[^"]*apollo-wind\/dist\/([^"]+)";/g;
  for (const match of scss.matchAll(sourceRe)) {
    const expand = (pattern: string): string[] => {
      const brace = /\{([^}]*)\}/.exec(pattern);
      if (!brace) return [pattern];
      return brace[1]
        .split(",")
        .flatMap((alt) =>
          expand(
            pattern.slice(0, brace.index) +
              alt +
              pattern.slice(brace.index + brace[0].length),
          ),
        );
    };
    for (const pattern of expand(match[1])) {
      matchers.push(
        new RegExp(
          "^" +
            pattern
              .split("*")
              .map((s) => s.replace(/[.+?^${}()|[\]\\]/g, "\\$&"))
              .join("[^/]*") +
            "$",
        ),
      );
    }
  }
  return matchers;
};

describe("tailwind @source coverage", () => {
  it.skipIf(!windDist)(
    "covers every apollo-wind module this package transitively imports",
    () => {
      const closure = moduleClosure(windDist as string, importedNames());
      expect(closure.length).toBeGreaterThan(0);
      const matchers = sourceGlobMatchers();
      expect(matchers.length).toBeGreaterThan(0);
      const uncovered = closure.filter(
        (file) => !matchers.some((m) => m.test(file)),
      );
      // A failure here means a new apollo-wind import needs its module added
      // to the @source lists in ConversationalAgentChat.scss.
      expect(uncovered).toEqual([]);
    },
  );
});
