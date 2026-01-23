import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import { UiPath } from '@uipath/uipath-typescript/core';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

const uipathSdk = new UiPath({
  baseUrl: import.meta.env.VITE_UIPATH_BASE_URL,
  orgName: import.meta.env.VITE_UIPATH_ORG_NAME,
  tenantName: import.meta.env.VITE_UIPATH_TENANT_NAME,
  clientId: import.meta.env.VITE_UIPATH_CLIENT_ID,
  redirectUri: import.meta.env.VITE_UIPATH_REDIRECT_URI,
  scope: import.meta.env.VITE_UIPATH_SCOPE
});

try {
  await uipathSdk.initialize();
  console.log('SDK initialized successfully');
} catch (error) {
  console.error('Failed to initialize SDK:', error);
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App uipathSdk={uipathSdk} />
  </StrictMode>,
)
