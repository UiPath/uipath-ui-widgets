import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { AuthWidget } from "../AuthWidget";
import { AuthProvider } from "../types";

const createProvider = (
  overrides: Partial<AuthProvider> = {},
): AuthProvider => ({
  displayName: "Google",
  clientId: "google-client-id",
  onSignIn: vi.fn(),
  ...overrides,
});

describe("AuthWidget", () => {
  it("renders the default title", () => {
    render(<AuthWidget authProviders={[createProvider()]} />);

    expect(
      screen.getByRole("heading", { name: "Sign in to your account" }),
    ).toBeInTheDocument();
  });

  it("renders a custom title", () => {
    render(
      <AuthWidget authProviders={[createProvider()]} title="Welcome back" />,
    );

    expect(
      screen.getByRole("heading", { name: "Welcome back" }),
    ).toBeInTheDocument();
  });

  it("renders one button per provider with its display name", () => {
    const providers = [
      createProvider({ displayName: "Google", clientId: "google-id" }),
      createProvider({ displayName: "Microsoft", clientId: "microsoft-id" }),
      createProvider({ displayName: "LinkedIn", clientId: "linkedin-id" }),
    ];

    render(<AuthWidget authProviders={providers} />);

    expect(screen.getAllByRole("button")).toHaveLength(3);
    expect(
      screen.getByRole("button", { name: /Continue with Google/ }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /Continue with Microsoft/ }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /Continue with LinkedIn/ }),
    ).toBeInTheDocument();
  });

  it("calls onSignIn with the provider's clientId when its button is clicked", async () => {
    const user = userEvent.setup();
    const onGoogleSignIn = vi.fn();
    const onMicrosoftSignIn = vi.fn();
    const providers = [
      createProvider({
        displayName: "Google",
        clientId: "google-id",
        onSignIn: onGoogleSignIn,
      }),
      createProvider({
        displayName: "Microsoft",
        clientId: "microsoft-id",
        onSignIn: onMicrosoftSignIn,
      }),
    ];

    render(<AuthWidget authProviders={providers} />);

    await user.click(
      screen.getByRole("button", { name: /Continue with Microsoft/ }),
    );

    expect(onMicrosoftSignIn).toHaveBeenCalledTimes(1);
    expect(onMicrosoftSignIn).toHaveBeenCalledWith("microsoft-id");
    expect(onGoogleSignIn).not.toHaveBeenCalled();
  });

  it("renders a string displayIcon as an image", () => {
    render(
      <AuthWidget
        authProviders={[
          createProvider({
            displayName: "Google",
            displayIcon: "https://example.com/google.svg",
          }),
        ]}
      />,
    );

    const icon = screen.getByAltText("Google icon");
    expect(icon).toBeInTheDocument();
    expect(icon).toHaveAttribute("src", "https://example.com/google.svg");
  });

  it("renders a React node displayIcon as-is", () => {
    render(
      <AuthWidget
        authProviders={[
          createProvider({
            displayIcon: <svg data-testid="custom-icon" />,
          }),
        ]}
      />,
    );

    expect(screen.getByTestId("custom-icon")).toBeInTheDocument();
  });

  it("renders no icon when displayIcon is omitted", () => {
    render(<AuthWidget authProviders={[createProvider()]} />);

    expect(screen.queryByRole("img")).not.toBeInTheDocument();
  });

  it("renders no buttons for an empty provider list", () => {
    render(<AuthWidget authProviders={[]} />);

    expect(screen.queryByRole("button")).not.toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "Sign in to your account" }),
    ).toBeInTheDocument();
  });

  describe("onSignIn override and built-in oauth default", () => {
    const googleOauth = {
      authorizeUrl: "https://accounts.google.com/o/oauth2/v2/auth",
      redirectUri: "https://myapp.com/auth/google/callback",
      scope: "openid email profile",
    };

    const originalLocation = window.location;
    afterEach(() => {
      Object.defineProperty(window, "location", {
        configurable: true,
        value: originalLocation,
      });
    });

    const mockLocationAssign = () => {
      const assign = vi.fn();
      Object.defineProperty(window, "location", {
        configurable: true,
        value: { ...window.location, assign },
      });
      return assign;
    };

    it("prefers an explicit onSignIn over the oauth default", async () => {
      const user = userEvent.setup();
      const onSignIn = vi.fn();
      const assign = mockLocationAssign();

      render(
        <AuthWidget
          authProviders={[
            {
              displayName: "Google",
              clientId: "google-client-id",
              oauth: googleOauth,
              onSignIn,
            },
          ]}
        />,
      );

      await user.click(
        screen.getByRole("button", { name: /Continue with Google/ }),
      );

      expect(onSignIn).toHaveBeenCalledWith("google-client-id");
      expect(assign).not.toHaveBeenCalled();
    });

    it("redirects straight to the provider's IdP when only oauth is given", async () => {
      const user = userEvent.setup();
      const assign = mockLocationAssign();

      render(
        <AuthWidget
          authProviders={[
            {
              displayName: "Google",
              clientId: "google-client-id",
              oauth: googleOauth,
            },
          ]}
        />,
      );

      await user.click(
        screen.getByRole("button", { name: /Continue with Google/ }),
      );

      // Only the widget's delegation is asserted here — the authorize URL's
      // internals (redirect_uri, scope, state, PKCE) are covered by
      // oauthRedirect.test.ts.
      await vi.waitFor(() => expect(assign).toHaveBeenCalledTimes(1));
      const url = new URL(assign.mock.calls[0][0]);
      expect(url.origin + url.pathname).toBe(googleOauth.authorizeUrl);
      expect(url.searchParams.get("client_id")).toBe("google-client-id");
    });

    it("warns and does nothing when there is neither onSignIn nor oauth", async () => {
      const user = userEvent.setup();
      const warn = vi.spyOn(console, "warn").mockImplementation(() => {});

      render(
        <AuthWidget
          authProviders={[
            { displayName: "Google", clientId: "google-client-id" },
          ]}
        />,
      );

      await user.click(
        screen.getByRole("button", { name: /Continue with Google/ }),
      );

      expect(warn).toHaveBeenCalledOnce();
      warn.mockRestore();
    });
  });
});
