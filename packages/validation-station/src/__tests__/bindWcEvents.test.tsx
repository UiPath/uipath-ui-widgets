/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi } from "vitest";
import { render } from "@testing-library/react";
import { useEffect } from "react";
import { useWcRef, type WcElement, type WcRefCallback } from "../bindWcEvents";

interface TestEventMap {
  loaded: { id: string };
  changed: { value: number };
}

function Harness({
  handlers,
  persistent,
}: {
  handlers: Parameters<typeof useWcRef<TestEventMap>>[0];
  persistent?: boolean;
}) {
  const ref = useWcRef<TestEventMap>(handlers, persistent);
  return <div data-testid="el" ref={ref as any} />;
}

describe("useWcRef", () => {
  it("binds one listener per handler key and dispatches the detail", () => {
    const onLoaded = vi.fn();
    const onChanged = vi.fn();
    const { getByTestId } = render(
      <Harness handlers={{ loaded: onLoaded, changed: onChanged }} />,
    );
    const el = getByTestId("el");

    el.dispatchEvent(new CustomEvent("loaded", { detail: { id: "a" } }));
    el.dispatchEvent(new CustomEvent("changed", { detail: { value: 7 } }));

    expect(onLoaded).toHaveBeenCalledWith({ id: "a" });
    expect(onChanged).toHaveBeenCalledWith({ value: 7 });
  });

  it("dispatches to the latest handler without re-binding when handlers change", () => {
    const first = vi.fn();
    const second = vi.fn();
    const { getByTestId, rerender } = render(
      <Harness handlers={{ loaded: first }} />,
    );
    const el = getByTestId("el");

    rerender(<Harness handlers={{ loaded: second }} />);
    el.dispatchEvent(new CustomEvent("loaded", { detail: { id: "b" } }));

    expect(first).not.toHaveBeenCalled();
    expect(second).toHaveBeenCalledWith({ id: "b" });
    expect(second).toHaveBeenCalledTimes(1);
  });

  it("re-binds (once) and tears down only the persistent variant when `persistent` flips", () => {
    const onLoaded = vi.fn();
    const { getByTestId, rerender, unmount } = render(
      <Harness handlers={{ loaded: onLoaded }} persistent={false} />,
    );
    const el = getByTestId("el") as WcElement;
    const forceDestroy = vi.fn();
    el.forceDestroy = forceDestroy;

    rerender(<Harness handlers={{ loaded: onLoaded }} persistent />);
    expect(forceDestroy).not.toHaveBeenCalled();

    el.dispatchEvent(new CustomEvent("loaded", { detail: { id: "x" } }));
    expect(onLoaded).toHaveBeenCalledTimes(1);

    unmount();
    expect(forceDestroy).toHaveBeenCalledTimes(1);
  });

  it("is a no-op when the handler for an event is undefined at dispatch time", () => {
    const { getByTestId } = render(
      <Harness handlers={{ loaded: undefined, changed: undefined }} />,
    );
    const el = getByTestId("el");
    expect(() =>
      el.dispatchEvent(new CustomEvent("loaded", { detail: { id: "c" } })),
    ).not.toThrow();
  });

  it("removes listeners on unmount", () => {
    const onLoaded = vi.fn();
    const { getByTestId, unmount } = render(
      <Harness handlers={{ loaded: onLoaded }} />,
    );
    const el = getByTestId("el");
    unmount();

    el.dispatchEvent(new CustomEvent("loaded", { detail: { id: "d" } }));
    expect(onLoaded).not.toHaveBeenCalled();
  });

  it("calls forceDestroy on detach when persistent", () => {
    const { getByTestId, unmount } = render(
      <Harness handlers={{ loaded: vi.fn() }} persistent />,
    );
    const el = getByTestId("el") as WcElement;
    const forceDestroy = vi.fn();
    el.forceDestroy = forceDestroy;

    unmount();
    expect(forceDestroy).toHaveBeenCalledTimes(1);
  });

  it("does not call forceDestroy on detach when not persistent", () => {
    const { getByTestId, unmount } = render(
      <Harness handlers={{ loaded: vi.fn() }} persistent={false} />,
    );
    const el = getByTestId("el") as WcElement;
    const forceDestroy = vi.fn();
    el.forceDestroy = forceDestroy;

    unmount();
    expect(forceDestroy).not.toHaveBeenCalled();
  });

  it("no-ops when the ref callback receives null", () => {
    const onRef = vi.fn();
    function Capture({ report }: { report: (cb: WcRefCallback) => void }) {
      const ref = useWcRef<TestEventMap>({ loaded: vi.fn() });
      useEffect(() => report(ref), [ref, report]);
      return null;
    }
    render(<Capture report={onRef} />);
    const captured = onRef.mock.calls[0][0] as WcRefCallback;
    expect(() => captured(null)).not.toThrow();
  });
});
