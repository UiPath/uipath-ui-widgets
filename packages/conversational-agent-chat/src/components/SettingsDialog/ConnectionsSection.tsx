import {
  Alert,
  AlertDescription,
  Badge,
  Button,
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  Popover,
  PopoverContent,
  PopoverTrigger,
  Spinner,
  cn,
} from "@uipath/apollo-wind";
import type {
  AvailableConnection,
  AvailableConnectionsResponse,
  ConversationalAgent,
} from "@uipath/uipath-typescript/conversational-agent";
import { ConnectionSessionStatus } from "@uipath/uipath-typescript/conversational-agent";
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  CONNECTION_STATUS_LABEL,
  CONNECTION_STATUS_VARIANT,
} from "../../constants/connectionStatus";
import { useWidgetTranslation } from "../../i18n/useWidgetTranslation";

export interface ConnectionsSectionProps {
  conversationalAgent: ConversationalAgent;
  agentId: number;
  folderId: number;
  /** Called after a manual save or OAuth auto-save completes successfully. */
  onConnectionsChanged?: () => void;
}

const POLL_INTERVAL_MS = 500;

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
  onConnectionsChanged,
}: ConnectionsSectionProps) => {
  const { t } = useWidgetTranslation();
  const api = conversationalAgent;

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
  const stagedSelectionsRef = useRef(stagedSelections);
  useLayoutEffect(() => {
    stagedSelectionsRef.current = stagedSelections;
  }, [stagedSelections]);

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
      setLoadError(null);
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
          setLoadError(null);
        })
        .catch(() => {})
        .finally(() => {
          fetchingRef.current = false;
        });
    };
    document.addEventListener("visibilitychange", handler);
    return () => document.removeEventListener("visibilitychange", handler);
  }, [api, agentId, folderId]);

  useEffect(() => {
    const sessionRef = oauthSessionRef;
    return () => {
      // Increment session so any in-flight OAuth requests are ignored
      ++sessionRef.current;
      clearPoll();
    };
  }, [clearPoll]);

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
    setStagedSelections((prev) => ({ ...prev, [connectorKey]: "" }));
    setOpenPicker(null);
    setSaveResult(null);
  };

  const handleSave = async () => {
    setSaving(true);
    setSaveResult(null);
    setSaveError(null);
    try {
      const configurableKeys = new Set(
        items
          .filter((i) => i.isConfigurable !== false)
          .map((i) => i.connectorKey),
      );
      const updated = await api.updateConnectionSelections(agentId, folderId, {
        selections: Object.entries(stagedSelections)
          .filter(([key]) => configurableKeys.has(key))
          .map(([connectorKey, connectionId]) => ({
            connectorKey,
            connectionId: connectionId || null,
          })),
      });
      const sels = getInitialSelections(updated);
      setItems(updated);
      setInitialSelections(sels);
      setStagedSelections(sels);
      setSaveResult("success");
      onConnectionsChanged?.();
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

          if (
            status.status === ConnectionSessionStatus.Success &&
            status.connectionId
          ) {
            clearPoll();
            // Keep connectingKey set until save completes so buttons stay
            // disabled and a second flow can't start with stale data.
            try {
              const configurableItems = items.filter(
                (i) => i.isConfigurable !== false,
              );
              const updated = await api.updateConnectionSelections(
                agentId,
                folderId,
                {
                  selections: configurableItems.map((i) => ({
                    connectorKey: i.connectorKey,
                    connectionId:
                      i.connectorKey === connectorKey
                        ? status.connectionId
                        : (stagedSelectionsRef.current[i.connectorKey] ||
                          null),
                  })),
                },
              );
              if (oauthSessionRef.current === oauthSession) {
                const sels = getInitialSelections(updated);
                setItems(updated);
                setInitialSelections(sels);
                setStagedSelections(sels);
                onConnectionsChanged?.();
              }
            } catch {
              // Fallback: at least update the local selection
              if (oauthSessionRef.current === oauthSession) {
                setStagedSelections((prev) => ({
                  ...prev,
                  [connectorKey]: status.connectionId,
                }));
              }
            } finally {
              if (oauthSessionRef.current === oauthSession) {
                setConnectingKey(null);
              }
            }
            setOpenPicker(null);
            setSearchQuery("");
          } else if (status.status === ConnectionSessionStatus.Failed) {
            clearPoll();
            if (oauthSessionRef.current === oauthSession)
              setConnectingKey(null);
          }
        } catch {
          // Transient error — keep polling until the session expires
        } finally {
          if (oauthSessionRef.current === oauthSession) {
            pollInFlightRef.current = false;
          }
        }
      }, POLL_INTERVAL_MS);
    } catch {
      // Auth URL failed — fall back to connectionsUrl
      if (oauthSessionRef.current === oauthSession) {
        setConnectingKey(null);
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
                  isThisConnecting ? (
                    <span className="inline-flex items-center text-sm">
                      <Spinner size="sm" className="mr-1" />
                      {t("connection_readiness_connecting")}
                    </span>
                  ) : hasSelection || item.connections.length > 0 ? (
                    <Popover
                      open={isPickerOpen}
                      onOpenChange={(open) => {
                        setOpenPicker(open ? item.connectorKey : null);
                        if (!open) setSearchQuery("");
                      }}
                    >
                      <PopoverTrigger asChild>
                        <button
                          type="button"
                          className={
                            hasSelection
                              ? "inline-flex items-center gap-1 text-sm hover:opacity-80"
                              : "text-sm font-semibold text-primary hover:underline"
                          }
                        >
                          {hasSelection ? (
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
                      </PopoverTrigger>
                      <PopoverContent
                        className="w-72 p-0"
                        align="start"
                        onOpenAutoFocus={(e) => e.preventDefault()}
                      >
                        <Command shouldFilter={false}>
                          <div className="flex items-center gap-2 border-b px-2">
                            <CommandInput
                              placeholder={t("connections_search_placeholder")}
                              value={searchQuery}
                              onValueChange={setSearchQuery}
                              className="h-8"
                            />
                            <Button
                              variant="link"
                              size="sm"
                              onClick={() => {
                                setOpenPicker(null);
                                setSearchQuery("");
                                startOAuthConnect(item.connectorKey);
                              }}
                              className="shrink-0 p-0 text-xs"
                            >
                              {t("connections_add_connection")}
                            </Button>
                          </div>
                          <CommandList className="max-h-48">
                            <CommandEmpty>
                              {t("connections_no_configurable")}
                            </CommandEmpty>
                            {(() => {
                              const query = searchQuery.trim().toLowerCase();
                              const grouped = item.connections.reduce<
                                Record<string, AvailableConnection[]>
                              >(
                                (groups, conn) => {
                                  const groupName = conn.personalWorkspace
                                    ? t("connections_personal_workspace")
                                    : (conn.folderName ??
                                      t("connections_unknown_folder"));
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
                                },
                                Object.create(null) as Record<
                                  string,
                                  AvailableConnection[]
                                >,
                              );
                              return Object.entries(grouped).map(
                                ([groupName, conns]) => (
                                  <CommandGroup
                                    key={groupName}
                                    heading={groupName}
                                  >
                                    {conns.map((conn) => (
                                      <CommandItem
                                        key={conn.id}
                                        value={conn.id}
                                        onSelect={() => {
                                          handleSelect(
                                            item.connectorKey,
                                            conn.id,
                                          );
                                        }}
                                        className={cn(
                                          conn.id === selectedId && "bg-muted",
                                        )}
                                      >
                                        <span className="truncate">
                                          {conn.name}
                                        </span>
                                      </CommandItem>
                                    ))}
                                  </CommandGroup>
                                ),
                              );
                            })()}
                          </CommandList>
                          {(item.connectionsUrl ?? item.configurationUrl) && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() =>
                                window.open(
                                  item.connectionsUrl ?? item.configurationUrl,
                                  "_blank",
                                  "noopener,noreferrer",
                                )
                              }
                              className="w-full rounded-none border-t p-2.5 text-sm"
                            >
                              {t("connections_open_connections")}
                            </Button>
                          )}
                        </Command>
                      </PopoverContent>
                    </Popover>
                  ) : (
                    <Button
                      variant="link"
                      size="sm"
                      className="h-auto p-0 text-sm font-semibold"
                      onClick={() => startOAuthConnect(item.connectorKey)}
                    >
                      {t("connections_connect")}
                    </Button>
                  )
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
                  variant={
                    CONNECTION_STATUS_VARIANT[selectedConn.state] ?? "secondary"
                  }
                >
                  {/* eslint-disable-next-line no-restricted-syntax */}
                  {t(
                    (CONNECTION_STATUS_LABEL[selectedConn.state] ??
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
                <Button
                  variant="ghost"
                  size="sm"
                  aria-label={t("connections_clear")}
                  onClick={() => handleClear(item.connectorKey)}
                  className="shrink-0 p-1"
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
                </Button>
              )}
            </div>
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
