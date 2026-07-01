import type { UiPath } from "@uipath/uipath-typescript/core";
import { useEffect, useState } from "react";
import "./App.css";
import ConnectorsPage from "./pages/ConnectorsPage";
import ConversationalAgentPage from "./pages/ConversationalAgentPage";
import DataTablePage from "./pages/DataTablePage";
import HomePage from "./pages/HomePage";
import MultiFileUploadPage from "./pages/MultiFileUploadPage";
import SlackMessagePage from "./pages/SlackMessagePage";
import ValidationStationPage from "./pages/ValidationStationPage";

interface AppProps {
  uipathSdk: UiPath;
}

function getRoute() {
  return window.location.hash.replace(/^#\/?/, "");
}

function App({ uipathSdk }: AppProps) {
  const [route, setRoute] = useState(getRoute());

  useEffect(() => {
    const handler = () => setRoute(getRoute());
    window.addEventListener("hashchange", handler);
    return () => window.removeEventListener("hashchange", handler);
  }, []);

  let page;
  switch (route) {
    case "datatable":
      page = <DataTablePage uipathSdk={uipathSdk} />;
      break;
    case "validation-station":
      page = <ValidationStationPage uipathSdk={uipathSdk} />;
      break;
    case "multi-file-upload":
      page = <MultiFileUploadPage uipathSdk={uipathSdk} />;
      break;
    case "conversational-agent-chat":
      page = <ConversationalAgentPage uipathSdk={uipathSdk} />;
      break;
    case "connectors":
      page = <ConnectorsPage uipathSdk={uipathSdk} />;
      break;
    case "slack-message":
      page = <SlackMessagePage uipathSdk={uipathSdk} />;
      break;
    default:
      page = <HomePage />;
  }

  return <div className="app-container">{page}</div>;
}

export default App;
