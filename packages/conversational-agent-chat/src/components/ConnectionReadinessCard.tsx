import { Button, Spinner, cn } from "@uipath/apollo-wind";
import type { ConversationalAgent } from "@uipath/uipath-typescript/conversational-agent";
import {
  ConnectionSessionStatus,
  ConnectionState,
} from "@uipath/uipath-typescript/conversational-agent";
import { useCallback, useEffect, useRef, useState } from "react";
import { useWidgetTranslation } from "../i18n/useWidgetTranslation";

export interface ConnectorReadiness {
  connectorKey: string;
  connectorName: string;
  connectorImage?: string;
  isConfigurable: boolean;
  currentConnectionId: string | null;
  currentConnectionName: string | null;
  currentConnectionState?: ConnectionState;
  connectionsUrl?: string;
}

export interface ConnectionReadinessCardProps {
  connectors: ConnectorReadiness[];
  conversationalAgent: ConversationalAgent;
  agentId: number;
  folderId: number;
  onAllConnected?: () => void;
  onOpenSettings?: () => void;
  defaultCollapsed?: boolean;
}

type ConnectingKey = string | null;

/**
 * In-chat card showing connection readiness for the current agent.
 *
 * Three visual states:
 * 1. Collapsed bar - all connected or user collapsed. Shows count + Show button.
 * 2. Expanded broken card - connections expired/failed. Red border, reconnect.
 * 3. Expanded setup card - connections need initial setup. Warning border, connect.
 */
