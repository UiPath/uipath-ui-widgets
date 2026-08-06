import { describe, expect, it } from "vitest";
import { joinDeploymentUrl } from "../urlUtil";

describe("joinDeploymentUrl", () => {
  it("joins a base with no trailing slash to a path with no leading slash", () => {
    expect(joinDeploymentUrl("/org/apps_/some-app/public", "du-vs-wc")).toBe(
      "/org/apps_/some-app/public/du-vs-wc",
    );
  });

  it("does not double the slash when base ends in one", () => {
    expect(joinDeploymentUrl("/", "du-vs-wc")).toBe("/du-vs-wc");
  });

  it("does not double the slash when path starts with one", () => {
    expect(joinDeploymentUrl("/org/apps_/some-app/public", "/du-vs-wc")).toBe(
      "/org/apps_/some-app/public/du-vs-wc",
    );
  });

  it("collapses multiple trailing slashes on the base", () => {
    expect(joinDeploymentUrl("/org//", "du-vs-wc")).toBe("/org/du-vs-wc");
  });

  it("collapses multiple leading slashes on the path", () => {
    expect(joinDeploymentUrl("/org", "//du-vs-wc")).toBe("/org/du-vs-wc");
  });

  it("produces a root-relative URL from an empty base", () => {
    expect(joinDeploymentUrl("", "du-vs-wc")).toBe("/du-vs-wc");
  });
});
