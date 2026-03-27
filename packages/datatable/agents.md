# DataTable - Architecture

## Overview

The DataTable is a React component built on AG-Grid that provides a complete data management interface for UiPath Data Fabric entities. It supports full CRUD operations, inline editing with diff tracking, master-detail grouping, file handling, and choice set fields.

## Component Structure

### Main Component

- **DataTable** (`DataTable.tsx`) - Orchestrates the entire datatable: initializes ag-grid, coordinates hooks, manages row operations (add, insert, delete, discard), group-by/master-detail mode, diff tracking, and telemetry.

### Sub-Components

- **Toolbar** (`components/Toolbar.tsx`) - Action buttons (Refresh, Add Row, Insert, Discard, Delete, Show Diff) and Group By dropdown selector.
- **DiffDialog** (`components/DiffDialog.tsx`) - Modal showing original vs edited values per field, with field-level revert and commit/revert-all actions.
- **DetailPanel** (`components/DetailPanel.tsx`) - Nested AG-Grid for displaying grouped records in master-detail mode.
- **CellWithExpandButton** (`components/CellWithExpandButton.tsx`) - Master row cell renderer with expand/collapse chevron.
- **FileCellRenderer** (`components/FileCellRenderer.tsx`) - File field lifecycle: upload, open, download, replace, remove.
- **DateTimeCellRenderer** (`components/DateTimeCellRenderer.tsx`) - DateTimePicker for date/time fields.
- **MultilineTextCellRenderer** (`components/MultilineTextCellRenderer.tsx`) - Displays multiline text with `pre-wrap`.
- **MultilineTextCellEditor** (`components/MultilineTextCellEditor.tsx`) - Textarea editor with Shift+Enter for new lines.
- **RefFieldCellEditor** (`components/RefFieldCellEditor.tsx`) - Dropdown editor for foreign key fields with reference entity records.
- **ChoiceSetSingleCellEditor** (`components/ChoiceSetSingleCellEditor.tsx`) - Single-select dropdown for choice set fields.
- **ChoiceSetMultipleCellEditor** (`components/ChoiceSetMultipleCellEditor.tsx`) - Multi-select for choice set fields.

## Hooks

- **useEntityData** (`hooks/useEntityData.ts`) - Fetches entity schema and records, pre-fetches choice set values, builds column definitions with field-specific editors/renderers.
- **useRowEditing** (`hooks/useRowEditing.ts`) - Tracks inline cell edits in `editedRows` Map, handles commit, revert-all, and field-level revert.
- **useEntityRecordsCache** (`hooks/useEntityRecordsCache.ts`) - Static class-based cache for entity records (used by group-by and foreign key editors).
- **useChoiceSetCache** (`hooks/useChoiceSetCache.ts`) - Static class-based cache for choice set values.

## Utilities

- **dataUtils** (`utils/dataUtils.ts`) - `deepClone()`, `getDiffData()`, `hasRowChanges()`.
- **fieldUtils** (`utils/fieldUtils.ts`) - Field type checks, `getFieldValue()` (display conversion), `createValueSetter()`, `createCellEditorSelector()`, `getMimeType()`.
- **telemetryUtils** (`utils/telemetryUtils.ts`) - `trackTelemetry()` for all user action tracking.

## Key Data Flows

### Entity Data Loading

```
DataTable mounts
  → useEntityData.fetchEntityRecords()
    → entityService.getById(entityId)
    → entityService.getAllRecords(expansionLevel: 2)
    → Pre-fetch all choice set values
    → Build columnDefs with field-specific editors/renderers
    → setRowData(items), setOriginalData(deepClone(items))
```

### Inline Editing

```
User edits cell
  → AG-Grid fires onCellValueChanged
  → useRowEditing updates editedRows Map
  → "Show Diff (N)" button enables
```

### Diff & Commit

```
Show Diff → getDiffData() → DiffDialog renders original vs edited
  → Revert field: restores single field from originalData
  → Revert all: restores rowData from originalData
  → Commit: entity.updateRecords(editedRows) → clears editedRows
```

### New Records

```
Add Row → temp ID (temp-${Date.now()}) → pinnedTopRowData
  → Insert Records → entity.insertRecords() → records get real IDs
  → OR Discard → clears newRecords
```

### Delete Records

```
Select rows → Delete Records → confirm → entity.deleteRecords(ids)
```

### Group-By / Master-Detail

```
Select foreign key column → fetch reference entity records
  → Create master rows + hidden detail rows with _groupedRecords
  → Expand toggle: show/hide detail row
  → DetailPanel renders nested AG-Grid of grouped records
```

## Field Type Handling

| Field Type                  | Editor                           | Renderer                  |
| --------------------------- | -------------------------------- | ------------------------- |
| Text (STRING)               | Default text                     | Default                   |
| Multiline Text              | MultilineTextCellEditor          | MultilineTextCellRenderer |
| Number (INT, DECIMAL, etc.) | agNumberCellEditor               | Default                   |
| Date                        | agDateStringCellEditor           | Default                   |
| DateTime                    | N/A (read-only)                  | DateTimeCellRenderer      |
| Boolean                     | agSelectCellEditor (Yes/No/None) | Default                   |
| Choice Set (Single)         | ChoiceSetSingleCellEditor        | Default (via valueGetter) |
| Choice Set (Multiple)       | ChoiceSetMultipleCellEditor      | Default (via valueGetter) |
| Foreign Key                 | RefFieldCellEditor               | Default (via valueGetter) |
| File                        | N/A (read-only)                  | FileCellRenderer          |

## Caching

- **EntityRecordsCache** - Keyed by entityId, populated on group-by and foreign key editor loads.
- **ChoiceSetCache** - Keyed by choiceSetId, populated during initial entity data load.

## Grid Configuration

- **Theme**: themeQuartz
- **Pagination**: Enabled, configurable pageSize (default 50)
- **Default Column**: sortable, filterable, resizable, editable (except in group-by mode)
- **Row Selection**: Multi-row (disabled in group-by mode)
- **Pinned Rows**: New records pinned at top

## Telemetry

| Event                  | Trigger             |
| ---------------------- | ------------------- |
| `DT.EntityDataLoad`    | Entity data loaded  |
| `DT.Refresh`           | Refresh button      |
| `DT.AddRow`            | Add row             |
| `DT.InsertRecords`     | Insert new records  |
| `DT.DiscardNewRecords` | Discard new records |
| `DT.DeleteRow`         | Delete records      |
| `DT.ShowDiff`          | Show diff dialog    |
| `DT.CommitChanges`     | Commit edits        |
| `DT.RevertAll`         | Revert all edits    |
| `DT.RevertField`       | Revert single field |
| `DT.GroupBy`           | Group by column     |
| `DT.FileOpen`          | Open file           |
| `DT.FileDownload`      | Download file       |
| `DT.FileUpload`        | Upload file         |
| `DT.FileRemove`        | Remove file         |

## Testing

Tests in `src/__tests__/` and per-directory `__tests__/` folders using Vitest with Testing Library:

- **Integration tests** (`__tests__/integration.test.tsx`) - Full component rendering and interaction flows.
- **Hook tests** - useEntityData, useRowEditing, useEntityRecordsCache, useChoiceSetCache.
- **Utility tests** - dataUtils, fieldUtils.
- **Component tests** - DetailPanel, FileCellRenderer, DiffDialog, cell editors.

## Key Dependencies

- `ag-grid-community` / `ag-grid-react` - Grid framework
- `@uipath/apollo-wind` - Design system components (Button, Select, Dialog, Toast)
- `@uipath/uipath-typescript` - SDK for entity API
- React 19.2.0+
