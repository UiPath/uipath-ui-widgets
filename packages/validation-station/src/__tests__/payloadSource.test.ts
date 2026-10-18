/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect } from "vitest";
import { selectPayload } from "../payloadSource";

const data = { DocumentId: "doc-1" } as any;
const processedDocument = { metadata: { traceId: "trace-1" } } as any;

describe("selectPayload", () => {
  it("prefers data when both payloads are set, as the web component does", () => {
    expect(selectPayload(data, processedDocument)).toEqual({ data });
  });

  it("takes the processedDocument when there is no data", () => {
    expect(selectPayload(undefined, processedDocument)).toEqual({
      processedDocument,
    });
  });

  it("selects nothing when neither is set", () => {
    expect(selectPayload(undefined, undefined)).toEqual({});
  });
});
