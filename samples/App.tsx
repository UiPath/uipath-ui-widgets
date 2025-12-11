/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState, useMemo } from 'react';
import { Box, Container, Grid, List, ListItem, ListItemButton, ListItemText } from '@mui/material'
import { DataTable } from '@uipath/ui-widgets-datatable'
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
    <Container maxWidth="xl">
      <Box sx={{ bgcolor: '#eee', height: '98vh' }}>
        <Grid container spacing={2}>
          <Grid size={3} sx={{bgcolor: '#ddd'}}>
            <List sx={{ height: '95vh', overflowY: 'auto' }}>
              {loading ? (
                <ListItem>
                  <ListItemText primary="Loading entities..." />
                </ListItem>
              ) : entities.length === 0 ? (
                <ListItem>
                  <ListItemText primary="No entities found" />
                </ListItem>
              ) : (
                entities.map((entity) => (
                  <ListItem key={entity.id} disablePadding>
                    <ListItemButton
                      selected={selectedEntityId === entity.id}
                      onClick={() => setSelectedEntityId(entity.id)}
                    >
                      <ListItemText
                        primary={entity.displayName || entity.name}
                      />
                    </ListItemButton>
                  </ListItem>
                ))
              )}
            </List>
          </Grid>
          <Grid size={9}>
            {selectedEntityId ? (
              <Box sx={{height: '500px', marginTop: 2, marginRight: 2}}>
                <DataTable
                  sdk={uipathSdk}
                  entityId={selectedEntityId}
                  pageSize={20}
                  columnConfig={columnConfig}
                  rowClassRules={rowClassRules}
                />
              </Box>
            ) : (
              <Box sx={{ p: 2 }}>
                <p>Select an entity from the list to view its data</p>
              </Box>
            )}
          </Grid>
        </Grid>
      </Box>
    </Container>
  );
}

export default App;
