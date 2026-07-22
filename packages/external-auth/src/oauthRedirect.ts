import { OAuthRedirectConfig, TelemetryEvent, TelemetryStatus } from "./types";
import { trackTelemetry } from "./utils/telemetryUtils";

/**
 * Built-in default sign-in behavior: a standard OAuth 2.0 / OpenID Connect
 * authorization-code redirect — including a CSRF `state` value and (by
 * default) PKCE — straight to the provider's own authorize endpoint.
 *
 * A provider button opts in by carrying an `oauth` config; the browser is
 * sent directly to that provider's IdP (Google, UAE PASS, or any
 * OIDC-compliant provider). An explicit `onSignIn` always wins over this
 * default — and is the only way to start non-OIDC flows like SAML 2.0, whose
 * AuthnRequest must come from the consumer's backend Service Provider. For a
 * custom OIDC redirect, compose the helpers here (e.g.
 * `onSignIn: createDefaultSignIn(config)`).
 *
 * This is intentionally the only auth logic that lives inside the widget.
 * Note: getting a code back is only the first half of login. The consumer
 * still owns the callback route that verifies `state`, exchanges the code,
 * validates the tokens, and creates a session. The `state` and PKCE `codeVerifier`
 * generated here are stored in `sessionStorage` under
 * `uipath-external-auth:oauth:<clientId>` for the callback to read and verify.
 */

const STORAGE_PREFIX = "uipath-external-auth:oauth:";

function base64UrlEncode(bytes: Uint8Array): string {
  let str = "";
  for (const b of bytes) str += String.fromCharCode(b);
  return btoa(str).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function randomString(byteLength = 32): string {
  const arr = new Uint8Array(byteLength);
  crypto.getRandomValues(arr);
  return base64UrlEncode(arr);
}

async function sha256Base64Url(input: string): Promise<string> {
  const data = new TextEncoder().encode(input);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return base64UrlEncode(new Uint8Array(digest));
}

/**
 * Parse and validate the provider's authorize endpoint. It must be an
 * absolute http(s) URL: this URL ends up in `window.location.assign(...)`,
 * so if provider configuration were ever influenced by untrusted input, a
 * non-http(s) scheme (e.g. `javascript:`) would otherwise become an XSS
 * vector.
 */
function parseAuthorizeUrl(authorizeUrl: string): URL {
  let url: URL;
  try {
    url = new URL(authorizeUrl);
  } catch {
    throw new Error(
      `ExternalAuth: authorizeUrl must be an absolute http(s) URL; got "${authorizeUrl}".`,
    );
  }
  if (url.protocol !== "https:" && url.protocol !== "http:") {
    throw new Error(
      `ExternalAuth: authorizeUrl must use the http(s) scheme; got "${url.protocol}".`,
    );
  }
  return url;
}

/**
 * Build the full authorize URL for an OIDC provider, generating and persisting
 * a CSRF `state` (and, unless disabled, a PKCE verifier/challenge pair) so the
 * consumer's callback route can verify them.
 */
export async function buildOAuthAuthorizeUrl(
  clientId: string,
  config: OAuthRedirectConfig,
): Promise<string> {
  const {
    authorizeUrl,
    redirectUri,
    scopes,
    responseType = "code",
    usePkce = true,
    extraParams = {},
  } = config;

  // Validate the endpoint before any side effect (state generation,
  // sessionStorage write) so a bad config fails cleanly.
  const url = parseAuthorizeUrl(authorizeUrl);

  const state = randomString();
  // extraParams is spread first so the core OAuth params always win — a
  // consumer-supplied `state` (or client_id/redirect_uri/…) must never
  // silently replace the generated one, or the callback's CSRF check would
  // compare against a state that was never sent.
  const params = new URLSearchParams({
    ...extraParams,
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: responseType,
    // `scope` (singular) is the OAuth 2.0 spec's parameter name
    scope: scopes,
    state,
  });

  const stored: Record<string, string> = { state };

  if (usePkce) {
    const codeVerifier = randomString();
    const codeChallenge = await sha256Base64Url(codeVerifier);
    params.set("code_challenge", codeChallenge);
    params.set("code_challenge_method", "S256");
    stored.codeVerifier = codeVerifier;
  }

  try {
    sessionStorage.setItem(STORAGE_PREFIX + clientId, JSON.stringify(stored));
  } catch {
    // sessionStorage may be unavailable (e.g. SSR, privacy mode). Fail closed:
    // without the persisted state/verifier the callback could never verify
    // CSRF/PKCE, so redirecting anyway would be a guaranteed dead-end (or an
    // invitation to skip verification). Aborting lets the caller surface it.
    trackTelemetry(TelemetryEvent.PersistState, TelemetryStatus.Error, {
      Error: "sessionStorage_unavailable",
    });
    throw new Error(
      "ExternalAuth: could not persist the OAuth state/PKCE verifier to " +
        "sessionStorage; aborting the sign-in redirect because the callback " +
        "would not be able to verify this login.",
    );
  }

  // Merge via the URL API so a query string already present on authorizeUrl
  // is preserved and everything stays correctly encoded. `set` (not `append`)
  // guarantees our OAuth params win over any same-named param embedded in the
  // configured endpoint.
  for (const [key, value] of params) {
    url.searchParams.set(key, value);
  }
  return url.toString();
}

/**
 * Create a default `onSignIn` handler from an `OAuthRedirectConfig`. Returns a
 * function with the same `(clientId) => void` signature the widget expects; on
 * invocation it builds the authorize URL and navigates the browser to it.
 */
export function createDefaultSignIn(
  config: OAuthRedirectConfig,
): (clientId: string) => void {
  return (clientId: string) => {
    void buildOAuthAuthorizeUrl(clientId, config)
      .then((url) => {
        // Only booleans/enums about the flow shape are logged — never the
        // authorize URL, clientId, redirectUri, scopes, state or PKCE verifier.
        trackTelemetry(TelemetryEvent.OAuthRedirect, TelemetryStatus.Success, {
          UsePkce: config.usePkce !== false,
          ResponseType: config.responseType ?? "code",
        });
        window.location.assign(url);
      })
      .catch((error: unknown) => {
        trackTelemetry(TelemetryEvent.OAuthRedirect, TelemetryStatus.Error, {
          Error: "redirect failed",
        });
        // Without this, a rejection (e.g. crypto.subtle missing on insecure
        // origins) would make the button a silent no-op.
        console.error(
          "ExternalAuth: failed to start the sign-in redirect.",
          error,
        );
      });
  };
}
