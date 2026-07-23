import { beforeEach, describe, expect, it, vi } from "vitest";
import { buildOAuthAuthorizeUrl } from "../oauthRedirect";
import { OAuthRedirectConfig } from "../types";

const googleConfig: OAuthRedirectConfig = {
  authorizeUrl: "https://accounts.google.com/o/oauth2/v2/auth",
  redirectUri: "https://myapp.com/auth/google/callback",
  scopes: "openid email profile",
};

describe("buildOAuthAuthorizeUrl", () => {
  beforeEach(() => {
    sessionStorage.clear();
  });

  it("builds an authorization-code URL with the core params", async () => {
    const url = await buildOAuthAuthorizeUrl("google-client-id", googleConfig);
    const parsed = new URL(url);

    expect(parsed.origin + parsed.pathname).toBe(
      "https://accounts.google.com/o/oauth2/v2/auth",
    );
    expect(parsed.searchParams.get("client_id")).toBe("google-client-id");
    expect(parsed.searchParams.get("redirect_uri")).toBe(
      "https://myapp.com/auth/google/callback",
    );
    expect(parsed.searchParams.get("response_type")).toBe("code");
    expect(parsed.searchParams.get("scope")).toBe("openid email profile");
    expect(parsed.searchParams.get("state")).toBeTruthy();
  });

  it("includes a PKCE challenge by default and stores the verifier", async () => {
    const url = await buildOAuthAuthorizeUrl("google-client-id", googleConfig);
    const parsed = new URL(url);

    expect(parsed.searchParams.get("code_challenge")).toBeTruthy();
    expect(parsed.searchParams.get("code_challenge_method")).toBe("S256");

    const stored = JSON.parse(
      sessionStorage.getItem("uipath-external-auth:oauth:google-client-id")!,
    );
    expect(stored.state).toBe(parsed.searchParams.get("state"));
    expect(stored.codeVerifier).toBeTruthy();
  });

  it("omits PKCE when usePkce is false", async () => {
    const url = await buildOAuthAuthorizeUrl("cid", {
      ...googleConfig,
      usePkce: false,
    });
    const parsed = new URL(url);

    expect(parsed.searchParams.get("code_challenge")).toBeNull();
    expect(parsed.searchParams.get("code_challenge_method")).toBeNull();

    const stored = JSON.parse(
      sessionStorage.getItem("uipath-external-auth:oauth:cid")!,
    );
    expect(stored.codeVerifier).toBeUndefined();
  });

  it("appends extraParams (e.g. UAE PASS acr_values)", async () => {
    const url = await buildOAuthAuthorizeUrl("uaepass-client-id", {
      authorizeUrl: "https://id.uaepass.ae/idshub/authorize",
      redirectUri: "https://myapp.com/auth/uaepass/callback",
      scopes: "urn:uae:digitalid:profile:general",
      extraParams: {
        acr_values: "urn:safelayer:tws:policies:authentication:adaptive",
      },
    });
    const parsed = new URL(url);

    expect(parsed.searchParams.get("acr_values")).toBe(
      "urn:safelayer:tws:policies:authentication:adaptive",
    );
  });

  it("does not let extraParams override the generated core params", async () => {
    const url = await buildOAuthAuthorizeUrl("cid", {
      ...googleConfig,
      extraParams: { state: "consumer-chosen", client_id: "other-id" },
    });
    const parsed = new URL(url);
    const stored = JSON.parse(
      sessionStorage.getItem("uipath-external-auth:oauth:cid")!,
    );

    expect(parsed.searchParams.get("client_id")).toBe("cid");
    expect(parsed.searchParams.get("state")).toBe(stored.state);
    expect(parsed.searchParams.get("state")).not.toBe("consumer-chosen");
  });

  it("generates a fresh state on each call", async () => {
    const a = new URL(await buildOAuthAuthorizeUrl("cid", googleConfig));
    const b = new URL(await buildOAuthAuthorizeUrl("cid", googleConfig));

    expect(a.searchParams.get("state")).not.toBe(b.searchParams.get("state"));
  });

  it("rejects a non-https authorizeUrl scheme (e.g. javascript:)", async () => {
    await expect(
      buildOAuthAuthorizeUrl("cid", {
        ...googleConfig,
        // eslint-disable-next-line no-script-url
        authorizeUrl: "javascript:alert(1)",
      }),
    ).rejects.toThrow(/must use https/);
  });

  it("rejects a relative authorizeUrl", async () => {
    await expect(
      buildOAuthAuthorizeUrl("cid", {
        ...googleConfig,
        authorizeUrl: "/oauth/authorize",
      }),
    ).rejects.toThrow(/must be an absolute URL/);
  });

  it("rejects plain http (https is required, even for localhost)", async () => {
    await expect(
      buildOAuthAuthorizeUrl("cid", {
        ...googleConfig,
        authorizeUrl: "http://idp.example.com/authorize",
      }),
    ).rejects.toThrow(/must use https/);
    await expect(
      buildOAuthAuthorizeUrl("cid", {
        ...googleConfig,
        authorizeUrl: "http://localhost:8080/authorize",
      }),
    ).rejects.toThrow(/must use https/);
  });

  it("preserves a query string already present on authorizeUrl", async () => {
    const url = await buildOAuthAuthorizeUrl("cid", {
      ...googleConfig,
      authorizeUrl: "https://accounts.google.com/o/oauth2/v2/auth?audience=api",
    });
    const parsed = new URL(url);

    expect(parsed.searchParams.get("audience")).toBe("api");
    expect(parsed.searchParams.get("client_id")).toBe("cid");
    // exactly one "?" — params were merged, not naively concatenated
    expect(url.indexOf("?")).toBe(url.lastIndexOf("?"));
  });

  it("overrides same-named params embedded in authorizeUrl with the generated ones", async () => {
    const url = await buildOAuthAuthorizeUrl("cid", {
      ...googleConfig,
      authorizeUrl:
        "https://accounts.google.com/o/oauth2/v2/auth?state=attacker-pinned",
    });
    const parsed = new URL(url);
    const stored = JSON.parse(
      sessionStorage.getItem("uipath-external-auth:oauth:cid")!,
    );

    expect(parsed.searchParams.getAll("state")).toEqual([stored.state]);
  });

  it("fails closed when sessionStorage is unavailable", async () => {
    const spy = vi
      .spyOn(Storage.prototype, "setItem")
      .mockImplementation(() => {
        throw new Error("storage denied");
      });
    try {
      await expect(buildOAuthAuthorizeUrl("cid", googleConfig)).rejects.toThrow(
        /could not persist the OAuth state/,
      );
    } finally {
      spy.mockRestore();
    }
  });
});
