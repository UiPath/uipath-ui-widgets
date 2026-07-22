import type { Meta, StoryObj } from "@storybook/react-vite";
import "./ExternalAuth.scss";
import { ExternalAuth } from "./ExternalAuth";

const GoogleIcon = (
  <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
    <path
      fill="#4285F4"
      d="M23.49 12.27c0-.79-.07-1.54-.19-2.27H12v4.51h6.47c-.29 1.48-1.14 2.73-2.4 3.58v3h3.86c2.26-2.09 3.56-5.17 3.56-8.82z"
    />
    <path
      fill="#34A853"
      d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.86-3c-1.08.72-2.45 1.16-4.07 1.16-3.13 0-5.78-2.11-6.73-4.96H1.29v3.09C3.26 21.3 7.31 24 12 24z"
    />
    <path
      fill="#FBBC05"
      d="M5.27 14.29c-.25-.72-.38-1.49-.38-2.29s.14-1.57.38-2.29V6.62H1.29C.47 8.24 0 10.06 0 12s.47 3.76 1.29 5.38l3.98-3.09z"
    />
    <path
      fill="#EA4335"
      d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.31 0 3.26 2.7 1.29 6.62l3.98 3.09c.95-2.85 3.6-4.96 6.73-4.96z"
    />
  </svg>
);

const SamlIcon = (
  <svg
    viewBox="0 0 24 24"
    width="20"
    height="20"
    aria-hidden="true"
    fill="none"
    stroke="#4B5563"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M12 2l8 3.5v5.1c0 5-3.4 9.6-8 11.4-4.6-1.8-8-6.4-8-11.4V5.5L12 2z" />
    <path d="M9 12l2 2 4-4" />
  </svg>
);

const UaePassIcon = (
  <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
    <rect x="2" y="2" width="20" height="20" rx="4" fill="#0B2A1E" />
    <path
      d="M12 6.5a4 4 0 0 1 4 4c0 2.6-1.3 5-4 7-2.7-2-4-4.4-4-7a4 4 0 0 1 4-4z"
      fill="none"
      stroke="#C8A24B"
      strokeWidth="1.6"
    />
    <circle cx="12" cy="10.5" r="1.4" fill="#C8A24B" />
  </svg>
);

const sampleProviders = [
  {
    displayName: "Google",
    displayIcon: GoogleIcon,
    clientId: "google-client-id",
    onSignIn: (clientId: string) => console.log("Sign in with", clientId),
  },
  {
    displayName: "SAML",
    displayIcon: SamlIcon,
    clientId: "saml-connection-id",
    onSignIn: (clientId: string) => console.log("Sign in with", clientId),
  },
  {
    displayName: "UAE PASS",
    displayIcon: UaePassIcon,
    clientId: "uaepass-client-id",
    onSignIn: (clientId: string) => console.log("Sign in with", clientId),
  },
];

const meta = {
  title: "Components/ExternalAuth",
  component: ExternalAuth,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component: `
A provider-agnostic React sign-in widget. It renders one button per configured authentication provider and starts the login **directly at that provider's IdP** — there is no UiPath broker in between. Each provider either supplies its own \`onSignIn\` handler (which always wins) or, for OIDC providers (Google, UAE PASS, …), an \`oauth\` config that enables the widget's built-in authorization-code redirect. Everything after the redirect — callback validation, token exchange, session creation — is the consumer's responsibility.

## Features

- Renders any number of authentication providers
- Fully provider-agnostic: name, icon, client ID, and sign-in handler are supplied per provider
- Built-in default sign-in for any OIDC provider (direct authorize redirect with CSRF \`state\` and PKCE)
- Per-provider \`onSignIn\` override that always wins — required for SAML 2.0, which must be started by the app's backend Service Provider
- Icons can be inline SVG/React elements or image URLs
- Customizable heading

## Installation

\`\`\`bash
npm install @uipath/ui-widgets-external-auth
\`\`\`

## Usage

> **Note:** Add either \`light\` or \`dark\` class to your HTML \`<body>\` element to enable proper theming.

\`\`\`tsx
import { ExternalAuth } from '@uipath/ui-widgets-external-auth';
import "@uipath/ui-widgets-external-auth/ExternalAuth.css";

function App() {
  return (
    <ExternalAuth
      authProviders={[
        {
          displayName: "Google",
          displayIcon: <GoogleIcon />,
          clientId: "your-google-client-id",
          // No onSignIn — the built-in default redirects straight to Google:
          oauth: {
            authorizeUrl: "https://accounts.google.com/o/oauth2/v2/auth",
            redirectUri: "https://myapp.com/auth/google/callback",
            scopes: "openid email profile",
          },
        },
        {
          displayName: "SAML",
          displayIcon: "https://example.com/shield.svg",
          clientId: "saml-connection-id",
          // SAML must be started by your backend Service Provider:
          onSignIn: (clientId) =>
            window.location.assign(\`/auth/saml/login?connection=\${clientId}\`),
        },
      ]}
    />
  );
}
\`\`\`

## Requirements

- React 19.2.0+
- React DOM 19.2.0+`,
      },
    },
  },
  tags: ["autodocs"],
  argTypes: {
    authProviders: {
      description:
        "Array of authentication providers. Each entry supplies a displayName, an optional displayIcon (React node or image URL), a clientId, and either an onSignIn callback (always wins) or an oauth config enabling the built-in direct OIDC redirect.",
      control: false,
    },
    title: {
      description: "Heading shown at the top of the widget",
      control: "text",
    },
  },
} satisfies Meta<typeof ExternalAuth>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    authProviders: sampleProviders,
  },
};

