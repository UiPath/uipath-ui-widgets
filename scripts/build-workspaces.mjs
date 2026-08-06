#!/usr/bin/env node
import { spawn } from "node:child_process";
import { readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { createInterface } from "node:readline";

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const rootPkg = JSON.parse(
  readFileSync(join(repoRoot, "package.json"), "utf8"),
);

const c = {
  reset: "\x1b[0m",
  bold: "\x1b[1m",
  dim: "\x1b[2m",
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  magenta: "\x1b[35m",
  cyan: "\x1b[36m",
};
const tagColors = [c.cyan, c.magenta, c.yellow, c.blue, c.green];

const targets = [];
for (const wsPath of rootPkg.workspaces ?? []) {
  const pkgPath = join(repoRoot, wsPath, "package.json");
  try {
    const pkg = JSON.parse(readFileSync(pkgPath, "utf8"));
    if (pkg.scripts?.build) {
      targets.push({ name: pkg.name, cwd: join(repoRoot, wsPath) });
    }
  } catch {
    // workspace folder missing or unreadable — skip
  }
}

if (targets.length === 0) {
  console.log("No workspaces with a build script found.");
  process.exit(0);
}

const tagWidth = Math.max(...targets.map((t) => t.name.length));
const results = [];

const runBuild = (target, color) =>
  new Promise((done) => {
    const tag = `${color}[${target.name.padEnd(tagWidth)}]${c.reset}`;
    const start = Date.now();
    console.log(`\n${tag} ${c.bold}building...${c.reset}`);

    const child = spawn("npm", ["run", "build"], {
      cwd: target.cwd,
      env: process.env,
    });

    const prefix = (stream, isErr) => {
      const rl = createInterface({ input: stream });
      rl.on("line", (line) => {
        const out = isErr ? process.stderr : process.stdout;
        out.write(`${tag} ${line}\n`);
      });
    };
    prefix(child.stdout, false);
    prefix(child.stderr, true);

    child.on("close", (code) => {
      const duration = ((Date.now() - start) / 1000).toFixed(1);
      const ok = code === 0;
      const status = ok
        ? `${c.green}✓ success${c.reset}`
        : `${c.red}✗ failed (exit ${code})${c.reset}`;
      console.log(`${tag} ${status} ${c.dim}(${duration}s)${c.reset}`);
      results.push({ name: target.name, ok, code, duration });
      done();
    });
  });

const overallStart = Date.now();
await Promise.all(
  targets.map((t, i) => runBuild(t, tagColors[i % tagColors.length])),
);
const overallDuration = ((Date.now() - overallStart) / 1000).toFixed(1);

console.log(
  `\n${c.bold}Build summary${c.reset} ${c.dim}(${overallDuration}s total)${c.reset}`,
);
console.log("─".repeat(tagWidth + 30));
for (const r of results) {
  const icon = r.ok ? `${c.green}✓${c.reset}` : `${c.red}✗${c.reset}`;
  const status = r.ok
    ? `${c.green}success${c.reset}`
    : `${c.red}FAILED${c.reset}`;
  console.log(
    `  ${icon} ${r.name.padEnd(tagWidth)}  ${status}  ${c.dim}${r.duration}s${c.reset}`,
  );
}

const failed = results.filter((r) => !r.ok);
if (failed.length > 0) {
  console.log(
    `\n${c.red}${c.bold}${failed.length} package(s) failed to build${c.reset}`,
  );
  process.exit(1);
}
console.log(`\n${c.green}${c.bold}All packages built successfully${c.reset}`);
