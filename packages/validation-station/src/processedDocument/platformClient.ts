import type { UiPath } from "@uipath/uipath-typescript/core";
import { Traces } from "@uipath/uipath-typescript/traces";
import { joinDeploymentUrl } from "../urlUtil.js";
import { PlatformCallError } from "./errors.js";
import type {
  ArtifactRef,
  FeedbackAnchor,
  FeedbackRecord,
  FeedbackWrite,
  TraceSpan,
} from "./types.js";

const FOLDER_KEY_HEADER = "x-uipath-folderkey";
const LLM_OPS_SERVICE = "llmopstenant_";
const ECS_SERVICE = "ecs_";
const IDP_EXTRACTION_FEEDBACK_TYPE = "idpExtraction";

/** The trace a call is about, and the folder it is authorized in. */
type CallScope = Pick<FeedbackAnchor, "traceId" | "folderKey">;

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
    // Not the value itself: a failed load's message goes to telemetry.
    throw new Error(`Refusing an unexpected ${what}`);
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
 * The Traces, ECS and Feedback calls a `ProcessedDocument` needs, all on public
 * routes, so they work with an external-app token (e.g. a coded action app's).
 * Spans come through the SDK's Traces service. The ECS and Feedback calls are
 * made directly with the SDK's token: the SDK has no ECS bucket service, and
 * its Feedback service cannot set the `feedbackType` a review needs.
 */
export function createPlatformClient(sdk: UiPath) {
  const serviceUrl = (service: string, endpoint: string) => {
    const { baseUrl, orgName, tenantName } = sdk.config;
    return [orgName, tenantName, service, endpoint].reduce(
      joinDeploymentUrl,
      baseUrl,
    );
  };

  // A host-delegated token (e.g. Action Center's) is only fetched, and
  // refreshed, by the SDK's own service calls: `getToken()` is undefined before
  // the first one and again once the token expires. A one-span read of the
  // trace is the cheapest such call the Flow path is already scoped for.
  // Replace with an async token getter if the SDK exposes one.
  const ensureToken = async (traceId: string): Promise<string> => {
    const loaded = sdk.getToken();
    if (loaded) return loaded;
    await new Traces(sdk).getById(traceId, { pageSize: 1 });
    const fetched = sdk.getToken();
    if (!fetched) {
      throw new Error("The SDK is not authenticated.");
    }
    return fetched;
  };

  const send = async (
    operation: string,
    url: string,
    scope: CallScope,
    init: { method?: "GET" | "POST"; body?: unknown } = {},
  ): Promise<Response> => {
    const token = await ensureToken(scope.traceId);
    const method = init.method ?? "GET";
    const response = await fetch(url, {
      method,
      headers: {
        Authorization: `Bearer ${token}`,
        [FOLDER_KEY_HEADER]: scope.folderKey,
        ...(init.body === undefined
          ? {}
          : { "Content-Type": "application/json" }),
      },
      body: init.body === undefined ? undefined : JSON.stringify(init.body),
    });
    if (!response.ok) {
      // The service's message tells a rejected payload apart from a missing
      // permission; it travels on `detail`, short, and never in the message.
      const detail = (await response.text().catch(() => "")).slice(0, 300);
      throw new PlatformCallError(operation, response.status, detail);
    }
    return response;
  };

  const getJson = async <T>(
    operation: string,
    url: string,
    scope: CallScope,
  ): Promise<T> => (await send(operation, url, scope)).json() as Promise<T>;

  const postJson = async <T>(
    operation: string,
    url: string,
    scope: CallScope,
    body: unknown,
  ): Promise<T> =>
    (
      await send(operation, url, scope, { method: "POST", body })
    ).json() as Promise<T>;

  return {
    getSpans: async (traceId: string): Promise<TraceSpan[]> =>
      (await new Traces(sdk).getById(traceId)).map((span) => ({
        id: span.id,
        spanType: span.spanType,
        attributes: span.attributes,
        attachments:
          span.attachments?.map((a) => ({ id: a.id, fileName: a.fileName })) ??
          null,
      })),

    getEcsReadUri: async (
      ref: ArtifactRef,
      scope: CallScope,
    ): Promise<string> => {
      // An OData string literal: `'` doubles, then the path's own slashes are
      // encoded so they do not read as further route segments.
      const path = encodeURIComponent(ref.fileName.replace(/'/g, "''"));
      const bucketId = pathSegment(ref.bucketId, "bucket id");
      const endpoint = `v2.0/Buckets/${bucketId}/GetReadUri(path='${path}')`;
      const { uri } = await getJson<{ uri: string }>(
        "Reading an artifact's link",
        serviceUrl(ECS_SERVICE, endpoint),
        scope,
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
        "Looking up the saved review",
        `${serviceUrl(LLM_OPS_SERVICE, "api/Feedback")}?${params}`,
        anchor,
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
        "Creating the review",
        serviceUrl(LLM_OPS_SERVICE, "api/Feedback"),
        anchor,
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
        "Editing the review",
        serviceUrl(
          LLM_OPS_SERVICE,
          `api/Feedback/${pathSegment(id, "feedback id")}`,
        ),
        anchor,
        feedbackBody(write),
      );
      return response.id;
    },
  };
}
