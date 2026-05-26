import { describe, it, expect, vi, beforeEach } from "vitest";
import { trackTelemetry } from "../utils/telemetryUtils";
import { version } from "../version";
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
      trackTelemetry(TelemetryEvent.NewChat, TelemetryStatus.Success);

      expect(mockTrack).toHaveBeenCalledTimes(1);
      expect(mockTrack).toHaveBeenCalledWith(
        TelemetryEvent.NewChat,
        TelemetryStatus.Success,
        {
          ApplicationName: "Widget.ConversationalAgentChat",
          WidgetVersion: version,
        },
      );
    });

    it("should merge additional properties into the payload", () => {
      trackTelemetry(TelemetryEvent.SendMessage, TelemetryStatus.Error, {
        errorCode: "E_TIMEOUT",
        attempt: 2,
      });

      expect(mockTrack).toHaveBeenCalledWith(
        TelemetryEvent.SendMessage,
        TelemetryStatus.Error,
        {
          ApplicationName: "Widget.ConversationalAgentChat",
          WidgetVersion: version,
          errorCode: "E_TIMEOUT",
          attempt: 2,
        },
      );
    });

    it("should pass through Error status without properties", () => {
      trackTelemetry(TelemetryEvent.Feedback, TelemetryStatus.Error);

      expect(mockTrack).toHaveBeenCalledWith(
        TelemetryEvent.Feedback,
        TelemetryStatus.Error,
        {
          ApplicationName: "Widget.ConversationalAgentChat",
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
