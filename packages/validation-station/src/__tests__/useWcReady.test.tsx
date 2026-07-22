/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, waitFor } from "@testing-library/react";
import { useWcReady } from "../useWcReady";

const mockWaitForWcElementReady = vi.fn();

vi.mock("../loadValidationStationWc", () => ({
  waitForWcElementReady: (...args: any[]) => mockWaitForWcElementReady(...args),
}));

function Harness({ tag }: { tag: string }) {
  const { ready, error } = useWcReady(tag);
  return (
    <div data-testid="state">
      {error ? `error:${error}` : ready ? "ready" : "waiting"}
    </div>
  );
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe("useWcReady", () => {
  it("starts as not-ready and flips to ready once the element upgrades", async () => {
    mockWaitForWcElementReady.mockResolvedValue(undefined);
    const { getByTestId } = render(<Harness tag="my-tag" />);

    expect(getByTestId("state").textContent).toBe("waiting");
    await waitFor(() => expect(getByTestId("state").textContent).toBe("ready"));
    expect(mockWaitForWcElementReady).toHaveBeenCalledWith("my-tag");
  });

  it("surfaces the error message when the WC bundle fails to load", async () => {
    mockWaitForWcElementReady.mockRejectedValue(new Error("boom: no bundle"));
    const { getByTestId } = render(<Harness tag="my-tag" />);

    expect(getByTestId("state").textContent).toBe("waiting");
    await waitFor(() =>
      expect(getByTestId("state").textContent).toBe("error:boom: no bundle"),
    );
  });

  it("does not set error when unmounted before the load rejects", async () => {
    let reject!: (e: unknown) => void;
    mockWaitForWcElementReady.mockReturnValue(
      new Promise<void>((_, r) => {
        reject = r;
      }),
    );
    const { getByTestId, unmount } = render(<Harness tag="slow-tag" />);
    expect(getByTestId("state").textContent).toBe("waiting");

    unmount();
    reject(new Error("late failure"));
    // The cancelled guard must swallow the late rejection without throwing.
    await Promise.resolve();
    expect(mockWaitForWcElementReady).toHaveBeenCalledTimes(1);
  });

  it("does not set ready when unmounted before the element upgrades", async () => {
    let resolve!: () => void;
    mockWaitForWcElementReady.mockReturnValue(
      new Promise<void>((r) => {
        resolve = r;
      }),
    );
    const { getByTestId, unmount } = render(<Harness tag="slow-tag" />);
    expect(getByTestId("state").textContent).toBe("waiting");

    unmount();
    resolve();
    // No assertion on DOM after unmount — the guard simply must not throw.
    await Promise.resolve();
    expect(mockWaitForWcElementReady).toHaveBeenCalledTimes(1);
  });

  it("re-waits when the tag changes", async () => {
    mockWaitForWcElementReady.mockResolvedValue(undefined);
    const { rerender } = render(<Harness tag="tag-a" />);
    await waitFor(() =>
      expect(mockWaitForWcElementReady).toHaveBeenCalledWith("tag-a"),
    );

    rerender(<Harness tag="tag-b" />);
    await waitFor(() =>
      expect(mockWaitForWcElementReady).toHaveBeenCalledWith("tag-b"),
    );
    expect(mockWaitForWcElementReady).toHaveBeenCalledTimes(2);
  });

  it("ignores a stale resolution from the previous tag after the tag changes", async () => {
    // tag-a's wait never settles until we release it; tag-b resolves immediately.
    let resolveA!: () => void;
    mockWaitForWcElementReady
      .mockReturnValueOnce(
        new Promise<void>((r) => {
          resolveA = r;
        }),
      )
      .mockResolvedValueOnce(undefined);

    const { getByTestId, rerender } = render(<Harness tag="tag-a" />);
    rerender(<Harness tag="tag-b" />);
    await waitFor(() => expect(getByTestId("state").textContent).toBe("ready"));

    // The abandoned tag-a effect resolving late must be a no-op (cancelled
    // guard) — it must not throw and must not flip state back/forth.
    resolveA();
    await Promise.resolve();
    expect(getByTestId("state").textContent).toBe("ready");
    expect(mockWaitForWcElementReady).toHaveBeenCalledTimes(2);
  });
});
