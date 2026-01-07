import { useEffect, useState, useMemo } from 'react';
import { List, ListItem, ListItemButton, ListItemText } from '@mui/material'
import { DataTable } from '@uipath/ui-widgets-datatable'
import { MultiFileUpload } from '@uipath/ui-widgets-multi-file-upload'
import type { UiPath } from '@uipath/uipath-typescript';
import './App.css'

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

  const columnConfig = useMemo(() => ({
    'Edition Name': {
      sortable: false,
      filter: false,
      editable: false
    },
    // 'Inventory Left': {
    //   cellClassRules: {
    //     'datatable-cell-low-inventory': (params: any) => params.data.inventoryLeft < 3 // params.data = entity record
    //   }
    // }
  }), []);

  const rowClassRules = useMemo(() => ({
    // 'datatable-row-low-inventory': (params: any) => params.data.inventoryLeft < 5
  }), [])

  useEffect(() => {
    const fetchEntities = async () => {
      try {
        setLoading(true);
        const entitiesList = await uipathSdk.entities.getAll();
        setEntities(entitiesList);
      } catch (error) {
        console.error('Failed to fetch entities:', error);
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
          <div className="entity-sidebar-header">
            📊 Data Entities
          </div>
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
                <ListItem key={entity.id} disablePadding className="entity-list-item">
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
                  {entities.find(e => e.id === selectedEntityId)?.displayName || 'Entity Data'}
                </h2>
              </div>
              <div className="datatable-wrapper">
                <DataTable
                  sdk={uipathSdk}
                  entityId={selectedEntityId}
                  pageSize={20}
                  columnConfig={columnConfig}
                  rowClassRules={rowClassRules}
                />
              </div>
            </>
          ) : (
            <div className="empty-state">
              <MultiFileUpload
                sdk={uipathSdk}
                bucketId={334332}
                folderId={893883}
                maxFileSize={20971520}
                accept="image/*"
                onUploadError={(error: Error) => {
                  console.error('Upload error:', error);
                }}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
