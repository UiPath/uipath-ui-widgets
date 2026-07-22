import { FC, ReactNode } from "react";
import { Button } from "@uipath/apollo-wind";
import "./AuthWidget.css";
import {
  AuthProvider,
  AuthWidgetProps,
  TelemetryEvent,
  TelemetryStatus,
} from "./types";
import { createDefaultSignIn } from "./oauthRedirect";
import { trackTelemetry } from "./utils/telemetryUtils";

const renderIcon = (icon: ReactNode, displayName: string) => {
  if (icon == null || icon === "") return null;
  if (typeof icon === "string") {
    return (
      <img
        src={icon}
        alt={`${displayName} icon`}
        aria-hidden="true"
        className="h-5 w-5 shrink-0 object-contain"
      />
    );
  }
  return (
    <span
      aria-hidden="true"
      className="flex h-5 w-5 shrink-0 items-center justify-center"
    >
      {icon}
    </span>
  );
};

export const AuthWidget: FC<AuthWidgetProps> = ({
  authProviders,
  title = "Sign in to your account",
}) => {
  const handleSignIn = (provider: AuthProvider) => {
    if (provider.onSignIn) {
      // A consumer-supplied handler always wins over the built-in default.
      // `Provider` is the human label (e.g. "Google", "SAML SSO") — safe to
      // log and exactly the adoption-per-provider signal we want; we never
      // log the clientId or any secret.
      trackTelemetry(TelemetryEvent.SignIn, TelemetryStatus.Success, {
        Provider: provider.displayName,
        Method: "customHandler",
      });
      provider.onSignIn(provider.clientId);
      return;
    }
    if (provider.oauth) {
      // Built-in default: a direct OIDC authorization-code redirect to the
      // provider's own IdP (covers Google, UAE PASS, any OIDC provider).
      trackTelemetry(TelemetryEvent.SignIn, TelemetryStatus.Success, {
        Provider: provider.displayName,
        Method: "oauthRedirect",
      });
      createDefaultSignIn(provider.oauth)(provider.clientId);
      return;
    }
    // Misconfigured provider: neither handler nor oauth config. Tracking this
    // surfaces silent dead-end buttons in production.
    trackTelemetry(TelemetryEvent.SignIn, TelemetryStatus.Error, {
      Provider: provider.displayName,
      Error: "no_handler",
    });
    console.warn(
      `AuthWidget: provider "${provider.displayName}" has neither an ` +
        `onSignIn handler nor an oauth config; its button click does nothing.`,
    );
  };

  return (
    <div className="uipath-auth-widget w-[400px] rounded-lg border border-border bg-card px-8 py-10 shadow-sm">
      <h1 className="mb-8 text-center text-2xl font-bold text-card-foreground">
        {title}
      </h1>
      <div className="flex flex-col gap-4">
        {authProviders.map((provider) => (
          <Button
            key={provider.displayName}
            type="button"
            variant="outline"
            className="h-auto w-full gap-3 px-4 py-3 text-base font-semibold"
            onClick={() => handleSignIn(provider)}
          >
            {renderIcon(provider.displayIcon, provider.displayName)}
            <span>Continue with {provider.displayName}</span>
          </Button>
        ))}
      </div>
    </div>
  );
};
