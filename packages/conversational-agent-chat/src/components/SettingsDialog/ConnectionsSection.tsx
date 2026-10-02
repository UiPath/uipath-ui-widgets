import {
  Alert,
  AlertDescription,
  Badge,
  Button,
  Input,
  Spinner,
  cn,
} from "@uipath/apollo-wind";
import type { ConversationalAgent } from "@uipath/uipath-typescript/conversational-agent";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useWidgetTranslation } from "../../i18n/useWidgetTranslation";

export interface ConnectionsSectionProps {
  conversationalAgent: ConversationalAgent;
  agentId: number;
  folderId: number;
}

/**
 * Mirror of SDK types — defined locally so the component compiles against the
 * currently-installed SDK (1.5.x) while the new methods land in 1.8+. Once the
 * SDK is bumped these can be replaced with direct imports.
 */
interface AvailableConnection {
  id: string;
  name: string;
  state: "Enabled" | "Disabled" | "Expired" | "Failed";
  isDefault: boolean;
  personalWorkspace: boolean;
  folderKey: string | null;
  folderName: string | null;
}

interface AvailableConnectionsItem {
  connectorKey: string;
  connectorName?: string;
  connectorImage?: string;
  resourceKeys: string[];
  currentConnectionId: string | null;
  currentConnectionName: string | null;
  configurationUrl?: string;
  connectionsUrl?: string;
  isConfigurable?: boolean;
  connections: AvailableConnection[];
}

type AvailableConnectionsResponse = AvailableConnectionsItem[];

interface ConnectionSelection {
  connectorKey: string;
  connectionId: string | null;
}

const POLL_INTERVAL_MS = 500;

const STATUS_VARIANT: Record<
  string,
  "default" | "secondary" | "destructive" | "outline"
> = {
  Enabled: "default",
  Disabled: "secondary",
  Expired: "outline",
  Failed: "destructive",
};

const STATUS_LABEL: Record<string, string> = {
  Enabled: "connections_status_connected",
  Expired: "connections_status_expired",
  Disabled: "connections_status_disabled",
  Failed: "connections_status_failed",
};

/**
 * Casts the ConversationalAgent to access connection methods that are pending in the SDK.
 *
 * TODO(sdk-typing): Remove this cast and hardcoded state strings once @uipath/uipath-typescript
 * exposes connection methods and types (getAvailableConnections, getConnectionAuthUrl,
 * getConnectionSessionStatus, updateConnectionSelections, connection state enum) on
 * ConversationalAgent.
 */
const asConnections = (ca: ConversationalAgent) =>
  ca as unknown as {
    getAvailableConnections(
      agentId: number,
      folderId: number,
    ): Promise<AvailableConnectionsResponse>;
    updateConnectionSelections(
      agentId: number,
      folderId: number,
      payload: { selections: ConnectionSelection[] },
    ): Promise<AvailableConnectionsResponse>;
    getConnectionAuthUrl(connectorKey: string): Promise<{
      authUrl: string;
      sessionId: string;
      expiresTime: number;
    }>;
    getConnectionSessionStatus(sessionId: string): Promise<{
      status: "pending" | "success" | "failed";
      connectionId: string | null;
      expiresTime: number;
    }>;
  };

const getInitialSelections = (
  items: AvailableConnectionsResponse,
): Record<string, string | null> =>
  Object.fromEntries(
    items.map((item) => [item.connectorKey, item.currentConnectionId ?? ""]),
  );

