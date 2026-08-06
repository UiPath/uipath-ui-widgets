import { describe, it, expect, vi, beforeEach } from "vitest";
import { trackTelemetry } from "../utils/telemetryUtils.js";
import { version } from "../../package.json";
import { TelemetryEvent, TelemetryStatus } from "../types.js";

const mockTrack = vi.fn();
vi.mock("@uipath/uipath-typescript/core", () => ({
  trackEvent: (...args: unknown[]) => mockTrack(...args),
}));

describe("telemetryUtils", () => {
  beforeEach(() => {
    mockTrack.mockClear();
  });

  describe("trackTelemetry", () => {
    it("should call trackEvent with ApplicationName and WidgetVersion", () => {
      trackTelemetry(TelemetryEvent.Load, TelemetryStatus.Success);

      expect(mockTrack).toHaveBeenCalledTimes(1);
      expect(mockTrack).toHaveBeenCalledWith(
        TelemetryEvent.Load,
        TelemetryStatus.Success,
        {
          ApplicationName: "Widget.ValidationStation",
          WidgetVersion: version,
        },
      );
    });

    it("should merge additional properties into the payload", () => {
      trackTelemetry(TelemetryEvent.Load, TelemetryStatus.Error, {
        error: "boom",
      });

      expect(mockTrack).toHaveBeenCalledWith(
        TelemetryEvent.Load,
        TelemetryStatus.Error,
        {
          ApplicationName: "Widget.ValidationStation",
          WidgetVersion: version,
          error: "boom",
        },
      );
    });

    it("should pass through Submit and ExceptionRequest events", () => {
      trackTelemetry(TelemetryEvent.Submit, TelemetryStatus.Error);
      trackTelemetry(TelemetryEvent.ExceptionRequest, TelemetryStatus.Success);

      expect(mockTrack).toHaveBeenNthCalledWith(
        1,
        TelemetryEvent.Submit,
        TelemetryStatus.Error,
        {
          ApplicationName: "Widget.ValidationStation",
          WidgetVersion: version,
        },
      );
      expect(mockTrack).toHaveBeenNthCalledWith(
        2,
        TelemetryEvent.ExceptionRequest,
        TelemetryStatus.Success,
        {
          ApplicationName: "Widget.ValidationStation",
          WidgetVersion: version,
        },
      );
    });
  });

  describe("version", () => {
    it("should export a non-empty semver-like string", () => {
      expect(typeof version).toBe("string");
      expect(version).toMatch(/^\d+\.\d+\.\d+/);
    });
  });
});
