import { UiPath } from "@uipath/uipath-typescript/core";
import {
  type AgentGetByIdResponse,
  ConversationalAgent,
} from "@uipath/uipath-typescript/conversational-agent";

/**
 * Resolves a deployed agent release by id. When `folderId` is omitted, falls
 * back to listing agents and matching on id.
 *
 * The service is constructed with the given externalUserId/surface options so
 * the returned agent's `conversations` methods carry the matching
 * externalUserId/surface telemetry headers.
 */
export interface ResolveAgentOptions {
  externalUserId?: string;
  surfaceName?: string;
  surfaceVersion?: string;
}

export const resolveAgent = (
  sdk: UiPath,
  agentId: number,
  folderId: number | undefined,
  options: ResolveAgentOptions = {},
): Promise<AgentGetByIdResponse | null> => {
  const ctorOptions = {
    ...(options.externalUserId
      ? { externalUserId: options.externalUserId }
      : {}),
    ...(options.surfaceName !== undefined
      ? { surfaceName: options.surfaceName }
      : {}),
    ...(options.surfaceVersion !== undefined
      ? { surfaceVersion: options.surfaceVersion }
      : {}),
  };
  const service = new ConversationalAgent(
    sdk,
    Object.keys(ctorOptions).length > 0 ? ctorOptions : undefined,
  );
  if (folderId != null) {
    return service.getById(agentId, folderId);
  }
  return (async () => {
    const found = (await service.getAll()).find((a) => a.id === agentId);
    if (!found) return null;
    return service.getById(found.id, found.folderId);
  })();
};