export const ConnectionsSection = ({
  conversationalAgent,
  agentId,
  folderId,
}: ConnectionsSectionProps) => {
  const { t } = useWidgetTranslation();
  const api = asConnections(conversationalAgent);

  const [items, setItems] = useState<AvailableConnectionsResponse>([]);
  const [initialSelections, setInitialSelections] = useState<
    Record<string, string | null>
  >({});
  const [stagedSelections, setStagedSelections] = useState<
    Record<string, string | null>
  >({});
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveResult, setSaveResult] = useState<"success" | "error" | null>(
    null,
  );
  const [saveError, setSaveError] = useState<string | null>(null);

  const [openPicker, setOpenPicker] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [connectingKey, setConnectingKey] = useState<string | null>(null);
  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const pollInFlightRef = useRef(false);
  const fetchingRef = useRef(false);
  const oauthSessionRef = useRef(0);

  const clearPoll = useCallback(() => {
    if (pollingRef.current) {
      clearInterval(pollingRef.current);
      pollingRef.current = null;
    }
    pollInFlightRef.current = false;
  }, []);

  const loadConnections = useCallback(async () => {
    try {
      const data = await api.getAvailableConnections(agentId, folderId);
      const sels = getInitialSelections(data);
      setItems(data);
      setInitialSelections(sels);
      setStagedSelections(sels);
    } catch (err) {
      setLoadError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  }, [api, agentId, folderId]);

  useEffect(() => {
    loadConnections();
  }, [loadConnections]);

  // Refresh on tab visibility change
  useEffect(() => {
    const handler = () => {
      if (document.visibilityState !== "visible") return;
      if (fetchingRef.current || pollInFlightRef.current) return;
      fetchingRef.current = true;
      api
        .getAvailableConnections(agentId, folderId)
        .then((data) => {
          setItems(data);
          const sels = getInitialSelections(data);
          setInitialSelections(sels);
          setStagedSelections(sels);
        })
        .catch(() => {})
        .finally(() => {
          fetchingRef.current = false;
        });
    };
    document.addEventListener("visibilitychange", handler);
    return () => document.removeEventListener("visibilitychange", handler);
  }, [api, agentId, folderId]);

  useEffect(() => () => clearPoll(), [clearPoll]);

  const isDirty = useMemo(
    () =>
      Object.keys(initialSelections).some(
        (key) => initialSelections[key] !== stagedSelections[key],
      ),
    [initialSelections, stagedSelections],
  );

  const handleSelect = (connectorKey: string, connectionId: string) => {
    setStagedSelections((prev) => ({ ...prev, [connectorKey]: connectionId }));
    setOpenPicker(null);
    setSearchQuery("");
    setSaveResult(null);
  };

  const handleClear = (connectorKey: string) => {
    setStagedSelections((prev) => ({ ...prev, [connectorKey]: null }));
    setOpenPicker(null);
    setSaveResult(null);
  };

  const handleSave = async () => {
    setSaving(true);
    setSaveResult(null);
    setSaveError(null);
    try {
      const updated = await api.updateConnectionSelections(agentId, folderId, {
        selections: Object.entries(stagedSelections)
          .filter(([, v]) => v !== "")
          .map(([connectorKey, connectionId]) => ({
            connectorKey,
            connectionId,
          })),
      });
      const sels = getInitialSelections(updated);
      setItems(updated);
      setInitialSelections(sels);
      setStagedSelections(sels);
      setSaveResult("success");
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : String(err));
      setSaveResult("error");
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setStagedSelections(initialSelections);
    setSaveResult(null);
  };

  const startOAuthConnect = async (connectorKey: string) => {
    clearPoll();
    const oauthSession = ++oauthSessionRef.current;

    try {
      const { authUrl, sessionId, expiresTime } =
        await api.getConnectionAuthUrl(connectorKey);

      // Stale — a newer OAuth connection started while we awaited the auth URL
      if (oauthSessionRef.current !== oauthSession) return;

      window.open(authUrl, "_blank", "noopener,noreferrer");
      setConnectingKey(connectorKey);

      pollingRef.current = setInterval(async () => {
        if (oauthSessionRef.current !== oauthSession) return;
        if (pollInFlightRef.current) return;
        pollInFlightRef.current = true;
        try {
          if (Date.now() > expiresTime) {
            clearPoll();
            if (oauthSessionRef.current === oauthSession)
              setConnectingKey(null);
            return;
          }
          const status = await api.getConnectionSessionStatus(sessionId);
          if (oauthSessionRef.current !== oauthSession) return;

          if (status.status === "success" && status.connectionId) {
            clearPoll();
            setConnectingKey(null);
            // Auto-save the new connection
            try {
              const updated = await api.updateConnectionSelections(
                agentId,
                folderId,
                {
                  selections: [
                    { connectorKey, connectionId: status.connectionId },
                  ],
                },
              );
              if (oauthSessionRef.current === oauthSession) {
                const sels = getInitialSelections(updated);
                setItems(updated);
                setInitialSelections(sels);
                setStagedSelections(sels);
              }
            } catch {
              // Fallback: at least update the local selection
              if (oauthSessionRef.current === oauthSession) {
                setStagedSelections((prev) => ({
                  ...prev,
                  [connectorKey]: status.connectionId,
                }));
              }
            }
            setOpenPicker(null);
            setSearchQuery("");
          } else if (status.status === "failed") {
            clearPoll();
            if (oauthSessionRef.current === oauthSession)
              setConnectingKey(null);
          }
        } catch {
          clearPoll();
          if (oauthSessionRef.current === oauthSession) setConnectingKey(null);
        } finally {
          pollInFlightRef.current = false;
        }
      }, POLL_INTERVAL_MS);
    } catch {
      // Auth URL failed — fall back to connectionsUrl
      if (oauthSessionRef.current === oauthSession) {
        const item = items.find((i) => i.connectorKey === connectorKey);
        const fallback = item?.connectionsUrl ?? item?.configurationUrl;
        if (fallback) window.open(fallback, "_blank", "noopener,noreferrer");
      }
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-6">
        <Spinner size="sm" />
      </div>
    );
  }

  if (loadError) {
    return (
      <Alert variant="destructive">
        <AlertDescription>
          {t("connections_load_error", { errorMessage: loadError })}
        </AlertDescription>
      </Alert>
    );
  }

  if (items.length === 0) {
    return (
      <p className="py-4 text-center text-sm text-muted-foreground">
        {t("connections_no_configurable")}
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {items.map((item) => {
        const selectedId = stagedSelections[item.connectorKey];
        const selectedConn = item.connections.find((c) => c.id === selectedId);
        const isConfigurable = item.isConfigurable !== false;
        const hasSelection = selectedId && selectedId !== "";
        const isPickerOpen = openPicker === item.connectorKey;
        const isThisConnecting = connectingKey === item.connectorKey;

        return (
          <div key={item.connectorKey} className="border-b border-border py-3">
            {/* Row 1: Connector icon + name */}
            <div className="mb-1.5 flex items-center gap-2">
              {item.connectorImage && (
                <img
                  src={item.connectorImage}
                  alt=""
                  className="h-[18px] w-[18px] shrink-0 object-contain"
                />
              )}
              <span className="text-sm font-semibold">
                {item.connectorName ?? item.connectorKey}
              </span>
            </div>

            {/* Row 2: Selection + status + clear */}
            <div className="flex items-center gap-2">
              <div className="min-w-0 flex-1 truncate">
                {isConfigurable ? (
                  <button
                    type="button"
                    onClick={() => {
                      if (isThisConnecting) return;
                      if (hasSelection || item.connections.length > 0) {
                        setOpenPicker(isPickerOpen ? null : item.connectorKey);
                        setSearchQuery("");
                      } else {
                        startOAuthConnect(item.connectorKey);
                      }
                    }}
                    className={
                      hasSelection
                        ? "inline-flex items-center gap-1 text-sm hover:opacity-80"
                        : "text-sm font-semibold text-primary hover:underline"
                    }
                    disabled={isThisConnecting}
                  >
                    {isThisConnecting ? (
                      <>
                        <Spinner size="sm" className="mr-1" />
                        {t("connection_readiness_connecting")}
                      </>
                    ) : hasSelection ? (
                      <>
                        <span>
                          {selectedConn?.name ??
                            item.currentConnectionName ??
                            selectedId}
                        </span>
                        <svg
                          className="h-4 w-4 text-muted-foreground"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 9l-7 7-7-7"
                          />
                        </svg>
                      </>
                    ) : (
                      t("connections_connect")
                    )}
                  </button>
                ) : hasSelection ? (
                  <span className="text-sm">
                    {item.currentConnectionName ?? selectedId}
                  </span>
                ) : (
                  <span className="text-sm text-muted-foreground">
                    {t("connections_not_configured")}
                  </span>
                )}
              </div>

              {/* Status badge */}
              {selectedConn && (
                <Badge
                  variant={STATUS_VARIANT[selectedConn.state] ?? "secondary"}
                >
                  {/* Possible keys: "connections_status_connected" | "connections_status_expired" | "connections_status_disabled" | "connections_status_failed" */}
                  {/* eslint-disable-next-line no-restricted-syntax */}
                  {t(
                    (STATUS_LABEL[selectedConn.state] ??
                      "connections_status_disabled") as Parameters<typeof t>[0],
                  )}
                </Badge>
              )}
              {!selectedConn && isConfigurable && hasSelection && (
                <Badge variant="destructive">
                  {t("connections_status_unavailable")}
                </Badge>
              )}

              {/* Clear button */}
              {hasSelection && isConfigurable && (
                <button
                  type="button"
                  aria-label={t("connections_clear")}
                  onClick={() => handleClear(item.connectorKey)}
                  className="shrink-0 rounded p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
                >
                  <svg
                    className="h-4 w-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              )}
            </div>

            {/* Inline picker */}
            {isPickerOpen && isConfigurable && (
              <div className="mt-2 rounded-md border bg-background shadow-md">
                {/* Search + add */}
                <div className="flex items-center gap-2 border-b p-2">
                  <Input
                    placeholder={t("connections_search_placeholder")}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="h-7 text-sm"
                    autoFocus
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setOpenPicker(null);
                      setSearchQuery("");
                      startOAuthConnect(item.connectorKey);
                    }}
                    className="shrink-0 text-xs text-primary hover:underline"
                  >
                    {t("connections_add_connection")}
                  </button>
                </div>

                {/* Grouped options */}
                <div className="max-h-48 overflow-y-auto">
                  {(() => {
                    const query = searchQuery.trim().toLowerCase();
                    const grouped = item.connections.reduce<
                      Record<string, AvailableConnection[]>
                    >((groups, conn) => {
                      const groupName = conn.personalWorkspace
                        ? t("connections_personal_workspace")
                        : (conn.folderName ?? t("connections_unknown_folder"));
                      if (
                        query &&
                        !conn.name.toLowerCase().includes(query) &&
                        !groupName.toLowerCase().includes(query)
                      ) {
                        return groups;
                      }
                      groups[groupName] = groups[groupName] ?? [];
                      groups[groupName].push(conn);
                      return groups;
                    }, {});
                    const groupNames = Object.keys(grouped);

                    if (groupNames.length === 0) {
                      return (
                        <p className="p-3 text-sm text-muted-foreground">
                          {t("connections_no_configurable")}
                        </p>
                      );
                    }
                    return groupNames.map((groupName) => (
                      <div key={groupName}>
                        <p className="px-3 pb-1 pt-2.5 text-xs text-muted-foreground">
                          {groupName}
                        </p>
                        {grouped[groupName].map((conn) => (
                          <button
                            key={conn.id}
                            type="button"
                            onClick={() =>
                              handleSelect(item.connectorKey, conn.id)
                            }
                            className={cn(
                              "flex w-full items-center gap-2 px-3 py-1.5 text-left text-sm hover:bg-muted",
                              conn.id === selectedId && "bg-muted",
                            )}
                          >
                            <span className="flex-1 truncate">{conn.name}</span>
                          </button>
                        ))}
                      </div>
                    ));
                  })()}
                </div>

                {/* Footer link */}
                {(item.connectionsUrl ?? item.configurationUrl) && (
                  <button
                    type="button"
                    onClick={() =>
                      window.open(
                        item.connectionsUrl ?? item.configurationUrl,
                        "_blank",
                        "noopener,noreferrer",
                      )
                    }
                    className="w-full border-t p-2.5 text-center text-sm hover:bg-muted"
                  >
                    {t("connections_open_connections")}
                  </button>
                )}
              </div>
            )}
          </div>
        );
      })}

      {/* Save result alerts */}
      {saveResult === "success" && (
        <Alert>
          <AlertDescription>{t("connections_save_success")}</AlertDescription>
        </Alert>
      )}
      {saveResult === "error" && (
        <Alert variant="destructive">
          <AlertDescription>
            {t("connections_save_error", { errorMessage: saveError })}
          </AlertDescription>
        </Alert>
      )}

      {/* Save / Cancel */}
      <div className="flex gap-2">
        <Button onClick={handleSave} disabled={!isDirty || saving}>
          {saving && <Spinner size="sm" className="mr-2" />}
          {saving
            ? t("applying_changes_button_label")
            : t("apply_changes_button_label")}
        </Button>
        <Button
          variant="outline"
          onClick={handleCancel}
          disabled={!isDirty || saving}
        >
          {t("connections_cancel")}
        </Button>
      </div>
    </div>
  );
};