export const CustomTitle: Story = {
  args: {
    authProviders: sampleProviders,
    title: "Welcome back",
  },
  parameters: {
    docs: {
      description: {
        story: "Overrides the default heading via the `title` prop.",
      },
    },
  },
};

export const SingleProvider: Story = {
  args: {
    authProviders: [sampleProviders[0]],
  },
  parameters: {
    docs: {
      description: {
        story: "Works with a single provider.",
      },
    },
  },
};

export const WithoutIcons: Story = {
  args: {
    authProviders: sampleProviders.map(
      ({ displayName, clientId, onSignIn }) => ({
        displayName,
        clientId,
        onSignIn,
      }),
    ),
  },
  parameters: {
    docs: {
      description: {
        story:
          "Provider icons are optional — buttons render with the label only.",
      },
    },
  },
};

export const BuiltInOidcDefault: Story = {
  args: {
    authProviders: [
      {
        displayName: "Google",
        displayIcon: GoogleIcon,
        clientId: "google-client-id",
        // No onSignIn — the widget redirects straight to the provider's IdP.
        // Demo endpoints only; a real integration uses
        // https://accounts.google.com/o/oauth2/v2/auth
        oauth: {
          authorizeUrl: "https://idp.example.com/google/authorize",
          redirectUri: "https://myapp.example.com/auth/google/callback",
          scopes: "openid email profile",
        },
      },
      {
        displayName: "UAE PASS",
        displayIcon: UaePassIcon,
        clientId: "uaepass-client-id",
        // UAE PASS is OIDC too — only the endpoints/scopes/params differ.
        // Demo endpoints only; a real integration uses
        // https://id.uaepass.ae/idshub/authorize
        oauth: {
          authorizeUrl: "https://idp.example.com/uaepass/authorize",
          redirectUri: "https://myapp.example.com/auth/uaepass/callback",
          scopes: "urn:uae:digitalid:profile:general",
          extraParams: {
            acr_values: "urn:safelayer:tws:policies:authentication:adaptive",
          },
        },
      },
      {
        displayName: "SAML",
        displayIcon: SamlIcon,
        clientId: "saml-connection-id",
        // SAML cannot be started from the browser — the AuthnRequest must come
        // from the app's backend Service Provider, so onSignIn points there.
        onSignIn: () => window.location.assign("/auth/saml/login"),
      },
    ],
  },
  parameters: {
    docs: {
      description: {
        story:
          "The direct-to-IdP architecture: each button takes the user straight " +
          "to that provider's IdP. OIDC providers (Google, UAE PASS, or any " +
          "other) opt into the **built-in default sign-in** by carrying an " +
          "`oauth` config — the widget builds the authorization-code redirect " +
          "with CSRF `state` and PKCE and navigates to the provider. **SAML " +
          "must supply an `onSignIn`** that starts the flow at the app's " +
          "backend Service Provider. A per-provider `onSignIn` always wins " +
          "over the `oauth` default. The endpoints here are reserved " +
          "example.com demo values so clicking a button in this docs site " +
          "doesn't land on a real IdP — swap in the real authorize URLs shown " +
          "in the code comments.",
      },
    },
  },
};