export const ConnectionReadinessCard = ({
  connectors,
  conversationalAgent,
  agentId,
  folderId,
  onAllConnected,
  onOpenSettings,
  defaultCollapsed = false,
}: ConnectionReadinessCardProps) => {
  const { t } = useWidgetTranslation();
  const [collapsed, setCollapsed] = useState(defaultCollapsed);

  // Auto-collapse once conversation starts
  useEffect(() => {
    if (defaultCollapsed) setCollapsed(true);
  }, [defaultCollapsed]);
  const [connectingKey, setConnectingKey] = useState<ConnectingKey>(null);
  const [localConnectors, setLocalConnectors] =
    useState<ConnectorReadiness[]>(connectors);
  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const pollInFlightRef = useRef(false);
  const oauthSessionRef = useRef(0);

  // Sync when prop changes
  useEffect(() => {
    setLocalConnectors(connectors);
  }, [connectors]);

  // Cleanup polling on unmount
  useEffect(() => {
    return () => {
      if (pollingRef.current) {
        clearInterval(pollingRef.current);
        pollingRef.current = null;
      }
    };
  }, []);

  // Re-fetch connections on tab visibility change (e.g. user returns from OAuth tab)
  const fetchingRef = useRef(false);
  useEffect(() => {
    const handler = () => {
      if (document.visibilityState !== "visible") return;
      if (fetchingRef.current || pollingRef.current) return;
      fetchingRef.current = true;
      conversationalAgent
        .getAvailableConnections(agentId, folderId)
        .then((items) => {
          setLocalConnectors(
            items.map((item) => {
              const selectedConn = item.currentConnectionId
                ? item.connections?.find(
                    (c) => c.id === item.currentConnectionId,
                  )
                : undefined;
              return {
                connectorKey: item.connectorKey,
                connectorName: item.connectorName ?? item.connectorKey,
                connectorImage: item.connectorImage,
                isConfigurable: item.isConfigurable !== false,
                currentConnectionId: item.currentConnectionId,
                currentConnectionName: item.currentConnectionName,
                currentConnectionState:
                  selectedConn?.state ??
                  (item.currentConnectionId
                    ? ConnectionState.Expired
                    : undefined),
                connectionsUrl: item.connectionsUrl,
              };
            }),
          );
        })
        .catch(() => {})
        .finally(() => {
          fetchingRef.current = false;
        });
    };
    document.addEventListener("visibilitychange", handler);
    return () => document.removeEventListener("visibilitychange", handler);
  }, [conversationalAgent, agentId, folderId]);

  const unconnected = localConnectors.filter(
    (c) => c.isConfigurable && !c.currentConnectionId,
  );
  const broken = localConnectors.filter(
    (c) =>
      c.isConfigurable &&
      c.currentConnectionId &&
      c.currentConnectionState &&
      c.currentConnectionState !== ConnectionState.Enabled,
  );
  const healthy = localConnectors.filter(
    (c) =>
      c.isConfigurable &&
      c.currentConnectionId &&
      c.currentConnectionState === ConnectionState.Enabled,
  );
  const allConnected = unconnected.length === 0 && broken.length === 0;

  // Notify parent when everything is connected
  useEffect(() => {
    if (allConnected) {
      onAllConnected?.();
    }
  }, [allConnected, onAllConnected]);

  const startOAuthConnect = useCallback(
    async (connectorKey: string) => {
      // Cancel any previous OAuth connection
      if (pollingRef.current) {
        clearInterval(pollingRef.current);
        pollingRef.current = null;
      }
      const oauthSession = ++oauthSessionRef.current;
      setConnectingKey(connectorKey);

      try {
        const result =
          await conversationalAgent.getConnectionAuthUrl(connectorKey);

        // Stale — a newer OAuth connection started while we awaited the auth URL
        if (oauthSessionRef.current !== oauthSession) return;

        const { authUrl, sessionId, expiresTime } = result;

        window.open(
          authUrl,
          "_blank",
          "noopener,noreferrer,width=600,height=700",
        );

        pollInFlightRef.current = false;
        pollingRef.current = setInterval(async () => {
          // Another OAuth connection replaced this one
          if (oauthSessionRef.current !== oauthSession) return;
          if (pollInFlightRef.current) return;
          pollInFlightRef.current = true;

          try {
            if (Date.now() > expiresTime) {
              if (pollingRef.current) {
                clearInterval(pollingRef.current);
                pollingRef.current = null;
              }
              if (oauthSessionRef.current === oauthSession)
                setConnectingKey(null);
              return;
            }

            const status =
              await conversationalAgent.getConnectionSessionStatus(sessionId);

            // Ignore if a newer OAuth connection started while the request was in-flight
            if (oauthSessionRef.current !== oauthSession) return;

            if (
              status.status === ConnectionSessionStatus.Success &&
              status.connectionId
            ) {
              if (pollingRef.current) {
                clearInterval(pollingRef.current);
                pollingRef.current = null;
              }
              setConnectingKey(null);

              // Persist via SDK first, then rebuild local state from the response
              try {
                const updatedSelections = localConnectors
                  .filter((c) => c.isConfigurable)
                  .map((c) => ({
                    connectorKey: c.connectorKey,
                    connectionId:
                      c.connectorKey === connectorKey
                        ? status.connectionId
                        : c.currentConnectionId,
                  }));
                const updated =
                  await conversationalAgent.updateConnectionSelections(
                    agentId,
                    folderId,
                    { selections: updatedSelections },
                  );
                if (oauthSessionRef.current === oauthSession) {
                  setLocalConnectors(
                    updated.map((item) => {
                      const sel = item.currentConnectionId
                        ? item.connections?.find(
                            (c) => c.id === item.currentConnectionId,
                          )
                        : undefined;
                      return {
                        connectorKey: item.connectorKey,
                        connectorName: item.connectorName ?? item.connectorKey,
                        connectorImage: item.connectorImage,
                        isConfigurable: item.isConfigurable !== false,
                        currentConnectionId: item.currentConnectionId,
                        currentConnectionName: item.currentConnectionName,
                        currentConnectionState:
                          sel?.state ??
                          (item.currentConnectionId
                            ? ConnectionState.Expired
                            : undefined),
                        connectionsUrl: item.connectionsUrl,
                      };
                    }),
                  );
                }
              } catch {
                // Persistence failed — do not update local state so the
                // card continues to show the connector as unresolved.
              }
            } else if (status.status === ConnectionSessionStatus.Failed) {
              if (pollingRef.current) {
                clearInterval(pollingRef.current);
                pollingRef.current = null;
              }
              if (oauthSessionRef.current === oauthSession)
                setConnectingKey(null);
            }
          } catch {
            // Transient error — keep polling until the session expires
          } finally {
            pollInFlightRef.current = false;
          }
        }, 500);
      } catch {
        if (oauthSessionRef.current === oauthSession) setConnectingKey(null);
      }
    },
    [conversationalAgent, agentId, folderId, localConnectors],
  );

  const STATE_LABEL: Record<string, string> = {
    [ConnectionState.Enabled]: "connections_status_connected",
    [ConnectionState.Expired]: "connections_status_expired",
    [ConnectionState.Disabled]: "connections_status_disabled",
    [ConnectionState.Failed]: "connections_status_failed",
  };

  const getStatusText = (connector: ConnectorReadiness): string => {
    if (connectingKey === connector.connectorKey) {
      return t("connection_readiness_waiting");
    }
    if (connector.currentConnectionId && connector.currentConnectionName) {
      if (
        connector.currentConnectionState &&
        connector.currentConnectionState !== "Enabled"
      ) {
        const labelKey =
          STATE_LABEL[connector.currentConnectionState] ??
          "connections_status_disabled";
        return t("connection_readiness_broken_status", {
          name: connector.currentConnectionName,
          // eslint-disable-next-line no-restricted-syntax
          status: t(labelKey as Parameters<typeof t>[0]),
        });
      }
      return t("connection_readiness_connected_as", {
        name: connector.currentConnectionName,
      });
    }
    return t("connection_readiness_not_connected");
  };

  // --- Collapsed bar state ---
  if (collapsed || allConnected) {
    const neededCount = unconnected.length + broken.length;
    if (neededCount === 0) return null;

    return (
      <div className="mx-auto my-2 w-full max-w-3xl flex flex-none items-center justify-between rounded-lg border bg-card px-4 py-3">
        <span className="text-sm text-muted-foreground">
          {neededCount === 1
            ? t("connection_readiness_still_needed", { count: neededCount })
            : t("connection_readiness_still_needed_plural", {
                count: neededCount,
              })}
        </span>
        <Button variant="ghost" size="sm" onClick={() => setCollapsed(false)}>
          {t("connection_readiness_show")}
        </Button>
      </div>
    );
  }

  // --- Expanded broken card state ---
  if (broken.length > 0) {
    return (
      <div className="mx-auto my-2 w-full max-w-3xl flex-none overflow-y-auto rounded-lg border-2 border-destructive bg-card p-4">
        <div className="mb-3 flex items-start justify-between">
          <div>
            <h3 className="text-sm font-semibold">
              {broken.length === 1
                ? t("connection_readiness_connection_broken", {
                    count: broken.length,
                  })
                : t("connection_readiness_connection_broken_plural", {
                    count: broken.length,
                  })}
            </h3>
            <p className="mt-1 text-xs text-muted-foreground">
              {t("connection_readiness_broken_description")}
            </p>
          </div>
          <Button variant="ghost" size="sm" onClick={() => setCollapsed(true)}>
            {t("connection_readiness_hide")}
          </Button>
        </div>

        <div className="flex flex-col gap-2">
          {broken.map((connector) => (
            <div
              key={connector.connectorKey}
              className="flex items-center justify-between rounded-md border px-3 py-2"
            >
              <div className="flex items-center gap-2">
                {connector.connectorImage && (
                  <img
                    src={connector.connectorImage}
                    alt=""
                    className="h-5 w-5 rounded"
                  />
                )}
                <div className="flex flex-col">
                  <span className="text-sm font-medium">
                    {connector.connectorName}
                  </span>
                  <span className="text-xs text-destructive">
                    {getStatusText(connector)}
                  </span>
                </div>
              </div>
              <Button
                variant="default"
                size="sm"
                disabled={connectingKey === connector.connectorKey}
                onClick={() => startOAuthConnect(connector.connectorKey)}
              >
                {connectingKey === connector.connectorKey ? (
                  <Spinner size="sm" />
                ) : (
                  t("connection_readiness_reconnect")
                )}
              </Button>
            </div>
          ))}
        </div>

        {/* Also show unconnected items if any */}
        {unconnected.length > 0 && (
          <div className="mt-3 flex flex-col gap-2">
            {unconnected.map((connector) => (
              <div
                key={connector.connectorKey}
                className="flex items-center justify-between rounded-md border px-3 py-2"
              >
                <div className="flex items-center gap-2">
                  {connector.connectorImage && (
                    <img
                      src={connector.connectorImage}
                      alt=""
                      className="h-5 w-5 rounded"
                    />
                  )}
                  <div className="flex flex-col">
                    <span className="text-sm font-medium">
                      {connector.connectorName}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {getStatusText(connector)}
                    </span>
                  </div>
                </div>
                <Button
                  variant="default"
                  size="sm"
                  disabled={connectingKey === connector.connectorKey}
                  onClick={() => startOAuthConnect(connector.connectorKey)}
                >
                  {connectingKey === connector.connectorKey ? (
                    <Spinner size="sm" />
                  ) : (
                    t("connection_readiness_connect")
                  )}
                </Button>
              </div>
            ))}
          </div>
        )}

        {/* Show healthy connections for full picture */}
        {healthy.length > 0 && (
          <div className="mt-3 flex flex-col gap-2">
            {healthy.map((connector) => (
              <div
                key={connector.connectorKey}
                className="flex items-center justify-between rounded-md border px-3 py-2"
              >
                <div className="flex items-center gap-2">
                  {connector.connectorImage && (
                    <img
                      src={connector.connectorImage}
                      alt=""
                      className="h-5 w-5 rounded"
                    />
                  )}
                  <div className="flex flex-col">
                    <span className="text-sm font-medium">
                      {connector.connectorName}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {getStatusText(connector)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <p className="mt-3 text-xs text-muted-foreground">
          {t("connection_readiness_signin_hint")}
        </p>

        {onOpenSettings && (
          <Button
            variant="link"
            size="sm"
            className="mt-1 p-0"
            onClick={onOpenSettings}
          >
            {t("connection_readiness_open_connections")}
          </Button>
        )}
      </div>
    );
  }

  // --- Expanded setup card state ---
  const connectedCount = localConnectors.filter(
    (c) => c.isConfigurable && c.currentConnectionId,
  ).length;
  const totalConfigurable = localConnectors.filter(
    (c) => c.isConfigurable,
  ).length;

  return (
    <div
      className={cn(
        "mx-auto my-2 w-full max-w-3xl flex-none overflow-y-auto rounded-lg border-2 bg-card p-4",
        "border-yellow-400",
      )}
    >
      <div className="mb-3 flex items-start justify-between">
        <div>
          <h3 className="text-sm font-semibold">
            {connectedCount === 0
              ? t("connection_readiness_setup_title")
              : t("connection_readiness_mixed_title", {
                  total: totalConfigurable,
                  remaining: totalConfigurable - connectedCount,
                })}
          </h3>
          <p className="mt-1 text-xs text-muted-foreground">
            {t("connection_readiness_setup_description")}
          </p>
        </div>
        <Button variant="ghost" size="sm" onClick={() => setCollapsed(true)}>
          {t("connection_readiness_hide")}
        </Button>
      </div>

      <div className="flex flex-col gap-2">
        {localConnectors
          .filter((c) => c.isConfigurable)
          .map((connector) => {
            const isConnected = !!connector.currentConnectionId;
            const isThisConnecting = connectingKey === connector.connectorKey;

            return (
              <div
                key={connector.connectorKey}
                className="flex items-center justify-between rounded-md border px-3 py-2"
              >
                <div className="flex items-center gap-2">
                  {connector.connectorImage && (
                    <img
                      src={connector.connectorImage}
                      alt=""
                      className="h-5 w-5 rounded"
                    />
                  )}
                  <div className="flex flex-col">
                    <span className="text-sm font-medium">
                      {connector.connectorName}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {getStatusText(connector)}
                    </span>
                  </div>
                </div>
                {!isConnected && (
                  <Button
                    variant="default"
                    size="sm"
                    disabled={connectingKey === connector.connectorKey}
                    onClick={() => startOAuthConnect(connector.connectorKey)}
                  >
                    {isThisConnecting ? (
                      <Spinner size="sm" />
                    ) : (
                      t("connection_readiness_connect")
                    )}
                  </Button>
                )}
              </div>
            );
          })}
      </div>

      <p className="mt-3 text-xs text-muted-foreground">
        {t("connection_readiness_signin_hint")}
      </p>

      {onOpenSettings && (
        <Button
          variant="link"
          size="sm"
          className="mt-1 p-0"
          onClick={onOpenSettings}
        >
          {t("connection_readiness_open_connections")}
        </Button>
      )}
    </div>
  );
};
