# @uipath/ui-widgets-datatable

A powerful and flexible React datatable component built with ag-Grid, designed for UiPath entity management.

## Features

- 🔄 **CRUD Operations**: Full support for Create, Read, Update, Delete operations
- 📊 **Master-Detail View**: Group data by foreign key relationships
- ✏️ **Inline Editing**: Edit cells directly with support for different field types
- 🔍 **Filtering & Sorting**: Built-in filtering and sorting capabilities
- 📄 **Pagination**: Efficient data pagination
- 🎨 **Customizable**: Flexible column configuration and styling
- 🔗 **Foreign Key Support**: Special handling for relationship fields
- 📝 **Diff Viewer**: Review changes before committing
- ✅ **Fully Tested**: Comprehensive unit test coverage

## Installation

```bash
npm install @uipath/ui-widgets-datatable
```

## Usage

```tsx
import { DataTable } from "@uipath/ui-widgets-datatable";
import { UiPath } from "@uipath/uipath-typescript";

function App() {
  const sdk = new UiPath({
    /* config */
  });

  return <DataTable sdk={sdk} entityId="your-entity-id" pageSize={50} />;
}
```

## Props

| Prop            | Type                     | Required | Default | Description                 |
| --------------- | ------------------------ | -------- | ------- | --------------------------- |
| `sdk`           | `UiPath`                 | Yes      | -       | UiPath SDK instance         |
| `entityId`      | `string`                 | Yes      | -       | ID of the entity to display |
| `className`     | `string`                 | No       | `''`    | Additional CSS class name   |
| `pageSize`      | `number`                 | No       | `50`    | Number of rows per page     |
| `columnConfig`  | `Record<string, ColDef>` | No       | -       | Custom column configuration |
| `rowClassRules` | `RowClassRules`          | No       | -       | Custom row styling rules    |

## Features in Detail

### CRUD Operations

#### Create

- Click "Add Row" to add a new row
- Fill in the data
- Click "Insert Records" to save

#### Read

- Data is automatically loaded on mount
- Click "Refresh" to reload data

#### Update

- Click any cell to edit (when not in master-detail mode)
- Changes are tracked automatically
- Click "Show Diff" to review changes
- Click "Commit Changes" to save

#### Delete

- Select rows using checkboxes
- Click "Delete Records"
- Confirm deletion

### Master-Detail View

Group records by foreign key relationships:

1. Select a groupable column from the "Group by" dropdown
2. Click the expand button to view related records
3. Related records are displayed in a nested grid

### Field Types

The datatable automatically handles different field types:

- **Text**: Standard text input
- **Number**: Numeric input
- **Date**: Date picker
- **Foreign Key**: Dropdown with reference entity records

### Custom Column Configuration

```tsx
<DataTable
  sdk={sdk}
  entityId="entity-id"
  columnConfig={{
    "Column Name": {
      width: 200,
      editable: false,
      cellStyle: { color: "blue" },
    },
  }}
/>
```

### Custom Row Styling

```tsx
<DataTable
  sdk={sdk}
  entityId="entity-id"
  rowClassRules={{
    "row-highlight": (params) => params.data.status === "Active",
    "row-disabled": (params) => params.data.status === "Inactive",
  }}
/>
```

## Development

### Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm test -- --watch

# Run tests with UI
npm run test:ui

# Generate coverage report
npm run test:coverage
```

### Building

```bash
npm run build
```

## Architecture

### Components

- **DataTable**: Main component that orchestrates the entire datatable
- **Toolbar**: Action buttons and controls
- **DiffDialog**: Modal for reviewing changes
- **DetailPanel**: Nested grid for master-detail view
- **CellWithExpandButton**: Custom cell renderer with expand/collapse
- **RefFieldCellEditor**: Custom editor for foreign key fields

### Hooks

- **useEntityData**: Manages entity data fetching and column definitions
- **useRowEditing**: Handles row editing state and operations
- **useEntityRecordsCache**: Caches entity records for performance

### Utils

- **dataUtils**: Data manipulation utilities (deepClone, getDiffData, hasRowChanges)
- **fieldUtils**: Field-related utilities (getFieldValue, createValueSetter, createCellEditorSelector)

## Testing

This package includes comprehensive unit tests following best practices:

- **Utils**: 100% coverage of utility functions
- **Hooks**: Full coverage of custom hooks with various scenarios
- **Components**: Component rendering, user interactions, and edge cases

See [TEST_GUIDE.md](../../TEST_GUIDE.md) for detailed testing guidelines.

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## License

MIT

## Contributing

Contributions are welcome! Please follow the testing guidelines and ensure all tests pass before submitting a PR.
