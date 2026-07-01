import { Button, CircularProgress, TextField } from "@mui/material";
import { UiPath } from "@uipath/uipath-typescript/core";
import { useState } from "react";
import App from "./App.tsx";

/**
 * Gate the sample app behind a token prompt: the user pastes their UiPath token
 * at runtime and it is passed to the SDK as `secret`.
 *
 * The token is held in React state (memory) only for the life of the tab — it is
 * never logged, persisted to localStorage/sessionStorage, or written to the URL,
 * so it can't be lifted from disk or by a later XSS. Reloading requires re-entry.
 */
function Root() {
  const [token, setToken] = useState("");
  const [sdk, setSdk] = useState<UiPath | null>(null);
  const [connecting, setConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const connect = async (event: React.FormEvent) => {
    event.preventDefault();
    // Accept a pasted "Bearer <token>" and keep only the raw token.
    const secret = token.trim().replace(/^Bearer\s+/i, "");
    if (!secret) {
      setError("Enter a token to connect.");
      return;
    }
    setConnecting(true);
    setError(null);
    try {
      const instance = new UiPath({
        baseUrl: import.meta.env.VITE_UIPATH_BASE_URL,
        orgName: import.meta.env.VITE_UIPATH_ORG_NAME,
        tenantName: import.meta.env.VITE_UIPATH_TENANT_NAME,
        secret,
      });
      await instance.initialize();
      setSdk(instance);
    } catch (err) {
      // Never log the token itself — only the failure reason.
      console.error("Failed to initialize SDK:", err);
      setError(
        err instanceof Error ? err.message : "Failed to initialize the SDK.",
      );
    } finally {
      setConnecting(false);
    }
  };

  if (sdk) {
    return <App uipathSdk={sdk} />;
  }

  return (
    <div className="app-container">
      <div className="token-gate">
        <form className="token-gate-card" onSubmit={connect}>
          <h1 className="token-gate-title">UiPath UI Widgets</h1>
          <p className="token-gate-subtitle">
            Paste your UiPath token to connect the SDK.
          </p>
          <TextField
            type="password"
            size="small"
            fullWidth
            autoFocus
            autoComplete="off"
            label="User token"
            placeholder="Bearer token or PAT"
            value={token}
            onChange={(e) => setToken(e.target.value)}
            sx={{ mb: 2 }}
          />
          {error && <div className="token-gate-error">{error}</div>}
          <Button
            type="submit"
            variant="contained"
            fullWidth
            disabled={connecting || !token.trim()}
            sx={{
              background:
                "linear-gradient(135deg, var(--teal-600), var(--teal-700))",
            }}
          >
            {connecting ? (
              <>
                <CircularProgress size={16} sx={{ mr: 1, color: "white" }} />
                Connecting…
              </>
            ) : (
              "Connect"
            )}
          </Button>
        </form>
      </div>
    </div>
  );
}

export default Root;
