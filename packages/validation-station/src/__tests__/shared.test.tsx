/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi } from "vitest";
import { render } from "@testing-library/react";
import { isValidElement } from "react";
import {
  renderWcElement,
  wcStyle,
  resolveArtifacts,
} from "../subcomponents/shared";
import type { DuDocumentArtifacts } from "../types";

describe("wcStyle", () => {
  it("returns undefined for undefined input", () => {
    expect(wcStyle(undefined)).toBeUndefined();
  });

  it("passes a style object through unchanged", () => {
    const style = { color: "red", width: 10 };
    expect(wcStyle(style)).toBe(style);
  });
});

describe("renderWcElement", () => {
  it("creates an element of the given tag with props and ref", () => {
    const ref = vi.fn();
    const el = renderWcElement("my-tag", { theme: "dark" } as any, ref);
    expect(isValidElement(el)).toBe(true);
    expect(el.type).toBe("my-tag");
    expect((el.props as any).theme).toBe("dark");
    expect((el.props as any).ref).toBe(ref);
  });

  it("renders into the DOM as the requested tag, forwarding props and ref", () => {
    const ref = vi.fn();
    const { container } = render(
      renderWcElement(
        "my-tag",
        { "instance-id": "i1", theme: "dark" } as any,
        ref,
      ),
    );
    const el = container.querySelector("my-tag");
    expect(el).toBeInTheDocument();
    // Props must actually land on the element, not just the tag be present.
    expect(el!.getAttribute("instance-id")).toBe("i1");
    expect(el!.getAttribute("theme")).toBe("dark");
    // The ref callback receives the real element (this is how event binding attaches).
    expect(ref).toHaveBeenCalledWith(el);
  });
});

describe("resolveArtifacts", () => {
  const artifacts = { taxonomy: {} } as unknown as DuDocumentArtifacts;

  it("returns an error fallback when error is set", () => {
    const gate = resolveArtifacts("boom", true, artifacts);
    expect(gate.ready).toBe(false);
    if (!gate.ready) {
      const { container } = render(gate.fallback);
      expect(container.textContent).toContain(
        "Failed to load document artifacts: boom",
      );
    }
  });

  it("returns a loading fallback when artifacts are null", () => {
    const gate = resolveArtifacts(null, true, null);
    expect(gate.ready).toBe(false);
    if (!gate.ready) {
      const { container } = render(gate.fallback);
      expect(container.textContent).toContain("Loading...");
    }
  });

  it("returns a loading fallback when the WC is not ready (even with artifacts)", () => {
    const gate = resolveArtifacts(null, false, artifacts);
    expect(gate.ready).toBe(false);
    if (!gate.ready) {
      const { container } = render(gate.fallback);
      expect(container.textContent).toContain("Loading...");
    }
  });

  it("prefers the error fallback over loading when both an error and not-ready hold", () => {
    const gate = resolveArtifacts("boom", false, null);
    expect(gate.ready).toBe(false);
    if (!gate.ready) {
      const { container } = render(gate.fallback);
      expect(container.textContent).toContain(
        "Failed to load document artifacts: boom",
      );
      expect(container.textContent).not.toContain("Loading...");
    }
  });

  it("returns ready with the artifacts when loaded and ready", () => {
    const gate = resolveArtifacts(null, true, artifacts);
    expect(gate.ready).toBe(true);
    if (gate.ready) expect(gate.artifacts).toBe(artifacts);
  });
});
