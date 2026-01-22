# UiPath UI Widgets

[![Test](https://github.com/uipath/ui-widgets/actions/workflows/test.yml/badge.svg)](https://github.com/uipath/ui-widgets/actions/workflows/test.yml)
[![Build & Deploy](https://github.com/uipath/ui-widgets/actions/workflows/build-and-deploy.yml/badge.svg)](https://github.com/uipath/ui-widgets/actions/workflows/build-and-deploy.yml)
[![Coverage](https://img.shields.io/badge/coverage-85%25-brightgreen.svg)](./coverage)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue.svg)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-19-blue.svg)](https://react.dev/)
[![Storybook](https://img.shields.io/badge/Storybook-10.2-ff4785.svg)](https://storybook.js.org/)

A collection of reusable React UI components for UiPath applications.

## 📦 Packages

### [@uipath/ui-widgets-datatable](./packages/datatable)

A powerful and flexible datatable component with full CRUD support, master-detail views, inline editing, and more.

**Features:**
- ✅ Full CRUD operations (Create, Read, Update, Delete)
- 📊 Master-detail view with grouping
- ✏️ Inline editing with multiple field types
- 🔍 Filtering, sorting, and pagination
- 🎨 Customizable columns and styling
- 🔗 Foreign key relationship support
- 📝 Diff viewer for change review
- ✅ Comprehensive test coverage

### [@uipath/ui-widgets-multi-file-upload](./packages/multi-file-upload)

A multi-file upload component that allows users to select and upload multiple files to a UiPath bucket.

**Features:**
- 📁 Multiple file selection
- ☁️ Upload to UiPath buckets
- ✅ Success/error callbacks
- 🔍 File type filtering
- 📏 File size limits
- 📂 Custom path support

## 🚀 Getting Started

### Installation

```bash
npm install
```

### Development

```bash
# Start development server
npm run dev

# Build all packages
npm run build

# Run linter
npm run lint

# Start Storybook
npm run storybook

# Build Storybook
npm run build-storybook
```

### Testing

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

See [TEST_GUIDE.md](./TEST_GUIDE.md) for comprehensive testing documentation.

## 📚 Storybook

This project uses Storybook for component documentation and development. Storybook provides an interactive UI for viewing and testing components in isolation.

### Running Storybook Locally

```bash
npm run storybook
```

This will start Storybook on [http://localhost:6006](http://localhost:6006).

### Building Storybook

```bash
npm run build-storybook
```

This creates a static build of Storybook in the `storybook-static` directory.

### Deployment

Storybook is automatically deployed to GitHub Pages when changes are pushed to the `main` or `develop` branches. The deployment workflow builds both the packages and Storybook, then publishes the static Storybook site.

To enable GitHub Pages deployment:
1. Go to your repository settings
2. Navigate to Pages
3. Set Source to "GitHub Actions"

## 📁 Project Structure

```
uipath-ui-widgets/
├── packages/
│   └── datatable/          # DataTable component package
│       ├── src/
│       │   ├── components/ # React components
│       │   ├── hooks/      # Custom React hooks
│       │   ├── utils/      # Utility functions
│       │   └── types.ts    # TypeScript types
│       └── package.json
├── samples/                # Sample applications
├── test/                   # Test setup and utilities
│   ├── setup.ts           # Test configuration
│   └── utils/             # Test helpers
├── vitest.config.ts       # Vitest configuration
└── package.json
```

## 🧪 Testing

This project follows testing best practices with comprehensive unit test coverage:

- **Test Framework**: Vitest
- **Testing Library**: React Testing Library
- **Coverage Target**: 80%+ for statements, branches, functions, and lines

Key testing principles:
- ✅ Test behavior, not implementation
- ✅ Use accessible queries
- ✅ Follow AAA pattern (Arrange-Act-Assert)
- ✅ Mock external dependencies
- ✅ Test edge cases and error states

## 🛠️ Tech Stack

- **React 19** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool
- **ag-Grid** - Data grid component
- **Material-UI** - UI components
- **Vitest** - Test runner
- **React Testing Library** - Component testing

## React Compiler

The React Compiler is enabled on this project. See [React Compiler documentation](https://react.dev/learn/react-compiler) for more information.

Note: This will impact Vite dev & build performances.

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...

      // Remove tseslint.configs.recommended and replace with this
      tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```
