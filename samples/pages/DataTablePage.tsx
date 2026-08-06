/* eslint-disable @typescript-eslint/no-explicit-any */
import { List, ListItem, ListItemButton, ListItemText } from "@mui/material";
import { DataTable } from "@uipath/ui-widgets-datatable";
import type { UiPath } from "@uipath/uipath-typescript/core";
import { Entities } from "@uipath/uipath-typescript/entities";
import { useEffect, useMemo, useState } from "react";
import PageHeader from "./PageHeader";

interface DataTablePageProps {
  uipathSdk: UiPath;
}

interface Entity {
  id: string;
  name: string;
  displayName: string;
}

function DataTablePage({ uipathSdk }: DataTablePageProps) {
  const [entities, setEntities] = useState<Entity[]>([]);
  const [selectedEntityId, setSelectedEntityId] = useState<string | null>(
    import.meta.env.VITE_SELECTED_ENTITY_ID,
  );
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
            params.data.inventoryLeft < 3,
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
        const entitiesService = new Entities(uipathSdk);
        const entitiesList = await entitiesService.getAll();
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
    <>
      <PageHeader widgetId="datatable" />
      <div className="app-grid">
        <div className="entity-sidebar">
          <div className="entity-sidebar-header">Data Entities</div>
          <List
            className="entity-list"
            sx={{ maxHeight: "calc(100vh - 220px)", overflow: "auto" }}
          >
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
              <p>Select an entity from the sidebar to view its data</p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

export default DataTablePage;
