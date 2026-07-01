/* eslint-disable @typescript-eslint/no-explicit-any */
import { Button, CircularProgress, MenuItem, TextField } from "@mui/material";
import type { UiPath } from "@uipath/uipath-typescript/core";
import { Connectors } from "@uipath/uipath-typescript/is-connectors";
import type { ConnectionGetResponse } from "@uipath/uipath-typescript/is-connections";
import {
  execute,
  type ExecuteResult,
} from "@uipath/uipath-typescript/is-execution";
import { useEffect, useMemo, useState } from "react";
import PageHeader from "./PageHeader";
import { stateColor } from "./integrationService";

interface SlackMessagePageProps {
  uipathSdk: UiPath;
}

const SLACK_CONNECTOR_KEY = "uipath-salesforce-slack";
// Cloud Elements Slack hub posts chat messages to the `messages` object with a
// `{ channel, text }` body. `channel` accepts a user ID / @handle (which DMs the
// user) or a channel ID / #name.
const DEFAULT_OBJECT = "send_message_to_user_v2";

function SlackMessagePage({ uipathSdk }: SlackMessagePageProps) {
  const connectorsService = useMemo(
    () => new Connectors(uipathSdk),
    [uipathSdk],
  );

  const [connections, setConnections] = useState<ConnectionGetResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [connectionId, setConnectionId] = useState("");

  const [recipient, setRecipient] = useState("");
  const [message, setMessage] = useState("");
  const [objectName, setObjectName] = useState(DEFAULT_OBJECT);
  const [showAdvanced, setShowAdvanced] = useState(false);

  const [sending, setSending] = useState(false);
  const [result, setResult] = useState<ExecuteResult | null>(null);
  const [sendError, setSendError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        setLoadError(null);
        const conns = await connectorsService.getConnections(
          SLACK_CONNECTOR_KEY,
          {
            allFolders: true,
            pageSize: 100,
          },
        );
        if (cancelled) return;
        setConnections(conns);
        if (conns.length > 0) setConnectionId(conns[0].id);
      } catch (err: any) {
        if (!cancelled) {
          console.error("Failed to load Slack connections:", err);
          setLoadError(err?.message ?? "Failed to load Slack connections");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [connectorsService]);

  const send = async () => {
    setSendError(null);
    setResult(null);
    if (!connectionId) {
      setSendError("Select a Slack connection.");
      return;
    }
    if (!recipient.trim()) {
      setSendError("Enter a recipient (user ID, @handle, or channel).");
      return;
    }
    if (!message.trim()) {
      setSendError("Enter a message.");
      return;
    }

    setSending(true);
    try {
      const res = await execute(
        uipathSdk,
        connectionId,
        objectName.trim() || DEFAULT_OBJECT, // comes from the activity metadata.name
        "POST", // comes from the activity metadata.metadata.method.<methodName>
        {
          body: { channel: recipient.trim(), messageToSend: message }, // comes from the activity metadata.fields
          queryParams: { send_as: "bot" }, // comes from the activity metadata.metadata.method.<methodName>.parameters(type=query)
        },
      );
      setResult(res);
    } catch (err: any) {
      console.error("Failed to send Slack message:", err);
      setSendError(err?.message ?? "Failed to send message");
    } finally {
      setSending(false);
    }
  };

  return (
    <>
      <PageHeader widgetId="slack-message" />

      <div className="connectors-panel">
        {loading ? (
          <div className="loading-container">
            <div className="loading-spinner" />
            <div className="loading-text">Loading Slack connections…</div>
          </div>
        ) : (
          <div className="activity-form-layout">
            <div className="activity-form-main">
              <div className="connector-detail-head">
                <div className="content-header-icon">💬</div>
                <div>
                  <h2 className="content-header-title">Send a Slack message</h2>
                  <p className="connector-detail-desc">
                    Post a direct message or channel message through an
                    Integration Service Slack connection.
                  </p>
                </div>
              </div>

              {loadError && <div className="connectors-error">{loadError}</div>}

              <form
                className="dynamic-form"
                onSubmit={(e) => {
                  e.preventDefault();
                  send();
                }}
              >
                <TextField
                  select
                  size="small"
                  fullWidth
                  label="Slack connection"
                  value={connectionId}
                  onChange={(e) => setConnectionId(e.target.value)}
                  helperText={
                    connections.length === 0
                      ? "No Slack connections found in this folder."
                      : "The Slack workspace this message is sent from."
                  }
                  sx={{ mb: 1.5 }}
                >
                  {connections.map((conn) => (
                    <MenuItem key={conn.id} value={conn.id}>
                      <span
                        className="connection-dot"
                        style={{
                          background: stateColor(conn.state),
                          marginRight: 8,
                        }}
                      />
                      {conn.name} ({conn.state})
                    </MenuItem>
                  ))}
                </TextField>

                <TextField
                  size="small"
                  fullWidth
                  required
                  label="Recipient"
                  placeholder="U012AB3CD, @jane.doe, or #general"
                  value={recipient}
                  onChange={(e) => setRecipient(e.target.value)}
                  helperText="Slack user ID / @handle to DM a user, or a channel ID / #name."
                  sx={{ mb: 1.5 }}
                />

                <TextField
                  size="small"
                  fullWidth
                  required
                  multiline
                  minRows={4}
                  label="Message"
                  placeholder="Type your message…"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  sx={{ mb: 1.5 }}
                />

                <button
                  type="button"
                  className="inline-back"
                  onClick={() => setShowAdvanced((s) => !s)}
                >
                  {showAdvanced ? "▾ Advanced" : "▸ Advanced"}
                </button>

                {showAdvanced && (
                  <>
                    <TextField
                      size="small"
                      fullWidth
                      label="Object name"
                      value={objectName}
                      onChange={(e) => setObjectName(e.target.value)}
                      helperText='Connector object the message is posted to (default "send_message_to_user_v2").'
                      sx={{ mb: 1.5 }}
                    />
                  </>
                )}

                {sendError && (
                  <div className="connectors-error">{sendError}</div>
                )}

                <Button
                  type="submit"
                  variant="contained"
                  disabled={sending || !connectionId}
                  sx={{
                    mt: 1,
                    background:
                      "linear-gradient(135deg, var(--teal-600), var(--teal-700))",
                  }}
                >
                  {sending ? (
                    <>
                      <CircularProgress
                        size={16}
                        sx={{ mr: 1, color: "white" }}
                      />
                      Sending…
                    </>
                  ) : (
                    "Send message"
                  )}
                </Button>
              </form>
            </div>

            {/* Result panel */}
            <div className="activity-result">
              <div className="detail-col-header">Result</div>
              <div className="activity-result-body">
                {!result ? (
                  <div className="detail-empty">
                    Send a message to see the Slack API response.
                  </div>
                ) : (
                  <>
                    <div
                      className={`result-status ${result.ok ? "ok" : "err"}`}
                    >
                      {result.status} {result.statusText}
                    </div>
                    <pre className="result-json">
                      {typeof result.body === "string"
                        ? result.body
                        : JSON.stringify(result.body, null, 2)}
                    </pre>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

export default SlackMessagePage;
