import { UiPath } from "@uipath/uipath-typescript/core";
import {
  type AgentGetByIdResponse,
  ConversationalAgent,
} from "@uipath/uipath-typescript/conversational-agent";

/**
 * Promise cache for `agent.getById` keyed by SDK instance + externalUserId +
 * agentId + folderId + surfaceName + surfaceVersion. Both the widget's
 * internal `resolveAgent` and the exported `useResolvedAgent` hook funnel
 * through here so a single mount that uses both only triggers one network
 * fetch. Surface fields are part of the key so a hook caller that omits them
 * cannot poison the widget's surfaced entry (every trace would otherwise
 * report `unknown`).
 *
 * The cached `AgentGetByIdResponse` has its `conversations` methods bound to
 * the service this cache created, so any downstream use of those methods
 * carries the matching externalUserId/surface telemetry headers.
 */

export interface AgentCacheServiceOptions {
  externalUserId?: string;
  surfaceName?: string;
  surfaceVersion?: string;
}

type Bucket = Map<string, Promise<AgentGetByIdResponse | null>>;
const cache = new WeakMap<UiPath, Bucket>();

const cacheKey = (
  agentId: number,
  folderId: number | undefined,
  externalUserId: string | undefined,
  surfaceName: string | undefined,
  surfaceVersion: string | undefined,
) =>
  `${externalUserId ?? "_"}|${agentId}|${folderId ?? "any"}|${surfaceName ?? "_"}|${surfaceVersion ?? "_"}`;

export const resolveAgentCached = (
  sdk: UiPath,
  agentId: number,
  folderId: number | undefined,
  serviceOptions: AgentCacheServiceOptions = {},
): Promise<AgentGetByIdResponse | null> => {
  let bucket = cache.get(sdk);
  if (!bucket) {
    bucket = new Map();
    cache.set(sdk, bucket);
  }
  const key = cacheKey(
    agentId,
    folderId,
    serviceOptions.externalUserId,
    serviceOptions.surfaceName,
    serviceOptions.surfaceVersion,
  );
  const existing = bucket.get(key);
  if (existing) return existing;

  const ctorOptions = {
    ...(serviceOptions.externalUserId
      ? { externalUserId: serviceOptions.externalUserId }
      : {}),
    ...(serviceOptions.surfaceName !== undefined
      ? { surfaceName: serviceOptions.surfaceName }
      : {}),
    ...(serviceOptions.surfaceVersion !== undefined
      ? { surfaceVersion: serviceOptions.surfaceVersion }
      : {}),
  };
  const service = new ConversationalAgent(
    sdk,
    Object.keys(ctorOptions).length > 0 ? ctorOptions : undefined,
  );
  const promise = (async () => {
    if (folderId != null) {
      return service.getById(agentId, folderId);
    }
    const found = (await service.getAll()).find((a) => a.id === agentId);
    if (!found) return null;
    return service.getById(found.id, found.folderId);
  })();
  // Evict failed entries so a retry refetches instead of returning the
  // rejected promise forever.
  promise.catch(() => bucket?.delete(key));
  bucket.set(key, promise);
  return promise;
};
