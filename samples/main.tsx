import "@fontsource/roboto/300.css";
import "@fontsource/roboto/400.css";
import { UiPath } from "@uipath/uipath-typescript/core";
import { configureValidationStationWc } from "@uipath/ui-widgets-validation-station";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

// Served from this app's own origin out of `public/du-vs-wc`, staged from
// node_modules by `npm run stage-du-wc` (wired to `predev`). Loading is async
// and the widgets wait for it, so this is deliberately not awaited.
configureValidationStationWc({
  deploymentUrl: "/du-vs-wc",
  // This app ships only Roboto (via @fontsource), not Apollo fonts or Material
  // Icons — without these, icon glyphs in the component render as empty boxes.
  includeFonts: true,
}).catch((error: unknown) => {
  console.error("Failed to load the Validation Station web component:", error);
});

const uipathSdk = new UiPath({
  baseUrl: import.meta.env.VITE_UIPATH_BASE_URL,
  orgName: import.meta.env.VITE_UIPATH_ORG_NAME,
  tenantName: import.meta.env.VITE_UIPATH_TENANT_NAME,
  clientId: import.meta.env.VITE_UIPATH_CLIENT_ID,
  redirectUri: import.meta.env.VITE_UIPATH_REDIRECT_URI,
  scope: import.meta.env.VITE_UIPATH_SCOPE,
});

try {
  await uipathSdk.initialize();
  console.log("SDK initialized successfully");
} catch (error) {
  console.error("Failed to initialize SDK:", error);
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App uipathSdk={uipathSdk} />
  </StrictMode>,
);
