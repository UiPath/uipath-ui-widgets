import {
  Alert,
  AlertDescription,
  Badge,
  Button,
  Input,
  Spinner,
  cn,
} from "@uipath/apollo-wind";
import type {
  AvailableConnection,
  AvailableConnectionsItem,
  AvailableConnectionsResponse,
  ConversationalAgent,
} from "@uipath/uipath-typescript/conversational-agent";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";

export interface ConnectionsSectionProps {
  conversationalAgent: ConversationalAgent;
  agentId: number;
  folderId: number;
}

/** Empty string = no selection, non-empty string = selected connectionId, null = explicitly cleared */
type SelectionValue = string | null;
type SelectionMap = Record<string, SelectionValue>;

const getInitialSelections = (
  items: AvailableConnectionsResponse,
): SelectionMap =>
  Object.fromEntries(
    items.map((item) => [item.connectorKey, item.currentConnectionId ?? ""]),
  );

const STATUS_VARIANT: Record<
  string,
  "default" | "destructive" | "outline" | "secondary"
> = {
  Enabled: "default",
  Expired: "outline",
  Disabled: "secondary",
  Failed: "destructive",
};

const STATUS_LABEL_KEY: Record<string, string> = {
  Enabled: "connections_status_connected",
  Expired: "connections_status_expired",
  Disabled: "connections_status_disabled",
  Failed: "connections_status_failed",
};

