import "@fontsource/roboto/300.css";
import "@fontsource/roboto/400.css";
import { UiPath } from "@uipath/uipath-typescript/core";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

// The Validation Station web component (~74MB staged, several MB over the
// wire) is loaded lazily from `loadValidationStationWcOnDemand`, called by
// whichever page actually renders it — not here, since most widgets in this
// app never touch DU and shouldn't pay for its bundle.

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
