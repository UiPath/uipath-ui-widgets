/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  Grid,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
} from "@mui/material";
import { ConversationalAgentChat } from "@uipath/ui-widgets-conversational-agent-chat";
import { DataTable } from "@uipath/ui-widgets-datatable";
import { MultiFileUpload } from "@uipath/ui-widgets-multi-file-upload";
import "@uipath/ui-widgets-multi-file-upload/MultiFileUpload.css";
import type { UiPath } from "@uipath/uipath-typescript/core";
import { Entities } from "@uipath/uipath-typescript/entities";
import { useEffect, useMemo, useState } from "react";
import "./App.css";

interface AppProps {
  uipathSdk: UiPath;
}

interface Entity {
  id: string;
  name: string;
  displayName: string;
}

function App({ uipathSdk }: AppProps) {
  const [entities, setEntities] = useState<Entity[]>([]);
  const [selectedEntityId, setSelectedEntityId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const columnConfig = useMemo(
    () => ({
      "Edition Name": {
        sortable: false,
        filter: false,
      },
      "Inventory Left": {
        cellClassRules: {
          "datatable-cell-low-inventory": (params: any) =>
            params.data.inventoryLeft < 3, // params.data = entity record
        },
      },
    }),
    [],
  );

  const rowClassRules = useMemo(
    () => ({
      "datatable-row-low-inventory": (params: any) =>
        params.data.inventoryLeft < 5,
    }),
    [],
  );

  useEffect(() => {
    const fetchEntities = async () => {
      try {
        setLoading(true);
        const entities = new Entities(uipathSdk);
        const entitiesList = await entities.getAll();
        setEntities(entitiesList);
      } catch (error) {
        console.error("Failed to fetch entities:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchEntities();
  }, [uipathSdk]);

  return (
    <div className="app-container">
      <div className="app-header">
        <h1>UIPath UI Widgets</h1>
        <p>Explore and manage your data entities with elegance</p>
      </div>

      <div className="app-grid">
        <div className="entity-sidebar">
          <div className="entity-sidebar-header">📊 Data Entities</div>
          <List className="entity-list">
            {loading ? (
              <div className="loading-container">
                <div className="loading-spinner"></div>
                <div className="loading-text">Loading entities...</div>
              </div>
            ) : entities.length === 0 ? (
              <ListItem>
                <ListItemText primary="No entities found" />
              </ListItem>
            ) : (
              entities.map((entity) => (
                <ListItem
                  key={entity.id}
                  disablePadding
                  className="entity-list-item"
                >
                  <ListItemButton
                    className="entity-list-button"
                    selected={selectedEntityId === entity.id}
                    onClick={() => setSelectedEntityId(entity.id)}
                  >
                    <ListItemText
                      className="entity-list-text"
                      primary={entity.displayName || entity.name}
                    />
                  </ListItemButton>
                </ListItem>
              ))
            )}
          </List>
        </div>

        <div className="content-area">
          {selectedEntityId ? (
            <>
              <div className="content-header">
                <div className="content-header-icon">📋</div>
                <h2 className="content-header-title">
                  {entities.find((e) => e.id === selectedEntityId)
                    ?.displayName || "Entity Data"}
                </h2>
              </div>
              <div className="datatable-wrapper">
                <DataTable
                  sdk={uipathSdk}
                  entityId={selectedEntityId}
                  pageSize={20}
                  columnConfig={columnConfig}
                  rowClassRules={rowClassRules}
                  customPaddingForExpandedRow={80}
                />
              </div>
            </>
          ) : (
            <div className="empty-state">
              <Grid container spacing={2} height={"100%"}>
                <Grid size={6}>
                  <MultiFileUpload
                    sdk={uipathSdk}
                    bucketId={parseInt(import.meta.env.VITE_MFU_BUCKET_ID)}
                    folderId={parseInt(
                      import.meta.env.VITE_MFU_BUCKET_FOLDER_ID,
                    )}
                    maxFileSize={20971520}
                    accept="image/*"
                    onUploadSuccess={(files: File[]) => {
                      console.log("Files uploaded:", files);
                    }}
                    onUploadError={(error: Error) => {
                      console.error("Upload error:", error);
                    }}
                  />
                </Grid>
                <Grid size={6} height={800}>
                  <ConversationalAgentChat
                    sdk={uipathSdk}
                    agentId={parseInt(import.meta.env.VITE_CONV_AGENT_ID)}
                    folderId={parseInt(
                      import.meta.env.VITE_CONV_AGENT_FOLDER_ID,
                    )}
                  />
                </Grid>
              </Grid>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
