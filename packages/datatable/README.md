# @uipath/ui-widgets-datatable

A React datatable component for displaying UiPath Data Fabric Entity records using AG Grid.

## Installation

```bash
npm install @uipath/ui-widgets-datatable
```

## Features

- Automatically fetches entity records from UiPath Data Fabric
- Displays data in a powerful AG Grid table
- Auto-generates columns from entity data
- Built-in sorting, filtering, and resizing
- Optional pagination support
- Loading and error states

## Usage

```tsx
import { DataTable } from '@uipath/ui-widgets-datatable';
import { UiPathSDK } from '@uipath/uipath-typescript';

function App() {
  const uipathSdk = new UiPathSDK({
    // SDK configuration
  });

  return (
    <DataTable
      entityId="your-entity-id"
      uipathSdk={uipathSdk}
      pageSize={50}
      expansionLevel={1}
    />
  );
}
```

## Props

### DataTable

- `entityId` (required): UUID of the entity to fetch records from
- `uipathSdk` (required): UiPath SDK instance
- `className` (optional): Additional CSS class name for styling
- `expansionLevel` (optional): Expansion level for nested data (default: 0)
- `pageSize` (optional): Number of records per page. Enables pagination if provided

## Example with Options

```tsx
<DataTable
  entityId="abc-123-def-456"
  uipathSdk={uipathSdk}
  className="custom-table"
  expansionLevel={2}
  pageSize={100}
/>
```

## AG Grid Styling

The component uses the `ag-theme-alpine` theme. You can customize it by overriding CSS variables or applying your own theme.

## Requirements

- React 19.2.0+
- UiPath TypeScript SDK
- AG Grid React 34.3.1+
