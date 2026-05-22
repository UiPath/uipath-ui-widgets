import { useEffect, useState } from "react";
import i18next from "i18next";
import { useTranslation } from "react-i18next";
import { UiPath } from "@uipath/uipath-typescript/core";
import type { AgentSummary, Locale } from "../types";
import { resolveAgentCached } from "../utils/agentCache";
import { initI18n } from "../i18n";

// Idempotent. Ensures i18next is initialized when the hook is imported
// without first mounting the widget.
initI18n();

export interface UseResolvedAgentOptions {
  /** Pass the same `externalUserId` you give the widget so they share one
   * fetch. Omit for first-party hosts that don't use external-user auth. */
  externalUserId?: string;
  /** Locale used for `displayName`'s loading label. Defaults to the
   * currently active i18next language (set by the widget if mounted). */
  locale?: Locale;
  /** Pass the same `surfaceName`/`surfaceVersion` you give the widget so the
   * shared `getById` fetch carries surface telemetry headers. Without these,
   * a hook caller that wins the cache race poisons the entry with an
   * unsurfaced fetch and the widget's traces show `unknown`. */
  surfaceName?: string;
  surfaceVersion?: string;
}

export interface UseResolvedAgentResult {
  agent: AgentSummary | null;
  isLoading: boolean;
  error: Error | null;
  /** Label suitable for display in a breadcrumb or title. The agent's
   * resolved name when available; otherwise a translated "Loading..."
   * (also used while errored — surface errors via `error`). Always a
   * non-empty string, so hosts don't need a numeric ID fallback. */
  displayName: string;
}

/**
 * Resolves the deployed agent release matching `agentId` and returns its
 * summary (name, version, folder, etc.). Pass `folderId` when known to avoid
 * the fallback `getAll()` listing.
 *
 * Returns `{ agent: null, isLoading: true }` while in flight; subsequent
 * `agentId`/`folderId` changes refetch. Shares an in-flight fetch with the
 * widget when both are mounted with the same `(sdk, externalUserId, agentId,
 * folderId, surfaceName, surfaceVersion)`.
 */
export const useResolvedAgent = (
  sdk: UiPath | null | undefined,
  agentId: number | undefined,
  folderId?: number,
  options: UseResolvedAgentOptions = {},
): UseResolvedAgentResult => {
  const { externalUserId, locale, surfaceName, surfaceVersion } = options;

  // Match locale before useTranslation runs to avoid a stale render.
  if (locale && i18next.language !== locale) {
    i18next.changeLanguage(locale);
  }
  const { t } = useTranslation();

  const shouldFetch = !!sdk && agentId != null;
  const inputsKey = `${sdk ? "sdk" : "_"}|${agentId ?? "_"}|${folderId ?? "_"}|${externalUserId ?? "_"}|${surfaceName ?? "_"}|${surfaceVersion ?? "_"}`;

  // Reset on input change via the "storing information from previous renders"
  // pattern (https://react.dev/reference/react/useState#storing-information-from-previous-renders)
  // — avoids cascading renders from setState-in-effect.
  const [prevInputsKey, setPrevInputsKey] = useState(inputsKey);
  const [agent, setAgent] = useState<AgentSummary | null>(null);
  const [isLoading, setIsLoading] = useState(shouldFetch);
  const [error, setError] = useState<Error | null>(null);
  if (prevInputsKey !== inputsKey) {
    setPrevInputsKey(inputsKey);
    setAgent(null);
    setIsLoading(shouldFetch);
    setError(null);
  }

  useEffect(() => {
    if (!shouldFetch) return;
    let cancelled = false;

    resolveAgentCached(sdk, agentId, folderId, {
      externalUserId,
      surfaceName,
      surfaceVersion,
    })
      .then((release) => {
        if (cancelled) return;
        setAgent(
          release
            ? {
                id: release.id,
                name: release.name,
                description: release.description,
                folderId: release.folderId,
                processVersion: release.processVersion,
              }
            : null,
        );
        setIsLoading(false);
      })
      .catch((err) => {
        if (cancelled) return;
        setError(err instanceof Error ? err : new Error(String(err)));
        setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [
    shouldFetch,
    sdk,
    agentId,
    folderId,
    externalUserId,
    surfaceName,
    surfaceVersion,
  ]);

  const displayName = agent?.name ?? t("agent_loading_label");

  return { agent, isLoading, error, displayName };
};
