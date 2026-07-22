# External-Auth - Architecture

## Overview

A provider-agnostic React sign-in widget. It renders a card with a heading and one button per configured authentication provider ("Continue with {displayName}"). A click starts the login **directly at that provider's IdP**. Each provider either supplies its own `onSignIn` callback (always wins) or, for OIDC providers, an `oauth` config that enables the built-in default sign-in (a direct authorization-code redirect in `oauthRedirect.ts`). Everything after the redirect — callback validation, token exchange, session creation — belongs to the consumer.

## Component Structure

### Main Component

- **ExternalAuth** (`ExternalAuth.tsx`) - Single functional component. No state, no custom hooks, no services — purely presentational plus click dispatch.
- **oauthRedirect** (`oauthRedirect.ts`) - The built-in default sign-in: builds a standard OIDC authorization-code URL (CSRF `state` + PKCE, secrets stored in `sessionStorage` under `uipath-external-auth:oauth:<clientId>`) and navigates the browser to the provider. `buildOAuthAuthorizeUrl` and `createDefaultSignIn` are exported for composing custom handlers.

### Props

| Prop            | Type             | Required | Description                                    |
| --------------- | ---------------- | -------- | ---------------------------------------------- |
| `authProviders` | `AuthProvider[]` | Yes      | Providers to render, in order, one button each |
| `title`         | `string`         | No       | Heading (default: "Sign in to your account")   |

### AuthProvider

| Field         | Type                                          | Required | Description                                                                                                                                                   |
| ------------- | --------------------------------------------- | -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `displayName` | `string`                                      | Yes      | Button label ("Continue with {displayName}");                                                                                                                 |
| `displayIcon` | `ReactNode`                                   | No       | String → rendered as `<img src>`; anything else rendered as-is                                                                                                |
| `clientId`    | `string`                                      | Yes      | Passed to `onSignIn` on click and used by the `oauth` default; opaque to the widget                                                                           |
| `onSignIn`    | `(clientId: string) => void \| Promise<void>` | No\*     | Click handler (sync or async) — always wins over `oauth`; required for non-OIDC providers (SAML 2.0); throws/rejections are caught and reported via telemetry |
| `oauth`       | `OAuthRedirectConfig`                         | No\*     | Enables the built-in default sign-in: a direct OIDC authorize redirect to this provider's IdP                                                                 |

\* Provide `onSignIn` or `oauth` (or both — `onSignIn` wins). With neither, a click logs a warning and does nothing.

## Data Flow

```
User clicks a provider button
  → handleSignIn(provider)
    → provider.onSignIn?          → consumer's handler (always wins)
    → else provider.oauth?        → built-in default: direct OIDC redirect to the provider's IdP
    → else                        → console.warn, no-op
```

There is no internal state. The widget never inspects or interprets `clientId` — it is an opaque value passed back to the consumer. Everything after the redirect (callback route, `state`/PKCE verification, token exchange and validation, session creation — and for SAML the entire backend Service Provider) is the consumer's code.

## Icon Rendering

`renderIcon()` in `ExternalAuth.tsx`:

- `undefined`/`null`/`""` → no icon rendered
- `string` → treated as an image URL, rendered as `<img>` with `{displayName} icon` alt text
- anything else (e.g. inline SVG element) → rendered inside a fixed-size `<span>` wrapper
- both branches are `aria-hidden` — the icon is decorative; the button text carries the provider name

## Styling

- Built from `@uipath/apollo-wind` design-system components: `Card`/`CardHeader`/`CardTitle`/`CardContent` for the container (de-emphasized border + shadow by default) and `Button variant="outline"` for the provider buttons — no hand-rolled chrome, no UiPath logo (the widget is provider-agnostic)
- Tailwind utility classes via `@uipath/apollo-wind` (see `ExternalAuth.scss`)
- `ExternalAuth.css` in `src/` is a stub for tests; the real stylesheet is compiled from `ExternalAuth.scss` into `dist/` by the `copy-styles` script
- Root element carries the `uipath-external-auth` class for consumer overrides

## Telemetry

Product telemetry via the shared `trackEvent` SDK (`src/utils/telemetryUtils.ts`), stamped with `ApplicationName: "Widget.ExternalAuth"` + `WidgetVersion`:

- `AUTH.SignIn` — provider button clicked (`Provider`, `Method: customHandler | oauthRedirect`); `Error` status for misconfigured providers or failed `onSignIn` handlers
- `AUTH.OAuthRedirect` — built-in redirect succeeded/failed (`UsePkce`, `ResponseType` / `Error`)
- `AUTH.PersistState` — `Error` only, when persisting state/PKCE to sessionStorage fails

No secrets or PII are logged — provider labels, booleans, enums, and error reasons only.
