import type { UiPath } from "@uipath/uipath-typescript/core";
import { joinDeploymentUrl } from "../urlUtil.js";

const FOLDER_KEY_HEADER = "x-uipath-folderkey";
const LLM_OPS_SERVICE = "llmopstenant_";
const ECS_SERVICE = "ecs_";
const IDP_EXTRACTION_FEEDBACK_TYPE = "idpExtraction";

export interface TraceSpanAttachment {
  /** The ECS bucket id. */
  Id: string;
  /** The path inside the bucket. */
  FileName: string;
}

export interface TraceSpan {
  Id: string;
  SpanType: string | null;
  /** A JSON *string*, not an object. */
  Attributes: string | null;
  Attachments: TraceSpanAttachment[] | null;
}

export interface ArtifactRef {
  bucketId: string;
  fileName: string;
}

export interface FeedbackAnchor {
  traceId: string;
  spanId: string;
  folderKey: string;
}

/** An edit replaces the whole record, so an absent field is sent as `null`. */
export interface FeedbackWrite {
  isPositive: boolean;
  /** The validated result, serialized. */
  metadata?: string;
  comment?: string;
}

export interface FeedbackRecord {
  id: string;
  metadata?: string;
}

interface FeedbackListItem {
  id: string;
  metadata: string | null;
  createdAt: string;
}

// Newest by timestamp rather than by position: the list's order is not part of the contract.
const newest = (records: FeedbackListItem[]): FeedbackListItem | undefined =>
  records.reduce<FeedbackListItem | undefined>(
    (latest, record) =>
      !latest || Date.parse(record.createdAt) > Date.parse(latest.createdAt)
        ? record
        : latest,
    undefined,
  );

// Ids from service responses go into URL paths, where encoding alone would
// still let a bare `..` segment through.
const pathSegment = (value: string, what: string): string => {
  if (!/^[A-Za-z0-9_-]+$/.test(value)) {
    throw new Error(`Refusing an unexpected ${what}: ${JSON.stringify(value)}`);
  }
  return value;
};

const feedbackBody = (write: FeedbackWrite) => ({
  feedbackType: IDP_EXTRACTION_FEEDBACK_TYPE,
  isPositive: write.isPositive,
  metadata: write.metadata ?? null,
  comment: write.comment ?? null,
});

export type PlatformClient = ReturnType<typeof createPlatformClient>;

/**
 * The Traces, ECS and Feedback calls a `ProcessedDocument` needs, made directly
 * with the SDK's token: the SDK has no ECS bucket service, and its Traces /
 * Feedback services address different endpoints.
 */
export function createPlatformClient(sdk: UiPath) {
  const serviceUrl = (service: string, endpoint: string) => {
    const { baseUrl, orgName, tenantName } = sdk.config;
    return [orgName, tenantName, service, endpoint].reduce(
      joinDeploymentUrl,
      baseUrl,
    );
  };

  const send = async (
    url: string,
    folderKey: string,
    init: { method?: "GET" | "POST"; body?: unknown } = {},
  ): Promise<Response> => {
    const token = sdk.getToken();
    if (!token) {
      throw new Error("The SDK is not authenticated.");
    }
    const method = init.method ?? "GET";
    const response = await fetch(url, {
      method,
      headers: {
        Authorization: `Bearer ${token}`,
        [FOLDER_KEY_HEADER]: folderKey,
        ...(init.body === undefined
          ? {}
          : { "Content-Type": "application/json" }),
      },
      body: init.body === undefined ? undefined : JSON.stringify(init.body),
    });
    if (!response.ok) {
      throw new Error(`${method} ${url} failed with status ${response.status}`);
    }
    return response;
  };

  const getJson = async <T>(url: string, folderKey: string): Promise<T> =>
    (await send(url, folderKey)).json() as Promise<T>;

  const postJson = async <T>(
    url: string,
    folderKey: string,
    body: unknown,
  ): Promise<T> =>
    (await send(url, folderKey, { method: "POST", body })).json() as Promise<T>;

  return {
    getSpans: (traceId: string, folderKey: string): Promise<TraceSpan[]> =>
      getJson(
        `${serviceUrl(LLM_OPS_SERVICE, "api/traces/v2/spans")}?${new URLSearchParams({ traceId })}`,
        folderKey,
      ),

    getEcsReadUri: async (
      ref: ArtifactRef,
      folderKey: string,
    ): Promise<string> => {
      // An OData string literal: `'` doubles, then the path's own slashes are
      // encoded so they do not read as further route segments.
      const path = encodeURIComponent(ref.fileName.replace(/'/g, "''"));
      const bucketId = pathSegment(ref.bucketId, "bucket id");
      const endpoint = `v2.0/Buckets/${bucketId}/GetReadUri(path='${path}')`;
      const { uri } = await getJson<{ uri: string }>(
        serviceUrl(ECS_SERVICE, endpoint),
        folderKey,
      );
      return uri;
    },

    // Pre-signed: no token goes to the storage host.
    readBytes: async (uri: string): Promise<ArrayBuffer> => {
      const response = await fetch(uri);
      if (!response.ok) {
        throw new Error(
          `Reading an artifact failed with status ${response.status}`,
        );
      }
      return response.arrayBuffer();
    },

    findFeedback: async (
      anchor: FeedbackAnchor,
    ): Promise<FeedbackRecord | null> => {
      const params = new URLSearchParams({
        traceId: anchor.traceId,
        spanId: anchor.spanId,
        folderKey: anchor.folderKey,
        feedbackType: IDP_EXTRACTION_FEEDBACK_TYPE,
      });
      const records = await getJson<FeedbackListItem[]>(
        `${serviceUrl(LLM_OPS_SERVICE, "api/Feedback")}?${params}`,
        anchor.folderKey,
      );
      const record = newest(records);
      return record
        ? { id: record.id, metadata: record.metadata ?? undefined }
        : null;
    },

    createFeedback: async (
      anchor: FeedbackAnchor,
      write: FeedbackWrite,
    ): Promise<string> => {
      const { id } = await postJson<{ id: string }>(
        serviceUrl(LLM_OPS_SERVICE, "api/Feedback/v3/feedback"),
        anchor.folderKey,
        {
          traceId: anchor.traceId,
          spanId: anchor.spanId,
          ...feedbackBody(write),
        },
      );
      return id;
    },

    editFeedback: async (
      anchor: FeedbackAnchor,
      id: string,
      write: FeedbackWrite,
    ): Promise<string> => {
      const response = await postJson<{ id: string }>(
        serviceUrl(
          LLM_OPS_SERVICE,
          `api/Feedback/${pathSegment(id, "feedback id")}`,
        ),
        anchor.folderKey,
        feedbackBody(write),
      );
      return response.id;
    },
  };
}
