/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor, act } from "@testing-library/react";

const resolveAgent = vi.fn();
vi.mock("../utils/resolveAgent", () => ({
  resolveAgent: (...args: any[]) => resolveAgent(...args),
}));

import { useResolvedAgent } from "../hooks/useResolvedAgent";

const makeSdk = () => ({}) as any;
const AGENT = { id: 1, name: "Agent One", description: "", folderId: 2 };

beforeEach(() => {
  resolveAgent.mockReset();
});

describe("useResolvedAgent", () => {
  it("clears stale agent state and reloads when the sdk instance changes", async () => {
    let resolveFirst!: (v: unknown) => void;
    resolveAgent.mockImplementationOnce(
      () =>
        new Promise((res) => {
          resolveFirst = res;
        }),
    );

    const { result, rerender } = renderHook(
      ({ sdk }) => useResolvedAgent(sdk, 1),
      { initialProps: { sdk: makeSdk() } },
    );

    expect(result.current.isLoading).toBe(true);
    expect(result.current.agent).toBeNull();

    await act(async () => {
      resolveFirst(AGENT);
    });
    expect(result.current.agent?.name).toBe("Agent One");
    expect(result.current.isLoading).toBe(false);

    // Swap to a different sdk instance (same agentId); leave the refetch pending.
    resolveAgent.mockImplementationOnce(() => new Promise(() => {}));
    rerender({ sdk: makeSdk() });

    expect(result.current.isLoading).toBe(true);
    expect(result.current.agent).toBeNull();
  });

  it("does not reset for the same sdk instance and inputs", async () => {
    resolveAgent.mockResolvedValue(AGENT);
    const sdk = makeSdk();

    const { result, rerender } = renderHook(
      ({ id }) => useResolvedAgent(sdk, id),
      { initialProps: { id: 1 } },
    );

    await waitFor(() => expect(result.current.agent?.name).toBe("Agent One"));
    rerender({ id: 1 });
    expect(result.current.agent?.name).toBe("Agent One");
    expect(result.current.isLoading).toBe(false);
  });
});
