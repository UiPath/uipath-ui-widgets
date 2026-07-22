import { describe, it, expect, vi, beforeEach } from "vitest";
import { trackTelemetry } from "../utils/telemetryUtils";
import { version } from "../../package.json";
import { TelemetryEvent, TelemetryStatus } from "../types";

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
      trackTelemetry(TelemetryEvent.SignIn, TelemetryStatus.Success);

      expect(mockTrack).toHaveBeenCalledTimes(1);
      expect(mockTrack).toHaveBeenCalledWith(
        TelemetryEvent.SignIn,
        TelemetryStatus.Success,
        {
          ApplicationName: "Widget.ExternalAuth",
          WidgetVersion: version,
        },
      );
    });

    it("should merge additional properties into the payload", () => {
      trackTelemetry(TelemetryEvent.OAuthRedirect, TelemetryStatus.Error, {
        Error: "E_TIMEOUT",
        UsePkce: true,
      });

      expect(mockTrack).toHaveBeenCalledWith(
        TelemetryEvent.OAuthRedirect,
        TelemetryStatus.Error,
        {
          ApplicationName: "Widget.ExternalAuth",
          WidgetVersion: version,
          Error: "E_TIMEOUT",
          UsePkce: true,
        },
      );
    });

    it("should pass through Error status without properties", () => {
      trackTelemetry(TelemetryEvent.PersistState, TelemetryStatus.Error);

      expect(mockTrack).toHaveBeenCalledWith(
        TelemetryEvent.PersistState,
        TelemetryStatus.Error,
        {
          ApplicationName: "Widget.ExternalAuth",
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
