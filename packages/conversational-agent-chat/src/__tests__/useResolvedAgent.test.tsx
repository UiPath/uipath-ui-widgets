/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor, act } from "@testing-library/react";

const resolveAgentCached = vi.fn();
vi.mock("../utils/agentCache", () => ({
  resolveAgentCached: (...args: any[]) => resolveAgentCached(...args),
}));

import { useResolvedAgent } from "../hooks/useResolvedAgent";

const makeSdk = () => ({}) as any;
const AGENT = { id: 1, name: "Agent One", description: "", folderId: 2 };

beforeEach(() => {
  resolveAgentCached.mockReset();
});

describe("useResolvedAgent", () => {
  it("clears stale agent state and reloads when the sdk instance changes", async () => {
    let resolveFirst!: (v: unknown) => void;
    resolveAgentCached.mockImplementationOnce(
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
    resolveAgentCached.mockImplementationOnce(() => new Promise(() => {}));
    rerender({ sdk: makeSdk() });

    expect(result.current.isLoading).toBe(true);
    expect(result.current.agent).toBeNull();
  });

  it("does not reset for the same sdk instance and inputs", async () => {
    resolveAgentCached.mockResolvedValue(AGENT);
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
