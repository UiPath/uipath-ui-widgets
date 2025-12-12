# @uipath/ui-widgets-datatable

A feature-rich React datatable component for UiPath Data Fabric Entity records, built on ag-Grid Community Edition.

## Installation

```bash
npm install @uipath/ui-widgets-datatable
```

## Features

- **CRUD Operations**: Create, Read, Update, Delete records
- **Master-Detail View**: Expandable row grouping with relationship navigation
- **Cell Editing**: Inline editing with diff visualization and batch updates
- **Batch Operations**: Multiple row selection and bulk delete
- **Auto-generated Columns**: Intelligent column generation from entity schema
- **Sorting & Filtering**: Built-in column sorting and filtering
- **Pagination**: Configurable page sizes
- **Type Safety**: Full TypeScript support with exported types
- **Optimized Bundle**: Minified output (14.96 KB) with tree-shaking support
- **Empty States**: Graceful handling of loading, error, and no-data scenarios

## Quick Start

```tsx
import { DataTable } from '@uipath/ui-widgets-datatable';
import { UiPath } from '@uipath/uipath-typescript';

function App() {
  const sdk = new UiPath({
    // SDK configuration
  });

  return (
    <DataTable
      sdk={sdk}
      entityId="your-entity-id"
      pageSize={50}
    />
  );
}
```

## Props

### DataTable

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `sdk` | `UiPath` | Yes | - | UiPath SDK instance |
| `entityId` | `string` | Yes | - | UUID of the entity to display |
| `pageSize` | `number` | No | `50` | Number of records per page |
| `className` | `string` | No | `'datatable'` | Additional CSS class name |
| `columnConfig` | `Record<string, ColDef>` | No | `{}` | Custom ag-Grid column definitions |
| `rowClassRules` | `RowClassRules` | No | - | Conditional row styling rules |

## Advanced Usage

### Custom Column Configuration

```tsx
<DataTable
  sdk={sdk}
  entityId="abc-123-def-456"
  columnConfig={{
    Name: {
      pinned: 'left',
      width: 200,
      cellStyle: { fontWeight: 'bold' }
    },
    Email: {
      filter: 'agTextColumnFilter'
    }
  }}
/>
```

### Custom Row Styling

```tsx
<DataTable
  sdk={sdk}
  entityId="abc-123-def-456"
  rowClassRules={{
    'row-highlight': (params) => params.data.Status === 'Active',
    'row-disabled': (params) => params.data.IsDeleted
  }}
  className="custom-table"
/>
```

## TypeScript Support

The package exports TypeScript types for custom implementations:

```tsx
import type { DataTableProps, GridRow } from '@uipath/ui-widgets-datatable';

// Use types in your components
const MyComponent: React.FC<DataTableProps> = (props) => {
  // Your implementation
};
```

## Styling

The component uses ag-Grid's `themeQuartz`. Import the package styles in your application:

```tsx
import '@uipath/ui-widgets-datatable/dist/index.css';
```

For custom styling, override CSS variables or add custom classes via the `className` prop.

## Requirements

- React 19.2.0+
- UiPath TypeScript SDK
- AG Grid React 34.3.1+
