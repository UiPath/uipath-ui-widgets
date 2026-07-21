import { ReactNode } from "react";

/**
 * Config for a standard OAuth 2.0 / OpenID Connect authorization-code
 * redirect straight to a provider's own authorize endpoint. Supplied per
 * provider via `AuthProvider.oauth` to enable the built-in default sign-in;
 * also the parameter type of the exported `buildOAuthAuthorizeUrl` /
 * `createDefaultSignIn` helpers, the building blocks for a custom `onSignIn`.
 */
export interface OAuthRedirectConfig {
  /** Provider authorize endpoint, e.g. "https://accounts.google.com/o/oauth2/v2/auth" */
  authorizeUrl: string;
  /** Registered redirect URI the provider returns the user to after login */
  redirectUri: string;
  /** Space-separated scopes, e.g. "openid email profile" */
  scope: string;
  /** OAuth response_type; defaults to "code" (authorization-code flow) */
  responseType?: string;
  /** Generate a PKCE challenge/verifier pair; defaults to true */
  usePkce?: boolean;
  /** Extra query params to append, e.g. { acr_values: "..." } for UAE PASS */
  extraParams?: Record<string, string>;
}

export interface AuthProvider {
  /** Name shown on the provider button, e.g. "Google" renders "Continue with Google" */
  displayName: string;
  /**
   * Icon shown next to the provider name. A string is treated as an image URL,
   * anything else is rendered as-is (e.g. an inline SVG element).
   */
  displayIcon?: ReactNode;
  /**
   * Client ID the app is registered under at this provider. Passed back to
   * `onSignIn` when the button is clicked and used by the built-in `oauth`
   * default; the widget never interprets it. For providers without an OAuth
   * client (e.g. SAML) any opaque identifier works.
   */
  clientId: string;
  /**
   * Sign-in handler invoked when the provider's button is clicked. When
   * present it always wins over the built-in `oauth` default. Required for
   * non-OIDC providers — e.g. SAML 2.0, whose login must be started by the
   * app's backend Service Provider, so the handler typically navigates to a
   * backend login endpoint. For a custom OIDC redirect, compose the exported
   * helper: `onSignIn: createDefaultSignIn(config)`.
   */
  onSignIn?: (clientId: string) => void;
  /**
   * Config for the built-in default sign-in: a direct OIDC authorization-code
   * redirect to this provider's IdP, with CSRF `state` and (by default) PKCE.
   * Covers Google, UAE PASS, and any OIDC-compliant provider. Used only when
   * `onSignIn` is omitted.
   */
  oauth?: OAuthRedirectConfig;
}

export interface AuthWidgetProps {
  /** Providers to render, in order, one button each */
  authProviders: AuthProvider[];
  /** Heading shown at the top of the widget */
  title?: string;
}

/**
 * Telemetry event names emitted by the Auth widget, namespaced with an
 * `AUTH.` prefix so they are easy to filter in dashboards. Mirrors the
 * convention used by the other widgets in this repo (e.g. `CAC.*`, `DT.*`).
 */
export enum TelemetryEvent {
  /** A provider button was clicked and a sign-in was initiated. */
  SignIn = "AUTH.SignIn",
  /** The built-in OIDC authorization-code redirect flow. */
  OAuthRedirect = "AUTH.OAuthRedirect",
  /** Persisting the CSRF state / PKCE verifier to sessionStorage. */
  PersistState = "AUTH.PersistState",
}

export enum TelemetryStatus {
  Success = "AUTH.Success",
  Error = "AUTH.Error",
}