export const ConnectionsSection = ({
  conversationalAgent,
  agentId,
  folderId,
}: ConnectionsSectionProps) => {
  const { t } = useTranslation();
  const [availableConnections, setAvailableConnections] =
    useState<AvailableConnectionsResponse>([]);
  const [initialSelections, setInitialSelections] = useState<SelectionMap>({});
  const [stagedSelections, setStagedSelections] = useState<SelectionMap>({});
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveResult, setSaveResult] = useState<"success" | "error" | null>(
    null,
  );
  const [saveError, setSaveError] = useState<string | null>(null);

  const fetchConnections = useCallback(() => {
    return conversationalAgent
      .getAvailableConnections(agentId, folderId)
      .then((items) => {
        const selections = getInitialSelections(items);
        setAvailableConnections(items);
        setInitialSelections(selections);
        setStagedSelections(selections);
      });
  }, [conversationalAgent, agentId, folderId]);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setLoadError(null);
    setSaveResult(null);
    fetchConnections()
      .catch((err: unknown) => {
        if (cancelled) return;
        setLoadError(err instanceof Error ? err.message : String(err));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [fetchConnections]);

  // Refresh connections when the user returns to the tab (e.g. after authenticating in a new window)
  const fetchingRef = useRef(false);
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState !== "visible") return;
      if (fetchingRef.current) return;

      fetchingRef.current = true;
      conversationalAgent
        .getAvailableConnections(agentId, folderId)
        .then((items) => {
          setAvailableConnections(items);
        })
        .catch(() => {
          // Silently ignore refresh failures
        })
        .finally(() => {
          fetchingRef.current = false;
        });
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () =>
      document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, [conversationalAgent, agentId, folderId]);

  const isDirty = useMemo(
    () =>
      Object.keys(initialSelections).some(
        (key) => initialSelections[key] !== stagedSelections[key],
      ),
    [initialSelections, stagedSelections],
  );

  const selectConnection = useCallback(
    (connectorKey: string, connectionId: string) => {
      setStagedSelections((prev) => ({
        ...prev,
        [connectorKey]: connectionId,
      }));
      setSaveResult(null);
    },
    [],
  );

  const clearConnection = useCallback((connectorKey: string) => {
    setStagedSelections((prev) => ({ ...prev, [connectorKey]: null }));
    setSaveResult(null);
  }, []);

  const handleSave = async () => {
    setSaving(true);
    setSaveResult(null);
    setSaveError(null);
    try {
      const updated = await conversationalAgent.updateConnectionSelections(
        agentId,
        folderId,
        {
          selections: Object.entries(stagedSelections)
            .filter(([, value]) => value !== "")
            .map(([connectorKey, connectionId]) => ({
              connectorKey,
              connectionId,
            })),
        },
      );
      const selections = getInitialSelections(updated);
      setAvailableConnections(updated);
      setInitialSelections(selections);
      setStagedSelections(selections);
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

  if (availableConnections.length === 0) {
    return (
      <p className="py-4 text-center text-sm text-muted-foreground">
        {t("connections_no_configurable")}
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {availableConnections.map((item) => (
        <ConnectionRow
          key={item.connectorKey}
          item={item}
          selectedConnectionId={stagedSelections[item.connectorKey] ?? ""}
          onSelect={(connectionId) =>
            selectConnection(item.connectorKey, connectionId)
          }
          onClear={() => clearConnection(item.connectorKey)}
          conversationalAgent={conversationalAgent}
        />
      ))}

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

      <div className="flex justify-start gap-2">
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

// ─── ConnectionRow ───

interface ConnectionRowProps {
  item: AvailableConnectionsItem;
  selectedConnectionId: string;
  onSelect: (connectionId: string) => void;
  onClear: () => void;
  conversationalAgent: ConversationalAgent;
}

const ConnectionRow = ({
  item,
  selectedConnectionId,
  onSelect,
  onClear,
  conversationalAgent,
}: ConnectionRowProps) => {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const selectedConnection = item.connections.find(
    (c: AvailableConnection) => c.id === selectedConnectionId,
  );
  const isConfigurable = item.isConfigurable !== false;
  const hasSelection = selectedConnectionId !== "" && selectedConnectionId !== null;
  const displayName = selectedConnection?.name ?? item.currentConnectionName;

  const query = search.trim().toLowerCase();
  const grouped = item.connections.reduce<
    Record<string, AvailableConnection[]>
  >((groups: Record<string, AvailableConnection[]>, conn: AvailableConnection) => {
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

  return (
    <div className="border-b border-border py-3">
      {/* Row 1: Connector icon + name */}
      <div className="mb-1.5 flex items-center gap-2">
        {item.connectorImage && (
          <img
            src={item.connectorImage}
            alt=""
            className="h-[18px] w-[18px] flex-shrink-0 object-contain"
          />
        )}
        <span className="text-sm font-semibold">
          {item.connectorName ?? item.connectorKey}
        </span>
      </div>

      {/* Row 2: Connection selection + status + clear */}
      <div className="flex items-center gap-2">
        <div className="min-w-0 flex-1 truncate">
          {isConfigurable ? (
            <button
              type="button"
              onClick={() => { setOpen(!open); setSearch(""); }}
              className={
                hasSelection
                  ? "inline-flex items-center gap-1 text-sm hover:opacity-80"
                  : "text-sm font-semibold text-primary hover:underline"
              }
            >
              {hasSelection ? (
                <>
                  <span>{displayName ?? selectedConnectionId}</span>
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
              {item.currentConnectionName ?? selectedConnectionId}
            </span>
          ) : (
            <span className="text-sm text-muted-foreground">
              {t("connections_not_configured")}
            </span>
          )}
        </div>

        {/* Status badge */}
        {selectedConnection && (
          <Badge
            variant={STATUS_VARIANT[selectedConnection.state] ?? "secondary"}
          >
            {t(
              STATUS_LABEL_KEY[selectedConnection.state] ??
                "connections_status_disabled",
            )}
          </Badge>
        )}

        {/* Clear button */}
        {hasSelection && isConfigurable && (
          <button
            type="button"
            aria-label={t("connections_clear")}
            onClick={onClear}
            className="flex-shrink-0 rounded p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
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

      {/* Inline connection picker */}
      {open && isConfigurable && (
        <div className="mt-2 rounded-md border bg-background shadow-md">
          <ConnectionPicker
            item={item}
            groupNames={groupNames}
            grouped={grouped}
            selectedConnectionId={selectedConnectionId}
            search={search}
            setSearch={setSearch}
            onSelect={(connectionId) => {
              onSelect(connectionId);
              setOpen(false);
              setSearch("");
            }}
            conversationalAgent={conversationalAgent}
            t={t}
          />
        </div>
      )}
    </div>
  );
};

// ─── ConnectionPicker ───

interface ConnectionPickerProps {
  item: AvailableConnectionsItem;
  groupNames: string[];
  grouped: Record<string, AvailableConnection[]>;
  selectedConnectionId: string;
  search: string;
  setSearch: (value: string) => void;
  onSelect: (connectionId: string) => void;
  conversationalAgent: ConversationalAgent;
  t: (key: string) => string;
}

const ConnectionPicker = ({
  item,
  groupNames,
  grouped,
  selectedConnectionId,
  search,
  setSearch,
  onSelect,
  conversationalAgent,
  t,
}: ConnectionPickerProps) => (
  <>
    {/* Search + add */}
    <div className="flex items-center gap-2 border-b p-2">
      <Input
        placeholder={t("connections_search_placeholder")}
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="h-7 text-sm"
        autoFocus
      />
      <button
        type="button"
        onClick={async () => {
          const url = await conversationalAgent.getAddConnectionUrl(item);
          if (url) {
            window.open(url, "_blank", "noopener,noreferrer");
          }
        }}
        className="shrink-0 text-xs text-primary hover:underline"
      >
        {t("connections_add_connection")}
      </button>
    </div>

    {/* Grouped options */}
    <div className="max-h-48 overflow-y-auto">
      {groupNames.length === 0 && (
        <p className="p-3 text-sm text-muted-foreground">
          {t("connections_no_configurable")}
        </p>
      )}
      {groupNames.map((groupName) => (
        <div key={groupName}>
          <p className="px-3 pb-1 pt-2.5 text-xs text-muted-foreground">
            {groupName}
          </p>
          {grouped[groupName].map((conn: AvailableConnection) => (
            <button
              key={conn.id}
              type="button"
              onClick={() => onSelect(conn.id)}
              className={cn(
                "flex w-full items-center gap-2 px-3 py-1.5 text-left text-sm hover:bg-muted",
                conn.id === selectedConnectionId && "bg-muted",
              )}
            >
              <span className="flex-1 truncate">{conn.name}</span>
            </button>
          ))}
        </div>
      ))}
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
  </>
);
