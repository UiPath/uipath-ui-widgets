import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { readFileSync } from "node:fs";
import {
  mkdir,
  mkdtemp,
  readFile,
  readdir,
  rm,
  writeFile,
} from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, parse } from "node:path";
import { copyValidationStationWcAssets, wcPackageRoot } from "../wcAssets";

// The version of the installed WC — what the marker is expected to hold.
const WC_VERSION = (
  JSON.parse(readFileSync(join(wcPackageRoot(), "package.json"), "utf8")) as {
    version: string;
  }
).version;

let tmp: string;
beforeEach(async () => {
  tmp = await mkdtemp(join(tmpdir(), "vs-wc-assets-"));
});
afterEach(async () => {
  await rm(tmp, { recursive: true, force: true });
});

describe("copyValidationStationWcAssets — destructive-path guards", () => {
  it("refuses the filesystem root", async () => {
    await expect(
      copyValidationStationWcAssets(parse(process.cwd()).root),
    ).rejects.toThrow(/filesystem root/i);
  });

  it("refuses the current working directory", async () => {
    await expect(copyValidationStationWcAssets(process.cwd())).rejects.toThrow(
      /current directory or a parent/i,
    );
  });

  it("refuses an ancestor of the cwd", async () => {
    await expect(
      copyValidationStationWcAssets(join(process.cwd(), "..")),
    ).rejects.toThrow(/current directory or a parent/i);
  });

  it("refuses a non-empty directory it did not create, leaving it untouched", async () => {
    await writeFile(join(tmp, "important.txt"), "keep me");
    await expect(copyValidationStationWcAssets(tmp)).rejects.toThrow(
      /not created by this tool/i,
    );
    expect(await readFile(join(tmp, "important.txt"), "utf8")).toBe("keep me");
  });
});

describe("copyValidationStationWcAssets — copy behavior", () => {
  it("copies into a fresh dir, writes the marker, and is idempotent", async () => {
    const dest = join(tmp, "du-vs-wc");

    await expect(copyValidationStationWcAssets(dest)).resolves.toBe(true);
    const files = await readdir(dest);
    expect(files).toContain("main.js");
    expect(files).toContain(".wc-version");
    expect((await readFile(join(dest, ".wc-version"), "utf8")).trim()).toBe(
      WC_VERSION,
    );

    // Second run: marker matches → no-op.
    await expect(copyValidationStationWcAssets(dest)).resolves.toBe(false);
  });

  it("skips (returns false) when the marker already matches", async () => {
    const dest = join(tmp, "du-vs-wc");
    await mkdir(dest, { recursive: true });
    await writeFile(join(dest, ".wc-version"), WC_VERSION);
    await expect(copyValidationStationWcAssets(dest)).resolves.toBe(false);
  });

  it("re-copies a dir it owns (marker present) and clears stale files", async () => {
    const dest = join(tmp, "du-vs-wc");
    await mkdir(dest, { recursive: true });
    await writeFile(join(dest, ".wc-version"), "0.0.0-stale");
    await writeFile(join(dest, "stale-chunk.js"), "old");

    await expect(copyValidationStationWcAssets(dest)).resolves.toBe(true);
    const files = await readdir(dest);
    expect(files).toContain("main.js");
    expect(files).not.toContain("stale-chunk.js");
  });
});
