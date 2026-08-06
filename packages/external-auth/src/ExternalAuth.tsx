import { FC, ReactNode } from "react";
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@uipath/apollo-wind";
import "./ExternalAuth.css";
import {
  AuthProvider,
  ExternalAuthProps,
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

export const ExternalAuth: FC<ExternalAuthProps> = ({
  authProviders,
  title = "Sign in to your account",
}) => {
  const handleSignIn = (provider: AuthProvider) => {
    const { onSignIn } = provider;
    if (onSignIn) {
      // A consumer-supplied handler always wins over the built-in default.
      // `Provider` is the human label (e.g. "Google", "SAML SSO") — safe to
      // log and exactly the adoption-per-provider signal we want; we never
      // log the clientId or any secret.
      trackTelemetry(TelemetryEvent.SignIn, TelemetryStatus.Success, {
        Provider: provider.displayName,
        Method: "customHandler",
      });
      // The handler may be sync or async. Route both through a promise so a
      // sync throw and an async rejection are handled identically — otherwise
      // a failed handler would be an unhandled error with no telemetry trace.
      void Promise.resolve()
        .then(() => onSignIn(provider.clientId))
        .catch((error: unknown) => {
          trackTelemetry(TelemetryEvent.SignIn, TelemetryStatus.Error, {
            Provider: provider.displayName,
            Error: "onSignIn failed",
          });
          console.error(
            `ExternalAuth: the onSignIn handler for provider ` +
              `"${provider.displayName}" failed.`,
            error,
          );
        });
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
      `ExternalAuth: provider "${provider.displayName}" has neither an ` +
        `onSignIn handler nor an oauth config; its button click does nothing.`,
    );
  };

  return (
    <Card className="uipath-external-auth w-[400px]">
      <CardHeader>
        <CardTitle role="heading" aria-level={1} className="text-center">
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
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
      </CardContent>
    </Card>
  );
};
